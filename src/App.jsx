import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Footer from './components/Footer'
import VendorDashboard from './components/VendorDashboard'
import UserDashboard from './components/UserDashboard'
import SignupPage from './components/SignupPage'

function App() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <Router>
      <Routes>
        {/* Main landing page route */}
        <Route
          path="/"
          element={
            <>
              {!showLogin && <Navbar />}
              {showLogin ? (
                <Login onClose={() => setShowLogin(false)} />
              ) : (
                <LandingPage onLoginClick={() => setShowLogin(true)} />
              )}
              <Footer />
            </>
          }
        />

        {/* Dashboard routes */}
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route
          path="/signup"
          element={
            <>
              <Navbar />
              <LandingPage onLoginClick={() => setShowLogin(true)} />
              <Footer />
              <SignupPage />
            </>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
