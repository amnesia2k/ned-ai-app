import { Sparkles } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";

import type { ChatMessage } from "@/modules/contracts";

type Props = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: Props) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((message) => {
        const isUser = message.role === "user";
        const assistantStatus = message.grounded
          ? "Grounded in study material"
          : message.usedGeneralKnowledge
            ? "Answered from general knowledge"
            : null;

        return (
          <View
            key={message.id}
            style={{
              marginBottom: 22,
              alignItems: isUser ? "flex-end" : "flex-start",
            }}
          >
            {isUser ? (
              <View
                style={{
                  maxWidth: "85%",
                  backgroundColor: "#E2E8F0",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: "#0F172A", fontSize: 15, lineHeight: 21 }}>
                  {message.content}
                </Text>
              </View>
            ) : (
              <View style={{ width: "100%", flexDirection: "row", gap: 12 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: "#DBEAFE",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  <Sparkles size={16} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#0F172A", fontSize: 15, lineHeight: 23 }}>
                    {message.content}
                  </Text>
                  {assistantStatus ? (
                    <Text
                      style={{
                        color: "#2563EB",
                        fontSize: 12,
                        fontWeight: "600",
                        marginTop: 10,
                      }}
                    >
                      {assistantStatus}
                    </Text>
                  ) : null}
                  {message.sources?.length ? (
                    <View
                      style={{
                        marginTop: 12,
                        borderRadius: 16,
                        backgroundColor: "#F8FAFC",
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        padding: 12,
                        gap: 10,
                      }}
                    >
                      {message.sources.map((source, index) => (
                        <View key={`${message.id}-${index}`}>
                          <Text
                            style={{
                              color: "#0F172A",
                              fontSize: 13,
                              fontWeight: "700",
                            }}
                          >
                            {source.subject}
                          </Text>
                          <Text
                            style={{
                              color: "#334155",
                              fontSize: 13,
                              marginTop: 2,
                            }}
                          >
                            {source.lessonTitle}
                          </Text>
                          <Text
                            style={{
                              color: "#64748B",
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
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
