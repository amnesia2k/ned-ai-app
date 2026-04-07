import { Menu, SquarePen } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useUIStore } from "@/hooks/useUIStore";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Header({ onNewChat }: { onNewChat?: () => void }) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={toggleSidebar} activeOpacity={0.7}>
        <Menu size={24} color="#374151" strokeWidth={2} />
      </TouchableOpacity>

      <Text style={styles.title}>NedAI</Text>

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
    paddingVertical: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
});
