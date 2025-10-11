import { create } from "zustand";
import { useAuthStore } from "./useAuthStore"; // adjust path if necessary

interface Request {
  requestId: number;
  userId: number;
  requestImage?: string;
  requestDetails?: string;
  requestStatus?: string;
  longitude?: number;
  latitude?: number;
  dateCreated?: string;
  dateUpdated?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface RequestStore {
  requests: Request[];
  currentRequest?: Request;
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  fetchRequest: (id: number) => Promise<void>;
  createRequest: (formData: FormData) => Promise<void>;
  updateRequest: (id: number, formData: FormData) => Promise<void>;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
  requests: [],
  currentRequest: undefined,
  loading: false,
  error: null,

  fetchRequests: async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      set({ error: "Not authenticated" });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/request", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      set({ requests: data.requests, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Unknown error", loading: false });
    }
  },

  fetchRequest: async (id) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      set({ error: "Not authenticated" });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/request/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch request");
      const data = await res.json();
      set({ currentRequest: data.request, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Unknown error", loading: false });
    }
  },

  createRequest: async (formData) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      set({ error: "Not authenticated" });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/request", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create request");
      const data = await res.json();
      set({ requests: [data.request, ...get().requests], loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Unknown error", loading: false });
    }
  },

  updateRequest: async (id, formData) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      set({ error: "Not authenticated" });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/request/${id}`, {
        method: "PUT",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update request");
      const data = await res.json();
      set({
        requests: get().requests.map(r => (r.requestId === id ? data.request : r)),
        currentRequest: data.request,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Unknown error", loading: false });
    }
  },
}));
