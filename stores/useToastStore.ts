// stores/useToastStore.ts
import { create } from "zustand";

type ToastType = "success" | "error" | "message" | "info";

interface ToastState {
  pending: { type: ToastType; msg: string } | null;
  setPending: (type: ToastType, msg: string | null) => void;
  clearPending: () => void;
  isError: boolean;
  setError: (val: boolean) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  pending: null,
  isError: false,
  setPending: (type, msg) => {
    if (!msg) return;
    set({ pending: { type, msg } });
  },
  clearPending: () => set({ pending: null }),
  setError: (val) => set({isError: val})
}));
