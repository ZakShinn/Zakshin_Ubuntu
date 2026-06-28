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
          aubergine: "#2C001E",
          light: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};
export default config;
