import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

// Токены и шрифты — из файла дизайн-системы (единый источник, без хардкода)
import '@ds/tokens/css-variables.css'
import '@ds/src/fonts.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
