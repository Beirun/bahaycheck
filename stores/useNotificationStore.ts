import { create } from "zustand";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiFetch";

interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  status: string;
  dateCreated: string;
  dateUpdated: string | null;
  dateDeleted: string | null;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;

  fetchNotifications: () => Promise<void>;
  updateNotificationStatus: (notificationId: number, status: string) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/notification");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch notifications");
      set({ notifications: data.notifications || [] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },

  updateNotificationStatus: async (notificationId, status) => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/notification/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update notification");

      set({
        notifications: get().notifications.map((n) =>
          n.notificationId === notificationId ? data.data : n
        ),
      });
      toast.success(data.message || "Notification updated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      set({ loading: true });
      const res = await apiFetch("/api/notification", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete notification");

      set({
        notifications: get().notifications.filter(
          (n) => n.notificationId !== notificationId
        ),
      });
      toast.success(data.message || "Notification deleted");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    } finally {
      set({ loading: false });
    }
  },
}));
