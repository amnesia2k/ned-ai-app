import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SuggestionChipProps {
  label: string;
  onPress?: () => void;
}

export function SuggestionChip({ label, onPress }: SuggestionChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.chip}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    color: "#1E293B",
    fontWeight: "500",
    fontSize: 14,
  },
});
