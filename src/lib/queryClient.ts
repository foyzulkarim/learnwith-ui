import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { mockApiRequest } from "./mockApi";

// Always use mock API
export let useMockApi = true;

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
  // Always use mock API for /api requests
  if (url.startsWith('/api')) {
    return mockApiRequest(url, data, options);
  }

  // For non-API requests, use regular fetch
  const method = options?.method || 'GET';
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers || {})
    },
    body: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Always use mock API for /api requests
    if (typeof queryKey[0] === 'string' && queryKey[0].startsWith('/api')) {
      const res = await mockApiRequest(queryKey[0] as string);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
      
      await throwIfResNotOk(res);
      return await res.json();
    }
    
    // For non-API requests, use regular fetch
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// These functions are kept for compatibility but they don't do anything now
export function enableMockApi() {
  console.log('📊 Mock data is already enabled by default');
}

export function disableMockApi() {
  console.log('📊 Mock data cannot be disabled in this version');
}
