import { Sparkles } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { ChatInput } from "@/components/ChatInput";
import { ChatMessageList } from "@/components/ChatMessageList";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SuggestionChip } from "@/components/SuggestionChip";
import { useChatStore } from "@/modules/chat/useChatStore";

export default function HomeScreen() {
  const threads = useChatStore((state) => state.threads);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const status = useChatStore((state) => state.status);
  const errorMessage = useChatStore((state) => state.errorMessage);
  const messages = useChatStore(
    useShallow((state) => state.messagesForActiveThread()),
  );
  const loadChats = useChatStore((state) => state.loadChats);
  const startFreshChat = useChatStore((state) => state.startFreshChat);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const hasConversation = Boolean(activeThreadId && messages.length > 0);
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

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.flex}>
            <Header onNewChat={startFreshChat} />

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
                          label="Plan my study session"
                          onPress={() => {
                            void handleSend("Plan my study session for this week");
                          }}
                        />
                        <SuggestionChip
                          label="Draft welcome text"
                          onPress={() => {
                            void handleSend(
                              "Draft a welcome message for new users joining the app",
                            );
                          }}
                        />
                        <SuggestionChip
                          label="Summarize notes"
                          onPress={() => {
                            void handleSend(
                              "Summarize my meeting notes into three key points",
                            );
                          }}
                        />
                        <SuggestionChip
                          label="Organize todos"
                          onPress={() => {
                            void handleSend(
                              "Help me organize my tasks for the afternoon",
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
              onSend={(message) => {
                void handleSend(message);
              }}
              helperText={
                errorMessage
                  ? errorMessage
                  : isSending
                    ? "Waiting for NedAI to respond..."
                    : isLoading
                      ? "Syncing chats from the server..."
                      : "Messages are sent directly to the server."
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Sidebar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "white",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
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
    paddingHorizontal: 4,
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
