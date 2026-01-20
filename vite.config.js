import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Для GitHub Pages: если репозиторий не является root (username.github.io),
  // раскомментируйте следующую строку и укажите имя репозитория:
  // base: '/cities/',
  base: '/',
})
