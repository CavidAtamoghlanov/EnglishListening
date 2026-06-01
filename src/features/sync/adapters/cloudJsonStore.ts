import type { CloudJsonStore } from "../types";
import { localMockJsonStore } from "./localMockJsonStore";
import { vercelBlobJsonStore } from "./vercelBlobJsonStore";

export function getCloudJsonStore(): CloudJsonStore {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return vercelBlobJsonStore;
  }

  if (process.env.VERCEL && process.env.ENABLE_LOCAL_MOCK_SYNC !== "true") {
    throw new Error("Cloud sync storage is not configured. Set BLOB_READ_WRITE_TOKEN.");
  }

  return localMockJsonStore;
}
