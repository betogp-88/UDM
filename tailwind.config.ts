import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Chrome — se leen de las variables CSS en globals.css
        surface: "var(--surface)",
        plane: "var(--plane)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        muted: "var(--muted)",
        grid: "var(--grid)",
        hair: "var(--hair)",
        // Marca (placeholder hasta tener la identidad de Un Digito Mas)
        brand: "var(--brand)",
        "brand-ink": "var(--brand-ink)",
        "brand-accent": "var(--brand-accent)",
        "brand-soft": "var(--brand-soft)",
        "brand-bar": "var(--brand-bar)",
        // Series de graficas — paleta validada
        s1: "var(--s1)",
        s2: "var(--s2)",
        f1: "var(--f1)",
        f2: "var(--f2)",
        f3: "var(--f3)",
        f4: "var(--f4)",
        f5: "var(--f5)",
        // Estatus
        good: "var(--good)",
        warning: "var(--warning)",
        serious: "var(--serious)",
        critical: "var(--critical)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
