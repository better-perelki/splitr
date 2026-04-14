import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import GroupDetailPage from './pages/GroupDetailPage'
import GroupsPage from './pages/GroupsPage'
import FriendsPage from './pages/FriendsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import PlaceholderPage from './pages/PlaceholderPage'
import InvitePage from './pages/InvitePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/landing" replace />
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  
  if (isAuthenticated) {
    const pendingFriendId = sessionStorage.getItem('pendingFriendId')
    if (pendingFriendId) {
      sessionStorage.removeItem('pendingFriendId')
      return <Navigate to={`/invite?userId=${pendingFriendId}`} replace />
    }
    return <Navigate to="/" replace />
  }
  
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<GuestRoute><LandingPage /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="/add-friend" element={<InvitePage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="groups/:id" element={<GroupDetailPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
