/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define custom colors used in your CSS
        purple: {
          100: "#f3e8ff",
          200: "#d8b4fe",
          500: "#a855f7",
          gradient: "linear-gradient(90deg, #a855f7, #d8b4fe)", // Example gradient
        },
        dark: {
          400: "#6b7280",
          600: "#4b5563",
          700: "#374151",
        },
        green: {
          100: "#dcfce7",
          900: "#14532d",
        },
        red: {
          100: "#fee2e2",
          900: "#7f1d1d",
        },
        // Define 'border' as a color if you want to use border-border
        border: "hsl(var(--border))", // This will use the CSS variable
      },
      backgroundImage: {
        // Define the purple-gradient for bg-purple-gradient
        "purple-gradient": "linear-gradient(90deg, #a855f7, #d8b4fe)",
      },
    },
  },
  plugins: [],
};