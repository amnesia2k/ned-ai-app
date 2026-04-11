import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({
  title,
  onNewChat,
  children,
}: {
  title: string;
  onNewChat?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <Header title={title} onNewChat={onNewChat} />
        <View style={styles.body}>{children}</View>
      </SafeAreaView>
      <Sidebar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  body: {
    flex: 1,
  },
});
