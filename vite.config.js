import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/EventScore/',  // ⚠️ Remplace par le nom exact de ton repo GitHub
})
