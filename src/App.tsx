import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AdminRoute } from './components/AdminRoute'
import { ProfileRoute } from './components/ProfileRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { LoginPage } from './pages/LoginPage'
import { HomeScreen } from './pages/HomeScreen'
import { TraditionsPage } from './pages/TraditionsPage'
import { NewsPage } from './pages/NewsPage'
import { KnowledgePage } from './pages/KnowledgePage'
import { RegulationsPage } from './pages/RegulationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminDashboard } from './pages/AdminDashboard'
import { ArticlePage } from './pages/ArticlePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AccessDeniedPage } from './pages/AccessDeniedPage'

function App() {

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <div className="bronze-drum-pattern"></div>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/traditions" element={<TraditionsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/regulations" element={<RegulationsPage />} />
            {/* <Route path="/notifications" element={<NotificationsPage />} /> */}
            <Route path="/:type/:slug" element={<ArticlePage />} />
            <Route path="/traditions/:slug" element={<ArticlePage />} />
            <Route path="/news/:slug" element={<ArticlePage />} />
            <Route path="/knowledge/:slug" element={<ArticlePage />} />
            <Route path="/regulations/:slug" element={<ArticlePage />} />
            
            {/* Authentication Required Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={
              <ProfileRoute>
                <ProfilePage />
              </ProfileRoute>
            } />
            
            {/* Admin Only Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            {/* Access Denied Route */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            
            {/* 404 Fallback Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
