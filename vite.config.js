import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
})
