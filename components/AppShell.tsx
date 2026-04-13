import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";

export function AppShell({
  title,
  onNewChat,
  onHistory,
  children,
}: {
  title: string;
  onNewChat?: () => void;
  onHistory?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header title={title} onNewChat={onNewChat} onHistory={onHistory} />
        <View style={styles.body}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  body: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});
