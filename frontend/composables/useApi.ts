export function useApi() {
  const { token } = useAuth();
  const config = useRuntimeConfig();

  function apiFetch<T>(path: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    return $fetch<T>(`${config.public.apiBase}${path}`, {
      ...opts,
      headers: {
        ...(opts.headers as Record<string, string> | undefined),
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
    });
  }

  return { apiFetch };
}
