import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="groups" element={<PlaceholderPage title="Groups" />} />
        <Route path="friends" element={<PlaceholderPage title="Friends" />} />
        <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  )
}
