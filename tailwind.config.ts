import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ubuntu: {
          orange: "#E95420",
          "orange-light": "#F77D3E",
          aubergine: "#2C001E",
          light: "#F5F5F5",
        },
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          muted: "var(--surface-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
        },
        content: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          faint: "var(--text-faint)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(233, 84, 32, 0.35)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-light":
          "radial-gradient(at 40% 20%, rgba(233,84,32,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124,58,237,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(59,130,246,0.05) 0px, transparent 50%)",
        "mesh-dark":
          "radial-gradient(at 40% 20%, rgba(233,84,32,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124,58,237,0.1) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(59,130,246,0.08) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
export default config;
