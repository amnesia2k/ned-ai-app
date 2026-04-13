import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { ArrowUp, FileText, Plus, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circle, Svg } from "react-native-svg";

import type { DocumentSummary } from "@/modules/contracts";

export type DocumentSuggestionStatus = "idle" | "loading" | "ready" | "empty";
export type HelperTone = "neutral" | "success" | "error";

type Props = {
  disabled?: boolean;
  value: string;
  helperText?: string;
  helperTone?: HelperTone;
  onChangeText: (message: string) => void;
  onSend?: () => void;
  onAttach?: () => void;
  selectedDocument?: DocumentSummary | null;
  onClearSelectedDocument?: () => void;
  showDocumentSuggestions?: boolean;
  documentSuggestions?: DocumentSummary[];
  documentSuggestionStatus?: DocumentSuggestionStatus;
  onSelectDocument?: (document: DocumentSummary) => void;
  contextUsage?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

function getDocumentStatusDescription(document: DocumentSummary) {
  if (document.status === "PROCESSING" || document.status === "UPLOADED") {
    return "Processing. Wait before attaching.";
  }

  if (document.status === "FAILED") {
    return document.processingError || "Processing failed. Re-upload or retry.";
  }

  return `${document.sourceType} file`;
}

function getHelperColor(tone: HelperTone) {
  if (tone === "error") {
    return "#DC2626";
  }

  if (tone === "success") {
    return "#15803D";
  }

  return "#64748B";
}

export function ChatInput({
  disabled = false,
  value,
  helperText,
  helperTone = "neutral",
  onChangeText,
  onSend,
  onAttach,
  selectedDocument,
  onClearSelectedDocument,
  showDocumentSuggestions = false,
  documentSuggestions = [],
  documentSuggestionStatus = "idle",
  onSelectDocument,
  contextUsage = 0,
  containerStyle,
}: Props) {
  const hasSendableText = value.trim().length > 0 && !disabled;
  const hasSuggestions = documentSuggestions.length > 0;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 16),
        },
        containerStyle,
      ]}
    >
      {selectedDocument ? (
        <View style={styles.selectedDocumentChip}>
          <View style={styles.selectedDocumentMeta}>
            <View style={styles.selectedDocumentIcon}>
              <FileText size={16} color="#2563EB" strokeWidth={2.2} />
            </View>
            <View style={styles.selectedDocumentTextWrap}>
              <Text style={styles.selectedDocumentTitle} numberOfLines={1}>
                {selectedDocument.title}
              </Text>
              <Text style={styles.selectedDocumentSubtitle} numberOfLines={1}>
                {selectedDocument.sourceType} attached
              </Text>
            </View>
          </View>
          <Pressable
            hitSlop={8}
            onPress={onClearSelectedDocument}
            style={styles.clearSelectionButton}
          >
            <X size={16} color="#64748B" strokeWidth={2.4} />
          </Pressable>
        </View>
      ) : null}

      {helperText ? (
        <Text
          style={[styles.helperText, { color: getHelperColor(helperTone) }]}
        >
          {helperText}
        </Text>
      ) : null}

      {showDocumentSuggestions ? (
        <View style={styles.suggestionsCard}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Attach a document</Text>
            {documentSuggestionStatus === "loading" ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : null}
          </View>

          {hasSuggestions ? (
            <ScrollView
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {documentSuggestions.map((document) => {
                const isSelectable = document.status === "READY";

                return (
                  <TouchableOpacity
                    key={document.id}
                    activeOpacity={isSelectable ? 0.72 : 1}
                    disabled={!isSelectable}
                    onPress={() => {
                      if (isSelectable) {
                        onSelectDocument?.(document);
                      }
                    }}
                    style={[
                      styles.suggestionRow,
                      !isSelectable && styles.suggestionRowDisabled,
                    ]}
                  >
                    <View style={styles.suggestionIcon}>
                      <FileText
                        size={16}
                        color={isSelectable ? "#2563EB" : "#94A3B8"}
                        strokeWidth={2.2}
                      />
                    </View>
                    <View style={styles.suggestionTextWrap}>
                      <Text style={styles.suggestionTitle} numberOfLines={1}>
                        {document.title}
                      </Text>
                      <Text style={styles.suggestionSubtitle} numberOfLines={2}>
                        {getDocumentStatusDescription(document)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.suggestionBadge,
                        isSelectable
                          ? styles.suggestionBadgeReady
                          : styles.suggestionBadgeDisabled,
                      ]}
                    >
                      {document.status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.emptySuggestionsText}>
              {documentSuggestionStatus === "loading"
                ? "Searching your uploaded documents..."
                : documentSuggestionStatus === "empty"
                  ? "No matching documents found. Try another name or upload one with +."
                  : "No uploaded documents yet. Use + to upload a PDF or DOCX file."}
            </Text>
          )}
        </View>
      ) : null}

      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAttach}
          disabled={disabled}
          style={styles.attachButton}
        >
          <Plus size={24} color="#94A3B8" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message NedAI..."
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
            multiline
            editable={!disabled}
          />

            <ContextUsageIndicator usage={contextUsage} />
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.sendButton,
                {
                  backgroundColor: hasSendableText ? "#0F172A" : "#CBD5E1",
                },
              ]}
              onPress={onSend}
              disabled={!hasSendableText}
            >
              <ArrowUp size={20} color="white" strokeWidth={3} />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const ContextUsageIndicator = ({ usage }: { usage: number }) => {
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (usage / 100) * circumference;

  let color = "#10B981"; // Green
  if (usage > 80) color = "#EF4444"; // Red
  else if (usage > 50) color = "#F59E0B"; // Amber

  return (
    <View style={styles.indicatorContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.indicatorTextContainer}>
        <Text style={[styles.indicatorText, { color }]}>{usage}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "white",
  },
  helperText: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
  selectedDocumentChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  selectedDocumentMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  selectedDocumentIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DBEAFE",
    marginRight: 10,
  },
  selectedDocumentTextWrap: {
    flex: 1,
  },
  selectedDocumentTitle: {
    color: "#1E3A8A",
    fontSize: 14,
    fontWeight: "700",
  },
  selectedDocumentSubtitle: {
    color: "#2563EB",
    fontSize: 12,
    marginTop: 2,
  },
  clearSelectionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  suggestionsCard: {
    maxHeight: 240,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  suggestionsTitle: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
  suggestionsList: {
    maxHeight: 190,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  suggestionRowDisabled: {
    opacity: 0.72,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    marginRight: 10,
  },
  suggestionTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  suggestionTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionSubtitle: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  suggestionBadge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "700",
  },
  suggestionBadgeReady: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },
  suggestionBadgeDisabled: {
    backgroundColor: "#E2E8F0",
    color: "#475569",
  },
  emptySuggestionsText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  attachButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorTextContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorText: {
    fontSize: 9,
    fontWeight: "700",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 8,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: "#1E293B",
    fontSize: 16,
    maxHeight: 120,
    paddingTop: Platform.OS === "ios" ? 8 : 4,
    paddingBottom: Platform.OS === "ios" ? 8 : 4,
    paddingRight: 12,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
});
