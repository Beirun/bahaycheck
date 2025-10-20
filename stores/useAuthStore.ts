import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { apiFetch } from "@/utils/apiFetch";
import { useVolunteerStore } from "./useVolunteerStore";
import { useToastStore } from "./useToastStore";
import { useAdminStore } from "./useAdminStore";
import { User } from "@/models/user";
import { useUserStore } from "./useUserStore";

interface JwtPayload {
  userId: number;
  phone: string;
  role: string;
  exp?: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isAdmin: boolean;
  isVolunteer: boolean;
  isAuthenticated: boolean;

  loadAuthFromStorage: () => Promise<void>;
  signin: (
    phone: string,
    password: string,
    router: AppRouterInstance
  ) => Promise<boolean>;
  signup: (data: FormData) => Promise<boolean>;
  update: (data: FormData) => Promise<boolean>;
  verify: (
    phone: string,
    code: string,
    router: AppRouterInstance,
    isSignIn?: boolean
  ) => Promise<void>;
  logout: (router: AppRouterInstance) => Promise<void>;
  setUser: (u: User | null) => Promise<void>;
  setToken: (t: string | null) => Promise<void>;
  handleTokenExpiry: () => void;
}

const STORAGE_USER = "auth_user";
const STORAGE_TOKEN = "auth_token";
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string;

