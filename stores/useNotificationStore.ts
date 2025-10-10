import { create } from "zustand";

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
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/notifications/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      set({ notifications: data.notifications, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "Unknown error", loading: false });
    }
  },

  updateNotification: async (notificationId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
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
