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
        espresso: "#181614",
        crema: "#faf9f7",
      },
    },
  },
  plugins: [],
} satisfies Config;
