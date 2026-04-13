import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
};

export function KeyboardScreenView({
  children,
  style,
  keyboardVerticalOffset,
}: Props) {
  const behavior = Platform.OS === "ios" ? "padding" : undefined;
  // Default offset accounts for the custom Header in AppShell (approx 68px)
  const defaultOffset = Platform.OS === "ios" ? 68 : 0;
  const offset = keyboardVerticalOffset ?? defaultOffset;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={behavior}
      keyboardVerticalOffset={offset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
