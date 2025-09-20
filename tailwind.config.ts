import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "media"], // Support both class and media query
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color scheme that works for both light and dark modes
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        // Dark mode friendly colors
        surface: {
          light: "#ffffff",
          dark: "#1f2937",
        },
        text: {
          primary: {
            light: "#111827",
            dark: "#f9fafb",
          },
          secondary: {
            light: "#6b7280",
            dark: "#9ca3af",
          },
        },
        border: {
          light: "#e5e7eb",
          dark: "#374151",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
