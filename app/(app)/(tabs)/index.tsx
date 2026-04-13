import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { RotateCcw, Sparkles } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useShallow } from "zustand/react/shallow";

import { AppShell } from "@/components/AppShell";
import { ChatInput, type HelperTone } from "@/components/ChatInput";
import { ChatMessageList } from "@/components/ChatMessageList";
import { KeyboardScreenView } from "@/components/KeyboardScreenView";
import { useAuthStore } from "@/modules/auth/useAuthStore";
import { isAssessmentPrompt } from "@/modules/chat/assessmentIntent";
import { useChatStore } from "@/modules/chat/useChatStore";
import type { DocumentSummary } from "@/modules/contracts";
import * as DocumentApi from "@/modules/documents/document.api";
import { useDocumentStore } from "@/modules/documents/useDocumentStore";

const ATTACHMENT_REQUIRED_MESSAGE =
  "Tag a document with @ before requesting a quiz or exam.";

type HelperState = {
  text: string;
  tone: HelperTone;
} | null;

type ActiveDocumentMention = {
  query: string;
  start: number;
  end: number;
};

function getActiveDocumentMention(value: string): ActiveDocumentMention | null {
  const match = /(^|\s)@([^\s@]*)$/.exec(value);

  if (!match) {
    return null;
  }

  const mentionText = `@${match[2] ?? ""}`;
  const start = match.index + match[1].length;

  return {
    query: match[2] ?? "",
    start,
    end: start + mentionText.length,
  };
}

function removeDocumentMention(
  value: string,
  mention: ActiveDocumentMention | null,
) {
  if (!mention) {
    return value;
  }

  const before = value.slice(0, mention.start).trimEnd();
  const after = value.slice(mention.end).trimStart();

  return [before, after].filter(Boolean).join(" ").trim();
}

function filterDocuments(documents: DocumentSummary[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return documents;
  }

  return documents.filter((document) => {
    const title = document.title.toLowerCase();
    const originalFilename = document.originalFilename.toLowerCase();

    return title.includes(normalized) || originalFilename.includes(normalized);
  });
}

