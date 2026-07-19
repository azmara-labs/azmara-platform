/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./docs/**/*.{md,mdx}",
    "./.docusaurus/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@docusaurus/theme-classic/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          // Match existing Docusaurus primary color variables
          DEFAULT: "var(--ifm-color-primary)",
          foreground: "var(--ifm-color-primary-foreground)",
        },
        background: {
          DEFAULT: "var(--ifm-background-color)",
          foreground: "var(--ifm-background-foreground)",
        },
        secondary: {
          DEFAULT: "var(--ifm-color-secondary)",
          foreground: "var(--ifm-color-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--ifm-color-muted)",
          foreground: "var(--ifm-color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--ifm-color-accent)",
          foreground: "var(--ifm-color-accent-foreground)",
        },
        destructivelight: {
          DEFAULT: "var(--ifm-color-danger)",
          foreground: "var(--ifm-color-danger-foreground)",
        },
        border: "var(--ifm-color-emphasis-200)",
        input: "var(--ifm-color-emphasis-200)",
        ring: "var(--ifm-color-primary)",
      },
      borderRadius: {
        lg: "var(--ifm-global-radius-lg)",
        md: "var(--ifm-global-radius-md)",
        sm: "var(--ifm-global-radius-sm)",
      },
    },
  },
  plugins: [],
}