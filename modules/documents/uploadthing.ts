import { generateReactNativeHelpers } from "@uploadthing/expo";
import type { FileRouter } from "uploadthing/types";

import { UPLOADTHING_URL } from "@/lib/env";

export const DOCUMENT_UPLOAD_ENDPOINT = "documentUploader" as const;
type UploadRouter = {
  documentUploader: FileRouter[string];
};

const { uploadFiles: uploadDocumentFiles } =
  generateReactNativeHelpers<UploadRouter>({
    url: UPLOADTHING_URL || undefined,
  });

function assertUploadThingUrl() {
  if (!UPLOADTHING_URL) {
    throw new Error(
      "Missing UploadThing endpoint. Set EXPO_PUBLIC_SERVER_URL or EXPO_PUBLIC_API_URL and restart Expo.",
    );
  }
}

export function uploadFiles(
  ...args: Parameters<typeof uploadDocumentFiles>
) {
  assertUploadThingUrl();
  return uploadDocumentFiles(...args);
}
