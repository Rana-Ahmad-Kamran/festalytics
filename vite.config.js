import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind plugin bhi yahan aagaya
  ],
  server: {
    host: true, // Mobile access ke liye ye zaroori hai
  }
})