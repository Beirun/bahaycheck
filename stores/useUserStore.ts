import { create } from "zustand";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiFetch";
import { Evaluation } from "@/models/evaluation";
import { Request } from "@/models/request";


interface UserState {
  requests: Request[];
  evaluations: Evaluation[];
  loading: boolean;

  fetchRequests: () => Promise<void>;
  createRequest: (data: FormData) => Promise<boolean>;
  updateRequest: (requestId: number, data: FormData) => Promise<void>;
  fetchEvaluations: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  requests: [],
  evaluations: [],
  loading: true,
  fetchAll: async () => {
  try {
    set({ loading: true });
    await Promise.all([
      get().fetchRequests(),
      get().fetchEvaluations(),
    ]);
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : "Unknown error");
  } finally {
    set({ loading: false });
  }
},
  fetchRequests: async () => {
    try {
      const res = await apiFetch("/api/user/request");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch requests");
      set({ requests: data.requests || [] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    }
  },


  fetchEvaluations: async () => {
    try {
      const res = await apiFetch("/api/user/evaluation");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch evaluations");
      set({ evaluations: data });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } 
  },
  createRequest: async (formData) => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/user/request", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create request");

      set({ requests: [...get().requests, data.request] });
      toast.success(data.message || "Request created");
      return true;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateRequest: async (requestId, formData) => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/user/request", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update request");

      set({
        requests: get().requests.map((r) =>
          r.requestId === requestId ? data.request : r
        ),
      });
      toast.success(data.message || "Request updated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },
}));
