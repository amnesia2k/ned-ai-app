import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function TypingBubble() {
  const dotAnimations = useRef(
    [0, 1, 2].map(() => new Animated.Value(0.35)),
  ).current;

  useEffect(() => {
    const loops = dotAnimations.map((animation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(animation, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0.35,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [dotAnimations]);

  return (
    <View style={styles.bubble}>
      {dotAnimations.map((animation, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              opacity: animation,
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.92, 1.08],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#94A3B8",
  },
});
