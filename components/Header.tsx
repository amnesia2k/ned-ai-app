import { History, Sparkles, SquarePen } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function Header({
  title,
  onNewChat,
  onHistory,
}: {
  title: string;
  onNewChat?: () => void;
  onHistory?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.titleGroup}>
        <View style={styles.badge}>
          <Sparkles size={18} color="#1D4ED8" strokeWidth={2.2} />
        </View>
        <View>
          <Text style={styles.eyebrow}>NedAI Workspace</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onHistory && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onHistory}
            style={styles.historyButton}
          >
            <History size={18} color="#64748B" strokeWidth={2} />
            <Text style={styles.historyText}>History</Text>
          </TouchableOpacity>
        )}

        {onNewChat ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNewChat}
            style={styles.actionButton}
          >
            <SquarePen size={18} color="#0F172A" strokeWidth={2.2} />
            <Text style={styles.actionText}>New Chat</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: "#F8FAFC",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#DBEAFE",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#64748B",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 6,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  actionPlaceholder: {
    width: 92,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 99,
    backgroundColor: "#F1F5F9",
  },
  historyText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
});