export default function HomeScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const threads = useChatStore((state) => state.threads);
  const status = useChatStore((state) => state.status);
  const errorMessage = useChatStore((state) => state.errorMessage);
  const messages = useChatStore(
    useShallow((state) => state.messagesForActiveThread()),
  );
  const loadChats = useChatStore((state) => state.loadChats);
  const startFreshChat = useChatStore((state) => state.startFreshChat);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const contextUsageByChatId = useChatStore(
    (state) => state.contextUsageByChatId,
  );
  const documents = useDocumentStore((state) => state.documents);
  const loadDocuments = useDocumentStore((state) => state.loadDocuments);
  const uploadDocument = useDocumentStore((state) => state.uploadDocument);
  const [composerText, setComposerText] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentSummary | null>(null);
  const [helperState, setHelperState] = useState<HelperState>(null);
  const [forceSuggestionOpen, setForceSuggestionOpen] = useState(false);
  const [remoteSuggestionStatus, setRemoteSuggestionStatus] = useState<
    "idle" | "loading" | "done"
  >("idle");
  const [remoteSuggestionResults, setRemoteSuggestionResults] = useState<
    DocumentSummary[] | null
  >(null);
  const hasConversation = messages.length > 0;
  const isLoading = status === "loading";
  const isSending = status === "sending";
  const activeMention = useMemo(
    () => getActiveDocumentMention(composerText),
    [composerText],
  );
  const showDocumentSuggestions = forceSuggestionOpen || activeMention !== null;
  const localSuggestionResults = useMemo(
    () => filterDocuments(documents, activeMention?.query ?? ""),
    [activeMention?.query, documents],
  );
  const suggestionResults =
    activeMention?.query.trim() && remoteSuggestionResults !== null
      ? remoteSuggestionResults
      : localSuggestionResults;
  const documentSuggestionStatus = !showDocumentSuggestions
    ? "idle"
    : remoteSuggestionStatus === "loading"
      ? "loading"
      : suggestionResults.length > 0
        ? "ready"
        : "empty";
  const previousActiveThreadIdRef = useRef<string | null>(activeThreadId);
  const pendingFreshThreadFromSendRef = useRef(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "85%"], []);
  const searchRequestIdRef = useRef(0);

  const handleOpenHistory = useCallback(() => {
    bottomSheetRef.current?.expand();
    setIsHistoryVisible(true);
  }, []);

  const handleCloseHistory = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsHistoryVisible(false);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsAt={-1}
        appearsAt={0}
        opacity={0.5}
      />
    ),
    [],
  );

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadDocuments(token, { silent: true });
  }, [loadDocuments, token]);

  useEffect(() => {
    if (!showDocumentSuggestions) {
      setRemoteSuggestionStatus("idle");
      setRemoteSuggestionResults(null);
      return;
    }

    const query = activeMention?.query.trim() ?? "";

    if (!token || !query) {
      setRemoteSuggestionStatus("idle");
      setRemoteSuggestionResults(null);
      return;
    }

    setRemoteSuggestionStatus("idle");
    setRemoteSuggestionResults(null);

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const timeoutId = setTimeout(() => {
      setRemoteSuggestionStatus("loading");

      void DocumentApi.listDocuments(token, { documentName: query })
        .then((response) => {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          setRemoteSuggestionResults(response.documents);
          setRemoteSuggestionStatus("done");
        })
        .catch(() => {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          setRemoteSuggestionResults([]);
          setRemoteSuggestionStatus("done");
        });
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeMention?.query, showDocumentSuggestions, token]);

  useEffect(() => {
    if (!selectedDocument) {
      return;
    }

    const nextDocument =
      documents.find((document) => document.id === selectedDocument.id) ?? null;

    if (!nextDocument) {
      setSelectedDocument(null);
      return;
    }

    if (nextDocument !== selectedDocument) {
      setSelectedDocument(nextDocument);
    }
  }, [documents, selectedDocument]);

  useEffect(() => {
    if (composerText.trim().length === 0 && activeMention === null) {
      setForceSuggestionOpen(false);
    }
  }, [activeMention, composerText]);

  useEffect(() => {
    const previousThreadId = previousActiveThreadIdRef.current;

    if (previousThreadId === activeThreadId) {
      return;
    }

    if (
      pendingFreshThreadFromSendRef.current &&
      previousThreadId === null &&
      activeThreadId
    ) {
      pendingFreshThreadFromSendRef.current = false;
      previousActiveThreadIdRef.current = activeThreadId;
      return;
    }

    pendingFreshThreadFromSendRef.current = false;
    previousActiveThreadIdRef.current = activeThreadId;
    setSelectedDocument(null);
    setForceSuggestionOpen(false);
    setHelperState(null);
  }, [activeThreadId]);

  function setComposerDraft(nextValue: string) {
    setComposerText(nextValue);
    setHelperState(null);
    setForceSuggestionOpen(
      (isOpen) =>
        isOpen && !selectedDocument && isAssessmentPrompt(nextValue.trim()),
    );
  }

  function prefillComposer(nextValue: string) {
    setComposerText(nextValue);
    setHelperState(null);
    setForceSuggestionOpen(
      !selectedDocument && isAssessmentPrompt(nextValue.trim()),
    );
  }

  async function handleSend() {
    const trimmed = composerText.trim();

    if (!trimmed) {
      return;
    }

    if (isAssessmentPrompt(trimmed) && !selectedDocument) {
      setHelperState({
        text: ATTACHMENT_REQUIRED_MESSAGE,
        tone: "error",
      });
      setForceSuggestionOpen(true);
      return;
    }

    pendingFreshThreadFromSendRef.current = activeThreadId === null;

    try {
      await sendMessage({
        content: trimmed,
        ...(selectedDocument
          ? {
              documentId: selectedDocument.id,
              document: {
                id: selectedDocument.id,
                title: selectedDocument.title,
                sourceType: selectedDocument.sourceType,
              },
            }
          : {}),
      });
      setComposerText("");
      setSelectedDocument(null);
      setHelperState(null);
      setForceSuggestionOpen(false);
    } catch {
      pendingFreshThreadFromSendRef.current = false;
    }
  }

  async function handleAttach() {
    if (!token) {
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      await uploadDocument(token, {
        uri: asset.uri,
        name: asset.name,
        file: asset.file,
        mimeType:
          asset.mimeType ||
          (asset.name.toLowerCase().endsWith(".pdf")
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      });
      setHelperState({
        text: "Upload accepted. Tag it with @ after processing completes.",
        tone: "success",
      });
    } catch (error) {
      setHelperState({
        text:
          error instanceof Error ? error.message : "Document upload failed.",
        tone: "error",
      });
    }
  }

  function handleSelectDocument(document: DocumentSummary) {
    setSelectedDocument(document);
    setComposerText((currentValue) =>
      removeDocumentMention(
        currentValue,
        getActiveDocumentMention(currentValue),
      ),
    );
    setHelperState({
      text: `${document.title} attached.`,
      tone: "success",
    });
    setForceSuggestionOpen(false);
  }

  const helperText =
    helperState?.text ??
    errorMessage ??
    (isSending
      ? "NedAI is replying..."
      : isLoading
        ? "Syncing chats from the server..."
        : "Type @ to tag an uploaded document.");
  const helperTone = helperState?.tone ?? (errorMessage ? "error" : "neutral");

  return (
    <AppShell
      title="Chat"
      onHistory={handleOpenHistory}
      onNewChat={() => {
        pendingFreshThreadFromSendRef.current = false;
        setComposerText("");
        setSelectedDocument(null);
        setHelperState(null);
        setForceSuggestionOpen(false);
        startFreshChat();
        router.replace("/");
      }}
    >
      <KeyboardScreenView style={styles.flex}>
        <View style={styles.flex}>
          <View style={styles.body}>
            {hasConversation ? (
              <ChatMessageList messages={messages} />
            ) : isLoading && threads.length > 0 ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Loading conversation...</Text>
              </View>
            ) : (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.centerArea}>
                  <View style={styles.logoContainer}>
                    <View style={styles.iconCircle}>
                      <Sparkles
                        size={42}
                        color="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.15}
                      />
                    </View>
                  </View>

                  <Text style={styles.welcomeText}>
                    What would you like to work on today?
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>

          <ChatInput
            disabled={isSending}
            value={composerText}
            onChangeText={setComposerDraft}
            onAttach={() => {
              void handleAttach();
            }}
            onSend={() => {
              void handleSend();
            }}
            helperText={helperText}
            helperTone={helperTone}
            selectedDocument={selectedDocument}
            onClearSelectedDocument={() => {
              setSelectedDocument(null);
              setHelperState(null);
            }}
            showDocumentSuggestions={showDocumentSuggestions}
            documentSuggestions={suggestionResults}
            documentSuggestionStatus={documentSuggestionStatus}
            onSelectDocument={handleSelectDocument}
            contextUsage={
              activeThreadId ? (contextUsageByChatId[activeThreadId] ?? 0) : 0
            }
          />
        </View>
      </KeyboardScreenView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={() => setIsHistoryVisible(false)}
        handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
        backgroundStyle={{ backgroundColor: "#F8FAFC" }}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>History</Text>
            <TouchableOpacity
              onPress={() => {
                if (token) {
                  void loadChats(token);
                }
              }}
              activeOpacity={0.7}
              style={styles.modalHeaderButton}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <RotateCcw size={16} color="#3B82F6" />
              )}
              <Text style={styles.modalClose}>
                {status === "loading" ? "Refreshing..." : "Refresh"}
              </Text>
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            refreshControl={
              <RefreshControl
                refreshing={status === "loading"}
                onRefresh={() => {
                  if (token) {
                    void loadChats(token);
                  }
                }}
              />
            }
          >
            {threads.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No chat history yet.</Text>
              </View>
            ) : (
              threads.map((thread) => (
                <TouchableOpacity
                  key={thread.id}
                  style={styles.modalItem}
                  onPress={() => {
                    void useChatStore.getState().selectThread(thread.id);
                    handleCloseHistory();
                  }}
                >
                  <View style={styles.modalItemIcon}>
                    <Sparkles size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.modalItemBody}>
                    <Text style={styles.modalItemTitle} numberOfLines={1}>
                      {thread.title || "Untitled Chat"}
                    </Text>
                    <Text style={styles.modalItemMeta}>
                      {new Date(thread.lastMessageAt).toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingBottom: 8,
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F8FAFC",
  },
  iconCircle: {
    backgroundColor: "rgba(239, 246, 255, 0.3)",
    padding: 16,
    borderRadius: 9999,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 36,
  },
  chipsWrapper: {
    width: "100%",
  },
  chipsContent: {
    paddingHorizontal: 0,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "500",
  },
  modalRoot: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  modalClose: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 6,
  },
  modalHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  modalItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modalItemBody: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  modalItemMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 16,
  },
});