async function getKey() {
  const hex = SECRET_KEY;
  const bytes = Uint8Array.from(
    hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  );
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

export const useAuthStore = create<AuthState>((set, get) => {
  const decodeRoles = (token: string | null) => {
    if (!token) return { isAdmin: false, isVolunteer: false };
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return {
        isAdmin: decoded.role.toLowerCase() === "admin",
        isVolunteer: decoded.role.toLowerCase() === "volunteer",
      };
    } catch {
      return { isAdmin: false, isVolunteer: false };
    }
  };

  return {
    user: null,
    accessToken: null,
    loading: false,
    isAdmin: false,
    isVolunteer: false,
    isAuthenticated: false,

    loadAuthFromStorage: async () => {
      try {
        const encryptedUser = localStorage.getItem(STORAGE_USER);
        const encryptedToken = localStorage.getItem(STORAGE_TOKEN);
        if (!encryptedUser || !encryptedToken) return;

        const user = JSON.parse(await decrypt(encryptedUser));
        const token = await decrypt(encryptedToken);
        const roles = decodeRoles(token);

        set({
          user,
          accessToken: token,
          isAdmin: roles.isAdmin,
          isVolunteer: roles.isVolunteer,
          isAuthenticated: true,
        });
        if (get().isVolunteer) await useVolunteerStore.getState().fetchAll();
        else if (get().isAdmin) await useAdminStore.getState().fetchAll();
        else await useUserStore.getState().fetchAll();
      } catch {
        localStorage.removeItem(STORAGE_USER);
        localStorage.removeItem(STORAGE_TOKEN);
      }
    },

    signin: async (phone, password, router) => {
      try {
        set({ loading: true });
        const res = await apiFetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signin failed");

        if (data.isVerified === false) {
          if (data.message)
            useToastStore.getState().setPending("message", data.message);
          return false;
        }

        const roles = decodeRoles(data.accessToken);
        const route = roles.isAdmin
          ? "/admin"
          : roles.isVolunteer
          ? "/volunteer"
          : "/user";

        router.replace(route);

        set({
          user: data.user,
          accessToken: data.accessToken,
          isAdmin: roles.isAdmin,
          isVolunteer: roles.isVolunteer,
          isAuthenticated: true,
          loading: false,
        });

        if (data.message)
          useToastStore.getState().setPending("success", data.message);

        if (get().isVolunteer) await useVolunteerStore.getState().fetchAll();
        else if (get().isAdmin) await useAdminStore.getState().fetchAll();
        else await useUserStore.getState().fetchAll();
        localStorage.setItem(STORAGE_TOKEN, await encrypt(data.accessToken));
        localStorage.setItem(
          STORAGE_USER,
          await encrypt(JSON.stringify(data.user))
        );

        return true;
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        useToastStore.getState().setError(true);
        useToastStore.getState().setPending("error", message);
        return true;
      } finally {
        set({ loading: false });
      }
    },

    signup: async (formData) => {
      try {
        set({ loading: true });
        const res = await apiFetch("/api/auth/signup", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        if (data.message)
          useToastStore.getState().setPending("success", data.message);

        return true;
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        useToastStore.getState().setError(true);
        useToastStore.getState().setPending("error", message);
        return false;
      } finally {
        set({ loading: false });
      }
    },

    verify: async (phone, code, router, isSignIn = false) => {
      try {
        set({ loading: true });
        const res = await apiFetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code }),
        });
        const data = await res.json();
        if (!res.ok || !data.valid)
          throw new Error(data.message || "Verification failed");

        if (isSignIn)
          router.replace(
            `/${
              get().isAdmin ? "admin" : get().isVolunteer ? "volunteer" : "user"
            }`
          );
        else router.replace("/signin");

        if (data.message)
          useToastStore.getState().setPending("success", data.message);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        useToastStore.getState().setError(true);
        useToastStore.getState().setPending("error", message);
      } finally {
        set({ loading: false });
      }
    },
    update: async (formData: FormData) => {
      try {
        set({ loading: true });
        const res = await apiFetch("/api/auth/update", {
          method: "PUT",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Profile update failed");
        useToastStore.getState().setPending("success", data.message);

        // Refresh user info if backend returns updated user data
        if (data.user) {
          set({ user: data.user });
          localStorage.setItem(
            STORAGE_USER,
            await encrypt(JSON.stringify(data.user))
          );
        }
        if (data.license) {
          useVolunteerStore.getState().setLicense(data.license);
        }

        return true;
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        useToastStore.getState().setError(true);
        useToastStore.getState().setPending("error", message);
        return false;
      } finally {
        set({ loading: false });
      }
    },

    logout: async (router) => {
      set({ loading: true });
      try {
        const res = await apiFetch("/api/auth/logout", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Logout failed");

        router.replace("/signin");
        if(get().isAdmin) useAdminStore.getState().resetAll()
        else if(get().isVolunteer) useVolunteerStore.getState().resetAll()
        else useUserStore.getState().resetAll()
        localStorage.removeItem(STORAGE_USER);
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem("volunteer_license");

        set({
          user: null,
          accessToken: null,
          isAdmin: false,
          isVolunteer: false,
          isAuthenticated: false,
          loading: false,
        });

        if (data.message)
          useToastStore.getState().setPending("success", data.message);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        useToastStore.getState().setError(true);
        useToastStore.getState().setPending("error", message);
      } finally {
        set({ loading: false });
      }
    },

    setUser: async (u) => {
      localStorage.setItem(STORAGE_USER, await encrypt(JSON.stringify(u)));
      const roles = decodeRoles(get().accessToken);
      set({
        user: u,
        isAdmin: roles.isAdmin,
        isVolunteer: roles.isVolunteer,
        isAuthenticated: !!u && !!get().accessToken,
      });
    },

    setToken: async (t) => {
      if (t) localStorage.setItem(STORAGE_TOKEN, await encrypt(t));
      else localStorage.removeItem(STORAGE_TOKEN);
      const roles = decodeRoles(t);
      set({
        accessToken: t,
        isAdmin: roles.isAdmin,
        isVolunteer: roles.isVolunteer,
        isAuthenticated: !!get().user && !!t,
      });
    },

    handleTokenExpiry: () => {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_TOKEN);
      set({
        user: null,
        accessToken: null,
        isAdmin: false,
        isVolunteer: false,
        isAuthenticated: false,
      });
      if (typeof window !== "undefined") {
        window.location.replace("/signin");
      }

      useToastStore.getState().setError(true);
      useToastStore
        .getState()
        .setPending("error", "Session expired. Please sign in again.");
    },
  };
});
