import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

function UserDashboard() {
  const [user, setUser] = useState(null)
  const [greeting, setGreeting] = useState('Welcome')
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [formData, setFormData] = useState({
    eventType: 'Wedding',
    date: '',
    city: '',
    guests: ''
  })

  // AI Cost Estimator State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [estimates, setEstimates] = useState({
    total: 500000,
    venue: 200000,
    catering: 200000,
    decor: 100000
  })

  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        navigate('/')
      }
    })
    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  // Dummy Data for Event (Used in greeting text)
  const eventData = {
    event: "Event ",
    date: "12 Dec, 2025",
    status: "Planning"
  }

  const handleRecalculate = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      // Logic to randomize estimates for demo
      const randomFactor = 0.9 + Math.random() * 0.2
      const newTotal = Math.round(500000 * randomFactor)

      setEstimates({
        total: newTotal,
        venue: Math.round(newTotal * 0.4),
        catering: Math.round(newTotal * 0.4),
        decor: Math.round(newTotal * 0.2)
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#D6336C] text-white rounded-lg hover:bg-[#C2255C] transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dynamic Glassmorphism Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-8 mb-8 overflow-hidden"
        >
          {/* Decorative gradients (Pink & Purple Orbs) */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-violet-200 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            {/* Greeting & Name */}
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2.5 text-gray-500 font-medium text-lg"
              >
                {greeting === 'Good Evening' ? (
                  <Moon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <span>{greeting}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900"
              >
                <span className="bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent capitalize">
                  {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Guest')}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 font-medium"
              >
                Ready to plan your <span className="text-gray-900 font-semibold">{eventData.event}</span>?
              </motion.p>
            </div>

            {/* Branding Section (Replaces Event Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-left md:text-right"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
                Festalytics
              </h2>
              <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">
                AI-Powered Event Planner
              </p>
            </motion.div>

          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Create / Manage Event Section (Left Column) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Manage Your Event</h2>
              {isCreatingEvent && (
                <button
                  onClick={() => setIsCreatingEvent(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            {!isCreatingEvent ? (
              <button
                onClick={() => setIsCreatingEvent(true)}
                className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-[#D6336C] hover:text-[#D6336C] hover:bg-pink-50/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-bold text-lg">Create New Event</span>
                <span className="text-sm mt-1 text-gray-400">Start planning your big day</span>
              </button>
            ) : (
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                    <div className="relative">
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#D6336C] focus:ring focus:ring-[#D6336C] focus:ring-opacity-20 py-3 px-4 appearance-none"
                      >
                        <option>Wedding</option>
                        <option>Mehndi</option>
                        <option>Birthday</option>
                        <option>Corporate</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#D6336C] focus:ring focus:ring-[#D6336C] focus:ring-opacity-20 py-3 px-4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Lahore"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#D6336C] focus:ring focus:ring-[#D6336C] focus:ring-opacity-20 py-3 px-4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#D6336C] focus:ring focus:ring-[#D6336C] focus:ring-opacity-20 py-3 px-4"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    className="px-8 py-3 bg-[#D6336C] text-white font-semibold rounded-xl hover:bg-[#C2255C] focus:outline-none focus:ring-4 focus:ring-[#D6336C]/30 transition-all shadow-lg shadow-[#D6336C]/30 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* AI Cost Estimator (Right Column) */}
          <div className="relative group h-full">
            {/* Gradient Border Background */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl opacity-30 blur group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative bg-white rounded-3xl shadow-xl flex flex-col h-full overflow-hidden border border-gray-100">
              <div className="p-6 md:p-8 flex-1 flex flex-col">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-[#D6336C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                    AI Budget Estimator
                  </h2>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Total Estimated Cost</p>
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center h-12 md:h-14 space-x-2">
                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                      </div>
                    ) : (
                      <div className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        <span className="text-2xl text-gray-400 font-bold mr-1">PKR</span>
                        {estimates.total.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Breakdown */}
                  <div className={`space-y-6 transition-all duration-500 ${isAnalyzing ? 'opacity-40 blur-[1px]' : 'opacity-100'}`}>
                    <div>
                      <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                        <span>Venue</span>
                        <span>{estimates.venue.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: isAnalyzing ? '0%' : '40%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-pink-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                        <span>Catering</span>
                        <span>{estimates.catering.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: isAnalyzing ? '0%' : '40%' }}
                          transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                          className="h-full bg-purple-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                        <span>Decor</span>
                        <span>{estimates.decor.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: isAnalyzing ? '0%' : '20%' }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className="h-full bg-indigo-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRecalculate}
                  disabled={isAnalyzing}
                  className="mt-8 w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="text-sm">Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Recalculate with AI
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
export default UserDashboard
