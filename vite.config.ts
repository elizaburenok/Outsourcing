import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Единый источник компонентов и токенов — каноническая дизайн-система.
// Завендорена в репозиторий (./design-system) как обычные файлы: сборочная среда
// (Vercel) не имеет доступа к приватному репозиторию ДС, поэтому submodule там не
// выкачивался. Обновление ДС — ручной ресинк содержимого этой папки.
const DS = path.resolve(__dirname, './design-system')

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Outsourcing/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ds': DS,
    },
    // DS держит собственный node_modules — без dedupe получим две копии React
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5199,
    strictPort: !!process.env.PORT,
    fs: {
      // разрешаем Vite отдавать файлы из завендоренной папки design-system внутри проекта
      allow: [path.resolve(__dirname, '.')],
    },
  },
})
