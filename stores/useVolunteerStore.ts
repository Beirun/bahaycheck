import { create } from "zustand";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiFetch";
import { Evaluation } from "@/models/evaluation";
import { License } from "@/models/license";
import { Request } from "@/models/request";

interface VolunteerState {
  license: License | null;
  requests: Request[];
  evaluations: Evaluation[];
  loading: boolean;

  loadLicenseFromStorage: () => Promise<void>;
  fetchLicense: () => Promise<void>;
  updateRequestStatus: (requestId: number) => Promise<boolean>;
  setLicense: (l: License) => void;
  createEvaluation: (data: {
    requestId: number;
    houseCategoryId: number;
    damageCategoryId: number;
    note?: string;
  }) => Promise<boolean>;
  fetchRequests: () => Promise<void>;
  fetchEvaluations: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

const STORAGE_LICENSE = "volunteer_license";
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string;

async function getKey() {
  const hex = SECRET_KEY;
  const bytes = Uint8Array.from(
    hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  );

  // Hash to 32 bytes (AES-256)
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encrypt(data: string) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(data)
  );
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(data: string) {
  const key = await getKey();
  const combined = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
export const useVolunteerStore = create<VolunteerState>((set, get) => ({
  license: null,
  requests: [],
  evaluations: [],
  loading: true,

  fetchAll: async () => {
    try {
      set({ loading: true });
      await Promise.all([
        get().fetchLicense(),
        get().fetchRequests(),
        get().fetchEvaluations(),
      ]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },
  loadLicenseFromStorage: async () => {
    try {
      const encryptedLicense = localStorage.getItem(STORAGE_LICENSE);
      if (!encryptedLicense) return;

      const license = JSON.parse(await decrypt(encryptedLicense));

      set({
        license,
      });
    } catch {
      localStorage.removeItem(STORAGE_LICENSE);
    }
  },
  setLicense: async (l) => {
    set({ license: l })
    localStorage.setItem(
        STORAGE_LICENSE,
        await encrypt(JSON.stringify(l))
      );
  },
  fetchLicense: async () => {
    try {
      const res = await apiFetch("/api/volunteer/license");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch license");
      set({ license: data[0] || null });
      localStorage.setItem(
        STORAGE_LICENSE,
        await encrypt(JSON.stringify(data[0]))
      );
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    }
  },

  fetchRequests: async () => {
    try {
      const res = await apiFetch("/api/volunteer/request");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch requests");
      set({ requests: data.requests || [] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    }
  },
  fetchEvaluations: async () => {
    try {
      const res = await apiFetch("/api/volunteer/evaluation");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch evaluations");
      set({ evaluations: data });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    }
  },

  updateRequestStatus: async (requestId) => {
    try {
      const res = await apiFetch("/api/volunteer/request/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update request");

      set({
        requests: get().requests.map((r) =>
          r.requestId === requestId
            ? { ...r, requestStatus: data.requestStatus }
            : r
        ),
      });
      toast.success(data.message || "Request updated");
      return true;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
      return false;
    }
  },

  createEvaluation: async ({
    requestId,
    houseCategoryId,
    damageCategoryId,
    note,
  }) => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/volunteer/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          houseCategoryId,
          damageCategoryId,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create evaluation");

      set({
        evaluations: [...get().evaluations, data.evaluation],
      });
      set({
        requests: get().requests.map((r) =>
          r.requestId === requestId
            ? { ...r, requestStatus: data.requestStatus }
            : r
        ),
      });
      toast.success(data.message || "Evaluation created successfully");
      return true;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
