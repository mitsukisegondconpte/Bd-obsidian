import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Les 3 plateformes partagent le même .env.local à la racine du monorepo
  // (mêmes clés Supabase = même base = comptes partagés entre les apps).
  envDir: '../../',
  server: {
    host: true,
    port: 5175,
  },
})
