export default defineNuxtConfig({
  compatibilityDate: "2024-07-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
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
});
