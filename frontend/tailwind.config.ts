import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        espresso: "#14120f",
        crema: "#faf9f7",
        surface: "#211d19",
        "surface-hover": "#2b2521",
      },
    },
  },
  plugins: [],
} satisfies Config;
