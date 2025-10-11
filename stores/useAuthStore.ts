import { create } from "zustand"
import { toast } from "sonner"
import {jwtDecode} from "jwt-decode"
import { useRouter } from "next/navigation"

interface User {
  id: number
  phone: string
  role?: string
}

interface JwtPayload {
  userId: number
  phone: string
  role: string
  exp?: number
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  loading: boolean
  isAdmin: boolean
  isVolunteer: boolean
  isAuthenticated: boolean

  loadFromStorage: () => Promise<void>
  signin: (phone: string, password: string) => Promise<void>
  signup: (data: FormData) => Promise<void>
  verify: (phone: string, code: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (u: User | null) => Promise<void>
  setToken: (t: string | null) => Promise<void>
  handleTokenExpiry: () => void
}

const STORAGE_USER = "auth_user"
const STORAGE_TOKEN = "auth_token"
const SECRET_KEY = process.env.ENCRYPTION_KEY as string

async function getKey() {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  )
}

async function encrypt(data: string) {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(data))
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.byteLength)
  return btoa(String.fromCharCode(...combined))
}

async function decrypt(data: string) {
  const key = await getKey()
  const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)
  return new TextDecoder().decode(decrypted)
}

export const useAuthStore = create<AuthState>((set, get) => {

  const decodeRoles = (token: string | null) => {
    if (!token) return { isAdmin: false, isVolunteer: false }
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      return {
        isAdmin: decoded.role === "admin",
        isVolunteer: decoded.role === "volunteer",
      }
    } catch {
      return { isAdmin: false, isVolunteer: false }
    }
  }

  return {
    user: null,
    accessToken: null,
    loading: false,
    isAdmin: false,
    isVolunteer: false,
    isAuthenticated: false,

    loadFromStorage: async () => {
      try {
        const encryptedUser = localStorage.getItem(STORAGE_USER)
        const encryptedToken = localStorage.getItem(STORAGE_TOKEN)
        if (!encryptedUser || !encryptedToken) return

        const user = JSON.parse(await decrypt(encryptedUser))
        const token = await decrypt(encryptedToken)
        const roles = decodeRoles(token)

        set({
          user,
          accessToken: token,
          isAdmin: roles.isAdmin,
          isVolunteer: roles.isVolunteer,
          isAuthenticated: true,
        })
      } catch {
        localStorage.removeItem(STORAGE_USER)
        localStorage.removeItem(STORAGE_TOKEN)
      }
    },

    signin: async (phone, password) => {
      try {
        set({ loading: true })
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
          credentials: "include",
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Signin failed")

        const roles = decodeRoles(data.accessToken)
        set({
          user: data.user,
          accessToken: data.accessToken,
          isAdmin: roles.isAdmin,
          isVolunteer: roles.isVolunteer,
          isAuthenticated: true,
          loading: false,
        })

        localStorage.setItem(STORAGE_USER, await encrypt(JSON.stringify(data.user)))
        localStorage.setItem(STORAGE_TOKEN, await encrypt(data.accessToken))
        if (data.message) toast.success(data.message)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error"
        toast.error(message)
        set({ loading: false })
      }
    },

    signup: async (formData) => {
      try {
        set({ loading: true })
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          body: formData,
          credentials: "include",
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Signup failed")

        const roles = decodeRoles(get().accessToken)
        set({
          user: data.user,
          isAdmin: roles.isAdmin,
          isVolunteer: roles.isVolunteer,
          isAuthenticated: !!data.user && !!get().accessToken,
          loading: false,
        })
        localStorage.setItem(STORAGE_USER, await encrypt(JSON.stringify(data.user)))
        if (data.message) toast.success(data.message)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error"
        toast.error(message)
        set({ loading: false })
      }
    },

    verify: async (phone, code) => {
      try {
        set({ loading: true })
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code }),
          credentials: "include",
        })
        const data = await res.json()
        if (!res.ok || !data.valid) throw new Error(data.message || "Verification failed")
        set({ loading: false })
        if (data.message) toast.success(data.message)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error"
        toast.error(message)
        set({ loading: false })
      }
    },

    logout: async () => {
      try {
        set({ loading: true })
        const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Logout failed")

        localStorage.removeItem(STORAGE_USER)
        localStorage.removeItem(STORAGE_TOKEN)
        set({
          user: null,
          accessToken: null,
          isAdmin: false,
          isVolunteer: false,
          isAuthenticated: false,
          loading: false,
        })
        if (data.message) toast.success(data.message)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error"
        toast.error(message)
        set({ loading: false })
      }
    },

    setUser: async (u) => {
      await localStorage.setItem(STORAGE_USER, await encrypt(JSON.stringify(u)))
      const roles = decodeRoles(get().accessToken)
      set({
        user: u,
        isAdmin: roles.isAdmin,
        isVolunteer: roles.isVolunteer,
        isAuthenticated: !!u && !!get().accessToken,
      })
    },

    setToken: async (t) => {
      if (t) await localStorage.setItem(STORAGE_TOKEN, await encrypt(t))
      else localStorage.removeItem(STORAGE_TOKEN)
      const roles = decodeRoles(t)
      set({
        accessToken: t,
        isAdmin: roles.isAdmin,
        isVolunteer: roles.isVolunteer,
        isAuthenticated: !!get().user && !!t,
      })
    },

    handleTokenExpiry: () => {
      localStorage.removeItem(STORAGE_USER)
      localStorage.removeItem(STORAGE_TOKEN)
      set({ user: null, accessToken: null, isAdmin: false, isVolunteer: false, isAuthenticated: false })
      toast.error("Session expired. Please sign in again.")

    },
  }
})
