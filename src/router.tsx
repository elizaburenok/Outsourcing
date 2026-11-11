import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import AccountingPage from './pages/AccountingPage'
import ReportsPage from './pages/ReportsPage'
import ChatPage from './pages/ChatPage'
import TaxPaymentPage from './features/payment/TaxPaymentPage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import { ROUTES } from './routes'

export { ROUTES }

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.home} replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'accounting', element: <AccountingPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'pay/:id', element: <TaxPaymentPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'tasks/:id', element: <TaskDetailPage /> },
      { path: '*', element: <Navigate to={ROUTES.home} replace /> },
    ],
  },
])
