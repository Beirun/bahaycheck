import { create } from "zustand";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiFetch";

interface License {
  licenseId: number;
  userId: number;
  licenseImage: string;
  specialization: string;
  isVerified: boolean;
}

interface Request {
  requestId: number;
  userId: number;
  requestImage: string | null;
  requestDetails: string;
  requestStatus: string;
  longitude?: number;
  latitude?: number;
  dateCreated: string;
  dateUpdated: string;
}

interface Evaluation {
  evaluationId: number;
  note: string | null;
  dateCreated: string;
  dateUpdated: string;
  requestId: number;
  houseCategory: string;
  damageCategory: string;
}

interface VolunteerState {
  license: License | null;
  requests: Request[];
  evaluations: Evaluation[];
  loading: boolean;

  fetchLicense: () => Promise<void>;
  updateRequest: (requestId: number) => Promise<void>;
  createEvaluation: (data: {
    requestId: number;
    houseCategoryId: number;
    damageCategoryId: number;
    note?: string;
  }) => Promise<void>;
}

export const useVolunteerStore = create<VolunteerState>((set, get) => ({
  license: null,
  requests: [],
  evaluations: [],
  loading: false,

  fetchLicense: async () => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/volunteer/license");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch license");
      set({ license: data[0] || null });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },

  updateRequest: async (requestId) => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/volunteer/request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
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

  createEvaluation: async ({ requestId, houseCategoryId, damageCategoryId, note }) => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/volunteer/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, houseCategoryId, damageCategoryId, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create evaluation");

      set({
        evaluations: [...get().evaluations, data.evaluation],
      });
      toast.success(data.message || "Evaluation created successfully");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },
}));
