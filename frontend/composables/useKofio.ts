import type { ParsedKofioBean } from "./types";

export function useKofio() {
  const { apiFetch } = useApi();

  const parseKofio = (payload: { url: string } | { html: string }) =>
    apiFetch<ParsedKofioBean>("/kofio/parse", { method: "POST", body: payload });

  return { parseKofio };
}
