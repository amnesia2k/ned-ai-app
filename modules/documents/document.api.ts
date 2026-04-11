import { request } from "@/lib/http";
import type {
  ServerCreateDocumentResponse,
  ServerGetDocumentResponse,
  ServerListDocumentsResponse,
  ServerReprocessDocumentResponse,
} from "@/modules/contracts";

export function listDocuments(token: string) {
  return request<ServerListDocumentsResponse>("/documents", {
    token,
  });
}

export function createDocument(token: string, body: FormData) {
  return request<ServerCreateDocumentResponse>("/documents", {
    method: "POST",
    token,
    body,
  });
}

export function getDocument(token: string, documentId: string) {
  return request<ServerGetDocumentResponse>(`/documents/${documentId}`, {
    token,
  });
}

export function deleteDocument(token: string, documentId: string) {
  return request<Record<string, never>>(`/documents/${documentId}`, {
    method: "DELETE",
    token,
  });
}

export function reprocessDocument(token: string, documentId: string) {
  return request<ServerReprocessDocumentResponse>(
    `/documents/${documentId}/reprocess`,
    {
      method: "POST",
      token,
    },
  );
}
