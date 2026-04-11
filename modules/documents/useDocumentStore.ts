import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isApiClientError } from "@/lib/http";
import * as DocumentApi from "@/modules/documents/document.api";
import type { DocumentQuota, DocumentSummary } from "@/modules/contracts";

type DocumentStore = {
  hydrated: boolean;
  status: "idle" | "loading" | "uploading" | "error";
  errorMessage: string | null;
  documents: DocumentSummary[];
  quota: DocumentQuota | null;
  loadDocuments: (
    token: string,
    options?: { silent?: boolean },
  ) => Promise<void>;
  uploadDocument: (
    token: string,
    file: { uri: string; name: string; mimeType: string },
  ) => Promise<void>;
  deleteDocument: (
    token: string,
    documentId: string,
  ) => Promise<void>;
  reprocessDocument: (token: string, documentId: string) => Promise<void>;
  clearError: () => void;
  resetSession: () => void;
  markHydrated: () => void;
};

function getErrorMessage(error: unknown) {
  if (isApiClientError(error)) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      status: "idle",
      errorMessage: null,
      documents: [],
      quota: null,
      loadDocuments: async (token, options) => {
        const silent = options?.silent === true;

        if (!silent) {
          set({ status: "loading", errorMessage: null });
        }

        try {
          const response = await DocumentApi.listDocuments(token);
          set((state) => ({
            status:
              silent && state.status === "uploading" ? "uploading" : "idle",
            errorMessage: silent ? state.errorMessage : null,
            documents: response.documents,
            quota: response.quota,
          }));
        } catch (error) {
          if (silent) {
            throw error;
          }

          set({
            status: "error",
            errorMessage: getErrorMessage(error),
          });
        }
      },
      uploadDocument: async (token, file) => {
        set({ status: "uploading", errorMessage: null });

        try {
          const body = new FormData();
          body.append("file", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
          } as never);

          await DocumentApi.createDocument(token, body);
          await get().loadDocuments(token);
        } catch (error) {
          set({
            status: "error",
            errorMessage: getErrorMessage(error),
          });
          throw error;
        }
      },
      deleteDocument: async (token, documentId) => {
        set({ status: "loading", errorMessage: null });

        try {
          await DocumentApi.deleteDocument(token, documentId);
          set((state) => ({
            status: "idle",
            documents: state.documents.filter(
              (document) => document.id !== documentId,
            ),
          }));
          await get().loadDocuments(token);
        } catch (error) {
          set({
            status: "error",
            errorMessage: getErrorMessage(error),
          });
        }
      },
      reprocessDocument: async (token, documentId) => {
        set({ status: "loading", errorMessage: null });

        try {
          await DocumentApi.reprocessDocument(token, documentId);
          await get().loadDocuments(token);
        } catch (error) {
          set({
            status: "error",
            errorMessage: getErrorMessage(error),
          });
        }
      },
      clearError: () => set({ errorMessage: null, status: "idle" }),
      resetSession: () =>
        set({
          documents: [],
          quota: null,
          errorMessage: null,
          status: "idle",
        }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "nedai-document-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
