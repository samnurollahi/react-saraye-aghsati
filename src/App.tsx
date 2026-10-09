import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { CircularProgress, Stack } from '@mui/material'
import { useAuth } from './features/auth/auth-hooks'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { LoanRequestDetailPage, LoanRequestsPage, NewLoanRequestPage } from './features/loan-requests/LoanRequestsPage'
import { LoanDetailPage, LoansPage } from './features/loans/LoanPages'
import { AdminDashboardPage } from './features/admin/AdminDashboardPage'
import { AdminLayout } from './features/admin/AdminLayout'
import { AdminLoanDetailPage, AdminLoansPage } from './features/admin/LoanPages'
import { LoanRequestDetailPage as AdminLoanRequestDetailPage, LoanRequestsPage as AdminLoanRequestsPage } from './features/admin/LoanRequestsPage'
import { AdminUsersPage } from './features/admin/UsersPage'
import { AdminShopsPage } from './features/admin/ShopsPage'
import { AdminInstallmentsPage } from './features/admin/AdminInstallmentsPage'
import { UserLayout } from './layouts/UserLayout'
import { PurchasePage } from './features/transactions/PurchasePage'
import { TransactionHistoryPage } from './features/transactions/TransactionHistoryPage'
import { NotificationsPage } from './features/notifications/NotificationsPage'
import { HomePage } from './pages/HomePage'
import type { UserRole } from './types/domain'

function RoleHome() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
}

function PublicOnly() {
  const { user, isRestoring } = useAuth()
  if (isRestoring) return <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Stack>
  // return user ? <RoleHome /> : <Outlet />
  return <Outlet />
}

function RoleRoute({ role }: { role: UserRole }) {
  return <RequireAuth role={role} />
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/user" element={<RoleRoute role="user" />}>
        <Route element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="loan-requests" element={<LoanRequestsPage />} />
          <Route path="loan-requests/new" element={<NewLoanRequestPage />} />
          <Route path="loan-requests/:id" element={<LoanRequestDetailPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="loans/:id" element={<LoanDetailPage />} />
          <Route path="purchase" element={<PurchasePage />} />
          <Route path="transactions" element={<TransactionHistoryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>
      <Route path="/admin" element={<RoleRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="loan-requests" element={<AdminLoanRequestsPage />} />
          <Route path="loan-requests/:id" element={<AdminLoanRequestDetailPage />} />
          <Route path="loans" element={<AdminLoansPage />} />
          <Route path="loans/:id" element={<AdminLoanDetailPage />} />
          <Route path="installments" element={<AdminInstallmentsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="shops" element={<AdminShopsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
