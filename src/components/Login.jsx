import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { auth } from '../firebase'
import { FaStore, FaUser } from 'react-icons/fa' // Import React Icons

function Login({ onClose }) {
  const navigate = useNavigate()
  const [loginType, setLoginType] = useState(null) // null, 'vendor', or 'user'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked)
  }

  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format.'
      case 'auth/user-disabled':
        return 'This account has been disabled.'
      case 'auth/user-not-found':
        return 'No account found with this email address.'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.'
      default:
        return 'Login failed. Please check your credentials and try again.'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Set persistence based on "Remember me" checkbox
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
      await setPersistence(auth, persistence)

      // Sign in with email and password
      await signInWithEmailAndPassword(auth, formData.email, formData.password)

      // Login successful
      setSuccess('Login successful! Redirecting...')
      setLoading(false)

      // Redirect based on login type after a short delay
      setTimeout(() => {
        if (loginType === 'vendor') {
          navigate('/vendor-dashboard')
        } else {
          navigate('/user-dashboard')
        }
        // Close login modal if onClose is provided
        if (onClose) onClose()
      }, 1000)

    } catch (error) {
      // Handle Firebase authentication errors
      console.error('Login error:', error)
      setError(getErrorMessage(error.code))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-black/60 fixed inset-0 flex items-center justify-center p-8 z-[9999] backdrop-blur-md animate-[fadeIn_0.3s_ease] sm:p-4">
      <button
        className="absolute top-6 right-6 bg-white/10 border border-white/20 w-10 h-10 rounded-full text-2xl cursor-pointer flex items-center justify-center text-white transition-all duration-300 z-[1000] hover:bg-[#D6336C] hover:border-[#D6336C] hover:rotate-90 sm:top-4 sm:right-4"
        onClick={onClose}
      >
        ×
      </button>

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-[500px] relative shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[slideUp_0.3s_ease] z-10 text-white">
        <div className="text-center pt-12 px-8 pb-6 border-b border-white/10">
          <h2 className="text-[2rem] font-bold text-white mb-2">Welcome to Festalytics</h2>
          <p className="text-gray-300 text-base">Choose your login type</p>
        </div>

        {!loginType ? (
          <div className="p-8 flex flex-col gap-4">
            <button
              className="bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 text-center flex flex-col items-center gap-3 text-white hover:bg-white/15 hover:border-[#D6336C] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(214,51,108,0.2)]"
              onClick={() => setLoginType('vendor')}
            >
              <FaStore className="text-5xl mb-2 text-[#D6336C]" />
              <h3 className="text-xl font-semibold text-white m-0">Log in as Vendor</h3>
              <p className="text-sm text-gray-300 m-0">Manage your services and bookings</p>
            </button>
            <button
              className="bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 text-center flex flex-col items-center gap-3 text-white hover:bg-white/15 hover:border-[#D6336C] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(214,51,108,0.2)]"
              onClick={() => setLoginType('user')}
            >
              <FaUser className="text-5xl mb-2 text-[#D6336C]" />
              <h3 className="text-xl font-semibold text-white m-0">Log in as User</h3>
              <p className="text-sm text-gray-300 m-0">Plan and manage your events</p>
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
              <button
                className="bg-white/10 border-none px-4 py-2 rounded-lg cursor-pointer text-gray-200 font-medium transition-all duration-300 hover:bg-white/20 hover:text-white"
                onClick={() => {
                  setLoginType(null)
                  setFormData({ email: '', password: '' })
                  setError('')
                  setSuccess('')
                  setRememberMe(false)
                }}
              >
                ← Back
              </button>
              <h3 className="text-xl font-semibold text-white m-0 flex items-center gap-2.5">
                {loginType === 'vendor' ? <><FaStore className="text-[#D6336C]" /> Vendor Login</> : <><FaUser className="text-[#D6336C]" /> User Login</>}
              </h3>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Success Message */}
              {success && (
                <div className="p-3 rounded-lg text-sm bg-green-500/20 text-green-200 border border-green-500/30">
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg text-sm bg-red-500/20 text-red-200 border border-red-500/30">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-200">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={loginType === 'vendor' ? 'vendor@festalytics.com' : 'user@example.com'}
                  required
                  disabled={loading}
                  className="p-3.5 px-4 bg-white/5 border border-white/20 rounded-xl text-base transition-all duration-300 font-inherit text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D6336C] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(214,51,108,0.2)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-200">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="p-3.5 px-4 bg-white/5 border border-white/20 rounded-xl text-base transition-all duration-300 font-inherit text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D6336C] focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(214,51,108,0.2)]"
                />
              </div>

              <div className="flex justify-between items-center text-sm text-gray-300">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    disabled={loading}
                    className="accent-[#D6336C] w-4 h-4"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-[#D6336C] no-underline font-medium transition-colors duration-300 hover:text-[#C2255C] hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="bg-[#D6336C] text-white border-none p-4 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 mt-2 hover:bg-[#C2255C] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(214,51,108,0.3)] disabled:bg-[#E58DA6] disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              <p className="text-center text-gray-300 text-sm mt-2">
                Don't have an account? <span
                  className="text-[#D6336C] cursor-pointer hover:underline font-semibold"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate('/signup');
                  }}
                >Sign up</span>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login