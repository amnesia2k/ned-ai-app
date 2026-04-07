import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const LOGO_ASSET = require("../assets/images/nedai-logo.png");

export function SplashScreen() {
  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      style={styles.container}
    >
      <View style={styles.centerContent}>
        <View style={styles.logoBox}>
          <Image source={LOGO_ASSET} style={styles.logo} contentFit="contain" />
        </View>

        <Text style={styles.title}>NedAI</Text>
        <Text style={styles.subtitle}>INTELLIGENCE & CONNECTION</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  centerContent: {
    alignItems: "center",
    marginBottom: 100,
  },
  logoBox: {
    width: 160,
    height: 160,
    backgroundColor: "#0F1E21",
    borderRadius: 24,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#312E81",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#93C5FD",
    letterSpacing: 4,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
