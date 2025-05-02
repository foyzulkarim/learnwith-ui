import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { mockApiRequest } from "./mockApi";

// Flag to determine if we should use mock API or real API
export let useMockApi = false;

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
  // Use mock API if enabled
  if (useMockApi && url.startsWith('/api')) {
    return mockApiRequest(url, data, options);
  }

  // Otherwise use real API
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
    // If using mock API, use the mock API request
    if (useMockApi && typeof queryKey[0] === 'string' && queryKey[0].startsWith('/api')) {
      const res = await mockApiRequest(queryKey[0] as string);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
      
      await throwIfResNotOk(res);
      return await res.json();
    }
    
    // Otherwise use regular fetch
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

// Function to enable mock API
export function enableMockApi() {
  useMockApi = true;
  console.log('🔄 Mock API enabled - API requests will use mock data');
  
  // Clear any existing queries to ensure we use the mock data
  queryClient.clear();
}

// Function to disable mock API
export function disableMockApi() {
  useMockApi = false;
  console.log('🔄 Mock API disabled - API requests will go to the real server');
  
  // Clear any existing queries to ensure we use the real API
  queryClient.clear();
}
