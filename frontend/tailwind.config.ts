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
        espresso: "#3b2417",
        crema: "#e8c39e",
      },
    },
  },
  plugins: [],
} satisfies Config;
