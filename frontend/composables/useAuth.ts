interface AuthUser {
  id: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function useAuth() {
  const token = useCookie<string | null>("cv_token", { default: () => null, sameSite: "lax" });
  const user = useState<AuthUser | null>("cv_user", () => null);
  const config = useRuntimeConfig();
  const isAuthenticated = computed(() => Boolean(token.value));

  async function register(email: string, password: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/register`, {
      method: "POST",
      body: { email, password },
    });
    token.value = res.token;
    user.value = res.user;
  }

  async function login(email: string, password: string) {
    const res = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/login`, {
      method: "POST",
      body: { email, password },
    });
    token.value = res.token;
    user.value = res.user;
  }

  function logout() {
    token.value = null;
    user.value = null;
  }

  return { token, user, isAuthenticated, register, login, logout };
}
