import { ArrowUp, Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  disabled?: boolean;
  helperText?: string;
  onSend?: (message: string) => void;
  onAttach?: () => void;
};

export function ChatInput({
  disabled = false,
  helperText,
  onSend,
  onAttach,
}: Props) {
  const [message, setMessage] = useState("");

  function handleSend() {
    const trimmed = message.trim();

    if (!trimmed || disabled) {
      return;
    }

    onSend?.(trimmed);
    setMessage("");
  }

  return (
    <View style={styles.wrapper}>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.7} onPress={onAttach} disabled={disabled}>
          <Plus size={24} color="#94A3B8" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message NedAI..."
            placeholderTextColor="#94A3B8"
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!disabled}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  message.trim() && !disabled ? "#0F172A" : "#CBD5E1",
              },
            ]}
            onPress={handleSend}
          >
            <ArrowUp size={20} color="white" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "white",
  },
  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: "#1E293B",
    fontSize: 16,
    paddingVertical: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
