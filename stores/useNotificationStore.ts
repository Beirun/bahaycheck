import { create } from "zustand";
import { useAuthStore } from "./useAuthStore"; // adjust the path if needed

interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  description: string;
  status: string;
  dateUpdated?: string;
}

interface NotificationStore {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  fetchNotifications: (userId: number) => Promise<void>;
  updateNotification: (notificationId: number, data: Partial<Notification>) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async (userId) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      set({ error: "Not authenticated" });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      set({ notifications: data.notifications, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Unknown error", loading: false });
    }
  },

  updateNotification: async (notificationId, updatedData) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      set({ error: "Not authenticated" });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update notification");
      const data = await res.json();
      set({
        notifications: get().notifications.map(n =>
          n.notificationId === notificationId ? data.data : n
        ),
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Unknown error", loading: false });
    }
  },
}));
