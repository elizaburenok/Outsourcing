import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Единый источник компонентов и токенов — каноническая дизайн-система.
// Не копируем её в проект, а ссылаемся на файл DS (правило проекта).
const DS = path.resolve(__dirname, '../../design-system')

export default defineConfig({
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
      // разрешаем Vite отдавать файлы из соседней папки design-system
      allow: [path.resolve(__dirname, '../..')],
    },
  },
})
