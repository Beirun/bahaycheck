import { useAuthStore } from "@/stores/useAuthStore";
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken, setToken, handleTokenExpiry } = useAuthStore.getState();
  // attach current token
  
if (accessToken) {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  options.headers = headers;

}

  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });
  
  // if token expired, try refreshing
  if (res.status === 401) {
    try {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "GET",
        credentials: "include",
      });

      if (!refreshRes.ok) throw new Error("Token refresh failed");
      const data = await refreshRes.json();
      if (!data.accessToken) throw new Error("No token returned");

      // update Zustand store
      await setToken(data.accessToken);

      // retry original request with new token
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set("Authorization", `Bearer ${data.accessToken}`);

      res = await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    } catch{
      handleTokenExpiry();
      throw new Error("Session expired. Please sign in again.");
    }
  }

  return res;
}
