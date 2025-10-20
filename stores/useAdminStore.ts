import { create } from "zustand";
import { toast } from "sonner";
import {  apiFetch } from "@/utils/apiFetch";
import { Evaluation } from "@/models/evaluation";
import { User } from "@/models/user";
import { License } from "@/models/license";
import { Request } from "@/models/request";


interface AdminState {
  users: User[];
  requests: Request[];
  evaluations: Evaluation[];
  licenses: License[];
  loading: boolean;

  fetchUsers: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  assignRequest: (requestId: number, userId: number) => Promise<boolean>;
  fetchEvaluations: () => Promise<void>;
  fetchLicenses: () => Promise<void>;
  verifyVolunteer: (userId: number) => Promise<boolean>;
  rejectVolunteer: (userId: number) => Promise<boolean>;
  fetchAll: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  requests: [],
  evaluations: [],
  licenses: [],
  loading: true,

  fetchUsers: async () => {
    try {
      set({ loading: true });
      const res = await  apiFetch("/api/admin/user");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      set({ users: data });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },

  fetchRequests: async () => {
    try {
      set({ loading: true });
      const res = await  apiFetch("/api/admin/request");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch requests");
      set({ requests: data.requests || [] });
      console.log('requests',data.requests)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },

  assignRequest: async (requestId, userId) => {
    try {
      set({ loading: true });
      const res = await  apiFetch("/api/admin/request/assign", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign request");

      set({
        requests: get().requests.map((r) =>
          r.requestId === requestId
            ? { ...r, volunteerId: userId, requestStatus: 'Assigned' }
            : r
        ),
      });
      toast.success(data.message || "Request assigned");
      return true
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
      return false
    } finally {
      set({ loading: false });
    }
  },

  fetchEvaluations: async () => {
    try {
      set({ loading: true });
      const res = await  apiFetch("/api/admin/evaluation");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch evaluations");
      set({ evaluations: data });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },

  fetchLicenses: async () => {
    try {
      set({ loading: true });
      const res = await  apiFetch("/api/admin/license");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch licenses");
      set({ licenses: data });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },

  verifyVolunteer: async (userId) => {
    try {
      set({ loading: true });
      const res = await  apiFetch("/api/admin/volunteer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify volunteer");

      set({
        licenses: get().licenses.map((l) =>
          l.userId === userId ? { ...l, isVerified: true } : l
        ),
      });
      toast.success(data.message || "Volunteer verified");
      return true
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
      return false
    } finally {
      set({ loading: false });
    }
  },
  rejectVolunteer: async (userId) => {
    try {
      set({ loading: true });
      const res = await  apiFetch("/api/admin/volunteer/reject", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject volunteer");

      set({
        licenses: get().licenses.map((l) =>
          l.userId === userId ? { ...l, isRejected: true } : l
        ),
      });
      toast.success(data.message || "Volunteer verified");
      return true
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
      return false
    } finally {
      set({ loading: false });
    }
  },
  fetchAll: async () => {
  try {
    set({ loading: true });
    await Promise.all([
      get().fetchLicenses(),
      get().fetchUsers(),
      get().fetchRequests(),
      get().fetchEvaluations(),
    ]);
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : "Unknown error");
  } finally {
    set({ loading: false });
  }
},

}));
