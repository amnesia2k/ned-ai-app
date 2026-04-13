import { FileText, Sparkles } from "lucide-react-native";
import React, { useCallback, useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { MarkdownMessage } from "@/components/MarkdownMessage";
import { TypingBubble } from "@/components/TypingBubble";
import type { ChatMessage } from "@/modules/contracts";

type Props = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, [messages.length, scrollToBottom]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => {
        scrollToBottom();
      }}
      onLayout={() => {
        if (messages.length > 0) {
          scrollToBottom(false);
        }
      }}
    >
      {messages.map((message) => {
        const isUser = message.role === "user";
        const isPendingAssistant =
          message.role === "assistant" &&
          message.deliveryState === "pending" &&
          message.content === "";
        const assistantStatus = message.grounded
          ? "Grounded in study material"
          : message.usedGeneralKnowledge
            ? "Answered from general knowledge"
            : null;

        return (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              isUser ? styles.userRow : styles.assistantRow,
            ]}
          >
            {isUser ? (
              <View style={styles.userMessageWrap}>
                <View
                  style={[
                    styles.userBubble,
                    message.deliveryState === "failed" &&
                      styles.failedUserBubble,
                  ]}
                >
                  <Text style={styles.userText}>{message.content}</Text>
                  {message.document ? (
                    <View style={styles.attachedDocument}>
                      <View style={styles.attachedDocumentIcon}>
                        <FileText size={14} color="#2563EB" strokeWidth={2.5} />
                      </View>
                      <View style={styles.attachedDocumentTextWrap}>
                        <Text
                          style={styles.attachedDocumentTitle}
                          numberOfLines={1}
                        >
                          {message.document.title}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
                {message.deliveryState === "failed" ? (
                  <Text style={styles.failedLabel}>Not sent</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.assistantMessageRow}>
                <View style={styles.assistantAvatar}>
                  <Sparkles size={16} color="#2563EB" />
                </View>
                <View style={styles.assistantContent}>
                  {isPendingAssistant ? (
                    <TypingBubble />
                  ) : (
                    <MarkdownMessage content={message.content} />
                  )}
                  {assistantStatus &&
                  (message.sources?.length || message.usedGeneralKnowledge) ? (
                    <Text style={styles.assistantStatus}>
                      {assistantStatus}
                    </Text>
                  ) : null}
                  {message.sources?.length ? (
                    <View style={styles.sourcesCard}>
                      {message.sources.map((source, index) => (
                        <View key={`${message.id}-${index}`}>
                          <Text style={styles.sourceSubject}>
                            {source.subject}
                          </Text>
                          <Text style={styles.sourceLesson}>
                            {source.lessonTitle}
                          </Text>
                          <Text style={styles.sourcePath}>
                            {source.sourcePath}
                            {source.pageNumber !== undefined
                              ? ` • Page ${source.pageNumber}`
                              : ""}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  messageRow: {
    marginBottom: 22,
  },
  userRow: {
    alignItems: "flex-end",
  },
  assistantRow: {
    alignItems: "flex-start",
  },
  userMessageWrap: {
    maxWidth: "85%",
    alignItems: "flex-end",
  },
  userBubble: {
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  failedUserBubble: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  userText: {
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 21,
  },
  failedLabel: {
    marginTop: 8,
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  assistantMessageRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  assistantAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  assistantContent: {
    flex: 1,
  },
  assistantStatus: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
  },
  sourcesCard: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    gap: 10,
  },
  sourceSubject: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
  sourceLesson: {
    color: "#334155",
    fontSize: 13,
    marginTop: 2,
  },
  sourcePath: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },
  attachedDocument: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  attachedDocumentIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  attachedDocumentTextWrap: {
    flexShrink: 1,
  },
  attachedDocumentTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E3A8A",
  },
});
