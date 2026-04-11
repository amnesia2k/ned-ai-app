import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Sparkles } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";

import { AppShell } from "@/components/AppShell";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessageList } from "@/components/ChatMessageList";
import { KeyboardScreenView } from "@/components/KeyboardScreenView";
import { SuggestionChip } from "@/components/SuggestionChip";
import { useAuthStore } from "@/modules/auth/useAuthStore";
import { useChatStore } from "@/modules/chat/useChatStore";
import { useDocumentStore } from "@/modules/documents/useDocumentStore";

export default function HomeScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const threads = useChatStore((state) => state.threads);
  const status = useChatStore((state) => state.status);
  const errorMessage = useChatStore((state) => state.errorMessage);
  const messages = useChatStore(
    useShallow((state) => state.messagesForActiveThread()),
  );
  const loadChats = useChatStore((state) => state.loadChats);
  const startFreshChat = useChatStore((state) => state.startFreshChat);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const uploadDocument = useDocumentStore((state) => state.uploadDocument);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const hasConversation = messages.length > 0;
  const isLoading = status === "loading";
  const isSending = status === "sending";

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  async function handleSend(text: string) {
    try {
      await sendMessage(text);
    } catch {}
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
      setUploadMessage(
        "Upload accepted. NedAI will use the file after processing finishes.",
      );
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "Document upload failed.",
      );
    }
  }

  return (
    <AppShell
      title="Chat"
      onNewChat={() => {
        startFreshChat();
        router.replace("/(app)");
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

                  <View style={styles.chipsWrapper}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipsContent}
                    >
                      <SuggestionChip
                        label="Create a chemistry quiz"
                        onPress={() => {
                          void handleSend(
                            "Give me a 5-question multiple-choice quiz on my uploaded Chemistry PDF.",
                          );
                        }}
                      />
                      <SuggestionChip
                        label="Explain a formula"
                        onPress={() => {
                          void handleSend(
                            "Explain the quadratic formula and show the derivation.",
                          );
                        }}
                      />
                      <SuggestionChip
                        label="Use my timetable"
                        onPress={() => {
                          void handleSend(
                            "Use my timetable and suggest what I should focus on today.",
                          );
                        }}
                      />
                      <SuggestionChip
                        label="Summarize my PDF"
                        onPress={() => {
                          void handleSend(
                            "Summarize the key concepts from my uploaded document.",
                          );
                        }}
                      />
                    </ScrollView>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>

          <ChatInput
            disabled={isSending}
            onAttach={() => {
              void handleAttach();
            }}
            onSend={(message) => {
              void handleSend(message);
            }}
            helperText={
              uploadMessage
                ? uploadMessage
                : errorMessage
                ? errorMessage
                : isSending
                  ? "NedAI is replying..."
                  : isLoading
                    ? "Syncing chats from the server..."
                    : "Messages are sent directly to the server."
            }
          />
        </View>
      </KeyboardScreenView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  activeBanner: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
});
