import { Menu, SquarePen } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useUIStore } from "@/hooks/useUIStore";

export function Header({
  title,
  onNewChat,
}: {
  title: string;
  onNewChat?: () => void;
}) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleSidebar} activeOpacity={0.7}>
        <Menu size={24} color="#374151" strokeWidth={2} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity activeOpacity={0.7} onPress={onNewChat}>
        <SquarePen size={24} color="#374151" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
});
