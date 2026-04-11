import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function KeyboardScreenView({ children, style }: Props) {
  const behavior = Platform.OS === "ios" ? "padding" : "padding";
  const offset = Platform.OS === "ios" ? 0 : 64;

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
