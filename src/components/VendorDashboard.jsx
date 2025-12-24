import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

function VendorDashboard() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#D6336C] text-white rounded-lg hover:bg-[#C2255C] transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to Vendor Dashboard</h2>
          <p className="text-gray-600">
            This is the vendor dashboard. You can manage your services and bookings here.
          </p>
        </div>
      </main>
    </div>
  )
}

export default VendorDashboard


