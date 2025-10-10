'use client'

import { useCallback } from 'react'
import { useAuthStore, AuthState } from '@/stores/useAuthStore'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(auth: AuthState): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/accounts/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Session Expired')

      const data = await res.json()
      localStorage.setItem('token', data.token)
      auth.setToken(data.token)
      return data.token
    } catch {
      auth.handleTokenExpiry()
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export function useFetch() {
  const auth = useAuthStore()

  const fetchWithAuth = useCallback(
    async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
      const newInit: RequestInit = { ...init, credentials: 'include' }

      // Convert headers to plain object
      const headers: Record<string, string> =
        init.headers instanceof Headers
          ? Object.fromEntries(init.headers.entries())
          : (init.headers as Record<string, string>) || {}

      if (auth.accessToken) {
        headers['Authorization'] = `Bearer ${auth.accessToken}`
      }

      newInit.headers = headers

      let res = await fetch(input, newInit)

      if (res.status === 401 || res.status === 403) {
        const newToken = await refreshAccessToken(auth)
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`
          newInit.headers = headers
          res = await fetch(input, newInit)
        }
      }

      return res
    },
    [auth]
  )

  return fetchWithAuth
}
