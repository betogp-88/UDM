import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0f3d2e",
          light: "#1b5e46",
          accent: "#c9a227",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
