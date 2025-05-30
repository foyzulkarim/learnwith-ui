import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API URL configuration - requires VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  data?: unknown | undefined,
  options?: {
    method?: string;
    headers?: Record<string, string>;
  },
): Promise<Response> {
  // For API requests, use the real API
  const fullUrl = url.startsWith('/api') 
    ? `${API_BASE_URL}${url}` 
    : url;
    
  const method = options?.method || 'GET';
  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers || {})
    },
    body: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  // Handle token refresh for 401 errors (except for auth endpoints)
  if (res.status === 401 && 
      !url.includes('/api/auth/refresh') && 
      !url.includes('/api/auth/logout')) {
    try {
      // Try to refresh the token
      const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include'
      });
      
      if (refreshRes.ok) {
        // Retry the original request with the new token
        const retryRes = await fetch(fullUrl, {
          method,
          headers: {
            ...(data ? { "Content-Type": "application/json" } : {}),
            ...(options?.headers || {})
          },
          body: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined,
          credentials: "include",
        });
        
        return retryRes;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // For API requests, use the real API
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('/api') 
      ? `${API_BASE_URL}${url}` 
      : url;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (res.status === 401 && 
        !url.includes('/api/auth/refresh') && 
        !url.includes('/api/auth/logout')) {
      try {
        // Try to refresh the token
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          credentials: 'include'
        });
        
        if (refreshRes.ok) {
          // Retry the original request with the new token
          const retryRes = await fetch(fullUrl, {
            credentials: "include",
          });
          
          if (unauthorizedBehavior === "returnNull" && retryRes.status === 401) {
            return null;
          }
          
          await throwIfResNotOk(retryRes);
          return await retryRes.json();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      // Disable caching completely - always fetch fresh data
      staleTime: 0, // Data is immediately considered stale
      gcTime: 0, // Data is immediately garbage collected (replaces cacheTime)
      refetchOnMount: 'always', // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchInterval: false, // Don't auto-refetch on intervals
      retry: false, // Don't retry failed requests
    },
    mutations: {
      retry: false,
    },
  },
});
