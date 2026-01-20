import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // В dev режиме base = '/', в production (build) = '/russia-cities-view/'
  const base = mode === 'development' ? '/' : '/russia-cities-view/'
  
  return {
    plugins: [react()],
    base: base,
  }
})
