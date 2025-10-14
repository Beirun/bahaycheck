import { create } from "zustand";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore"; // adjust path
import {  apiFetch } from "@/utils/apiFetch";

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleId?: number;
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
  userName?: string;
  volunteerId?: number;
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

interface License {
  licenseId: number;
  userId: number;
  licenseImage: string;
  specialization: string;
  isVerified: boolean;
}


interface AdminState {
  users: User[];
  requests: Request[];
  evaluations: Evaluation[];
  licenses: License[];
  loading: boolean;

  fetchUsers: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  assignRequest: (requestId: number, userId: number) => Promise<void>;
  fetchEvaluations: () => Promise<void>;
  fetchLicenses: () => Promise<void>;
  verifyVolunteer: (licenseId: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  requests: [],
  evaluations: [],
  licenses: [],
  loading: false,

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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
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

  verifyVolunteer: async (licenseId) => {
    try {
      set({ loading: true });
      const res = await  apiFetch("/api/admin/volunteer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify volunteer");

      set({
        licenses: get().licenses.map((l) =>
          l.licenseId === licenseId ? { ...l, isVerified: true } : l
        ),
      });
      toast.success(data.message || "Volunteer verified");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },
}));
