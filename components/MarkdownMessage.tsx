import Markdown from "@ronradtke/react-native-markdown-display";
import React from "react";
import { Linking, StyleSheet } from "react-native";

type Props = {
  content: string;
};

export function MarkdownMessage({ content }: Props) {
  return (
    <Markdown
      style={styles}
      onLinkPress={(url) => {
        void Linking.openURL(url);
        return false;
      }}
    >
      {content}
    </Markdown>
  );
}

const styles = StyleSheet.create({
  body: {
    margin: 0,
  },
  text: {
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 23,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
  },
  strong: {
    fontWeight: "700",
    color: "#020617",
  },
  em: {
    fontStyle: "italic",
  },
  heading1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: "#020617",
    marginTop: 0,
    marginBottom: 12,
  },
  heading2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#020617",
    marginTop: 0,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#020617",
    marginTop: 0,
    marginBottom: 8,
  },
  heading4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#020617",
    marginTop: 0,
    marginBottom: 8,
  },
  bullet_list: {
    marginTop: 0,
    marginBottom: 12,
  },
  ordered_list: {
    marginTop: 0,
    marginBottom: 12,
  },
  list_item: {
    marginBottom: 6,
  },
  blockquote: {
    marginTop: 0,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderLeftWidth: 3,
    borderLeftColor: "#93C5FD",
  },
  code_inline: {
    color: "#1E293B",
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  code_block: {
    marginTop: 0,
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    color: "#0F172A",
  },
  fence: {
    marginTop: 0,
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    color: "#0F172A",
  },
  link: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  hr: {
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: "#E2E8F0",
  },
});
