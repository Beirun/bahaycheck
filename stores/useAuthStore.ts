import { create } from "zustand"
import { toast } from "sonner"
import {jwtDecode} from "jwt-decode"
import { useRouter } from "next/navigation"

interface User {
  id: number
  phone: string
  role?: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  loading: boolean
  isAdmin: boolean
  isAuthenticated: boolean

  signin: (phone: string, password: string) => Promise<void>
  signup: (data: FormData) => Promise<void>
  verify: (phone: string, code: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (u: User | null) => void
  setToken: (t: string | null) => void
  handleTokenExpiry: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  const router = useRouter()

  return {
    user: null,
    accessToken: null,
    loading: false,
    isAdmin: false,
    isAuthenticated: false,

    signin: async (phone, password) => {
      try {
        set({ loading: true })
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Signin failed")

        set({ user: data.user, accessToken: data.accessToken, loading: false })
        if (data.message) toast.success(data.message)

        const decoded = jwtDecode(data.accessToken)
        console.log(decoded)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error"
        toast.error(message)
        set({ loading: false })
      }
    },

    signup: async (formData) => {
      try {
        set({ loading: true })
        const res = await fetch("/api/auth/signup", { method: "POST", body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Signup failed")

        set({ user: data.user, loading: false })
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
        const res = await fetch("/api/auth/logout", { method: "POST" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Logout failed")

        set({ user: null, accessToken: null, loading: false })
        if (data.message) toast.success(data.message)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error"
        toast.error(message)
        set({ loading: false })
      }
    },

    setUser: (u) => set({ user: u }),
    setToken: (t) => set({ accessToken: t }),

    handleTokenExpiry: () => {
      set({ user: null, accessToken: null })
      toast.error("Session expired. Please sign in again.")
      router.push("/signin")
    },
  }
})
