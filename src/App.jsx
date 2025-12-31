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
import CreateEvent from './components/create-event/CreateEvent'
import ServiceDiscovery from './components/ServiceDiscovery'

import FindMyDecor from './components/FindMyDecor'
import AIPlanner from './components/ai-planner/AIPlanner'

import MyEvents from './components/MyEvents'
import ManageEvent from './components/ManageEvent'


import ProtectedRoute from './components/ProtectedRoute'

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

        {/* Dashboard routes (Protected) */}
        <Route
          path="/vendor-dashboard"
          element={
            <ProtectedRoute allowedRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/create-event"
          element={
            <ProtectedRoute allowedRole="user">
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-event/:id"
          element={
            <ProtectedRoute allowedRole="user">
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-events"
          element={
            <ProtectedRoute allowedRole="user">
              <MyEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-event/:eventId"
          element={
            <ProtectedRoute allowedRole="user">
              <ManageEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-discovery"
          element={
            <ProtectedRoute allowedRole="user">
              <ServiceDiscovery />
            </ProtectedRoute>
          }
        />

        <Route
          path="/find-decor"
          element={
            <ProtectedRoute allowedRole="user">
              <FindMyDecor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-planner"
          element={
            <ProtectedRoute allowedRole="user">
              <AIPlanner />
            </ProtectedRoute>
          }
        />


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </Router >
  )
}

export default App
