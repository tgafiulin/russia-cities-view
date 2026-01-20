import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, copyFileSync } from 'fs'
import { resolve } from 'path'

// Плагин для создания 404.html для GitHub Pages
const githubPages404Plugin = () => {
  return {
    name: 'github-pages-404',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const indexPath = resolve(outDir, 'index.html')
      const notFoundPath = resolve(outDir, '404.html')
      
      try {
        // Копируем index.html в 404.html
        copyFileSync(indexPath, notFoundPath)
        console.log('✓ Created 404.html for GitHub Pages')
      } catch (error) {
        console.warn('Could not create 404.html:', error.message)
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // В dev режиме base = '/', в production (build) = '/russia-cities-view/'
  const base = mode === 'development' ? '/' : '/russia-cities-view/'
  
  return {
    plugins: [
      react(),
      mode === 'production' && githubPages404Plugin()
    ].filter(Boolean),
    base: base,
  }
})
