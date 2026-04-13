import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PermissionRationaleModal } from "@/components/PermissionRationaleModal";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/modules/auth/useAuthStore";
import { useChatStore } from "@/modules/chat/useChatStore";
import { useDocumentStore } from "@/modules/documents/useDocumentStore";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgeVaultScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const startFreshChat = useChatStore((state) => state.startFreshChat);
  const documents = useDocumentStore((state) => state.documents);
  const quota = useDocumentStore((state) => state.quota);
  const status = useDocumentStore((state) => state.status);
  const errorMessage = useDocumentStore((state) => state.errorMessage);
  const loadDocuments = useDocumentStore((state) => state.loadDocuments);
  const uploadDocument = useDocumentStore((state) => state.uploadDocument);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);
  const uploadProgress = useDocumentStore((state) => state.uploadProgress);

  const {
    showRationale,
    checkAndRequestPermission,
    handleContinue,
    handleNotNow,
  } = usePermissions();

  useEffect(() => {
    if (token) {
      void loadDocuments(token);
    }
  }, [loadDocuments, token]);

  async function handleUpload() {
    if (!token) {
      return;
    }

    const isGranted = await checkAndRequestPermission();
    if (!isGranted) {
      return;
    }

    await openPicker();
  }

  async function openPicker() {
    if (!token) {
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    try {
      await uploadDocument(token, {
        uri: asset.uri,
        name: asset.name,
        file: asset.file,
        mimeType:
          asset.mimeType ||
          (asset.name.toLowerCase().endsWith(".pdf")
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      });
    } catch {}
  }

  return (
    <AppShell
      title="Knowledge Vault"
      onNewChat={() => {
        startFreshChat();
        router.replace("/");
      }}
    >
      <ScrollView
        className="flex-1 bg-slate-50"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={status === "loading"}
            onRefresh={() => {
              if (token) {
                void loadDocuments(token);
              }
            }}
          />
        }
      >
        <View className="rounded-3xl bg-slate-900 p-5">
          <Text className="text-lg font-semibold text-white">
            Uploaded files
          </Text>
          <Text className="mt-2 text-sm leading-6 text-slate-300">
            Upload PDF or DOCX files and manage them from one list.
          </Text>
          {quota ? (
            <Text className="mt-3 text-sm text-slate-200">
              {quota.usedDocuments}/{quota.maxDocuments} documents,{" "}
              {formatBytes(quota.usedBytes)}/{formatBytes(quota.maxBytes)} used
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => {
            void handleUpload();
          }}
          disabled={status === "uploading"}
          className={`mt-4 overflow-hidden rounded-2xl px-4 py-4 ${
            status === "uploading" ? "bg-slate-200" : "bg-blue-600"
          }`}
        >
          {status === "uploading" && (
            <View
              style={{ width: `${uploadProgress}%` }}
              className="absolute bottom-0 left-0 top-0 bg-blue-600"
            />
          )}
          <Text
            className="text-center text-base font-semibold text-white"
            style={
              status === "uploading"
                ? { textShadowColor: "rgba(0,0,0,0.2)", textShadowRadius: 2 }
                : undefined
            }
          >
            {status === "uploading"
              ? `Uploading ${uploadProgress}%`
              : "Upload File"}
          </Text>
        </Pressable>

        {errorMessage ? (
          <Text className="mt-3 text-sm text-rose-600">{errorMessage}</Text>
        ) : null}

        <View className="mt-6">
          {documents.length > 0 ? (
            documents.map((document) => (
              <View
                key={document.id}
                className="mb-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <View className="flex-row items-start justify-between">
                  <View className="mr-3 flex-1">
                    <Text className="text-base font-semibold text-slate-900">
                      {document.title}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">
                      {document.originalFilename}
                    </Text>
                    <Text className="mt-2 text-xs text-slate-400">
                      {document.sourceType} - {formatBytes(document.byteSize)}
                    </Text>
                  </View>
                  <StatusBadge status={document.status} />
                </View>

                {document.processingError ? (
                  <Text className="mt-3 text-sm text-rose-600">
                    {document.processingError}
                  </Text>
                ) : null}

                <Pressable
                  onPress={() => {
                    if (token) {
                      void deleteDocument(token, document.id);
                    }
                  }}
                  className="mt-4 self-start rounded-full bg-rose-100 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-rose-700">
                    Delete
                  </Text>
                </Pressable>
              </View>
            ))
          ) : (
            <View className="rounded-2xl border border-dashed border-slate-200 px-4 py-5">
              <Text className="text-sm text-slate-500">
                Your uploaded PDFs and DOCX files will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <PermissionRationaleModal
        isVisible={showRationale}
        onContinue={async () => {
          const granted = await handleContinue();
          if (granted) {
            void openPicker();
          }
        }}
        onNotNow={handleNotNow}
      />
    </AppShell>
  );
}
