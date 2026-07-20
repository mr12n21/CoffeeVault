export default defineNuxtConfig({
  compatibilityDate: "2024-07-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/i18n"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    apiBaseServer: process.env.NUXT_API_BASE_SERVER || "http://backend:4000",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
    },
  },
  nitro: {
    devProxy: {
      "/api": { target: "http://backend:4000", changeOrigin: true },
    },
  },
  i18n: {
    strategy: "no_prefix",
    defaultLocale: "en",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "cs", name: "Čeština", file: "cs.json" },
    ],
    langDir: "locales/",
    detectBrowserLanguage: {
      useCookieValue: true,
      cookieKey: "cv_locale",
      redirectOn: "no prefix",
    },
  },
});
