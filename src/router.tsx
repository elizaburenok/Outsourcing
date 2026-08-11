import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import TaxPaymentPage from './features/payment/TaxPaymentPage'
import { ROUTES } from './routes'

export { ROUTES }

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.home} replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'pay/:id', element: <TaxPaymentPage /> },
      { path: '*', element: <Navigate to={ROUTES.home} replace /> },
    ],
  },
])
