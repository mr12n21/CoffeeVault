export function useApi() {
  const { token } = useAuth();
  const config = useRuntimeConfig();
  const base = import.meta.server ? config.apiBaseServer : config.public.apiBase;

  function apiFetch<T>(path: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    return $fetch<T>(`${base}${path}`, {
      ...opts,
      headers: {
        ...(opts.headers as Record<string, string> | undefined),
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
    });
  }

  return { apiFetch };
}
