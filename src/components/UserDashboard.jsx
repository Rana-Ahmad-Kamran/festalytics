import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Calendar, Clock, CheckCircle, Trash2, Search, MapPin, Star, Plus, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const navigate = useNavigate();

  // Mock Data for Venues (Static for now as per dashboard requirements)
  const lahoreVenues = [
    {
      id: 1,
      name: "Pearl Continental (PC) - Crystal Hall",
      location: "Mall Road, Lahore",
      rating: 5.0,
      price: "$$$$",
      match: "98%",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2698&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Royal Palm Golf & Country Club",
      location: "Canal Road, Lahore",
      rating: 4.8,
      price: "$$$$",
      match: "95%",
      image: "https://images.unsplash.com/photo-1561587843-c7931c3bf714?q=80&w=2670&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Shehzadi Wedding Hall",
      location: "Gulberg, Lahore",
      rating: 4.7,
      price: "$$$",
      match: "92%",
      image: "https://images.unsplash.com/photo-1544976735-85db9a751659?q=80&w=2669&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "Mughal-e-Azam Banquet Hall",
      location: "Garden Town, Lahore",
      rating: 4.6,
      price: "$$",
      match: "89%",
      image: "https://images.unsplash.com/photo-1520857014972-eaaaad765e77?q=80&w=2670&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    // Fetch from localStorage
    const fetchEvents = () => {
      try {
        const storedEvents = JSON.parse(localStorage.getItem('festalytics_events') || '[]');
        if (storedEvents.length > 0) {
          // Sort by date (nearest first) or created time if date matches
          // For simplicity, taking the last created or first in list.
          // Let's sort to find the most relevant upcoming event.
          // Assuming dates are YYYY-MM-DD
          const sortedEvents = storedEvents.sort((a, b) => {
            return new Date(a.date || '9999-12-31') - new Date(b.date || '9999-12-31');
          });
          setUpcomingEvent(sortedEvents[0]);
        } else {
          setUpcomingEvent(null);
        }
      } catch (error) {
        console.error("Error reading events from local storage", error);
        setUpcomingEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const storedEvents = JSON.parse(localStorage.getItem('festalytics_events') || '[]');
        const updatedEvents = storedEvents.filter(ev => ev.id !== eventId);
        localStorage.setItem('festalytics_events', JSON.stringify(updatedEvents));

        // Update state
        if (updatedEvents.length > 0) {
          setUpcomingEvent(updatedEvents[0]);
        } else {
          setUpcomingEvent(null);
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert('Failed to delete event locally.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#D6336C' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Reusable Dashboard Header */}
      <DashboardHeader />

      {/* Main Dashboard Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your wedding plans and vendors</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/create-event')}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D6336C] to-[#B02A58] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-md shadow-[#D6336C]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Event
          </motion.button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 1. Search Bar (Left - Top) */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative w-full"
            >
              <motion.div
                className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden"
                whileFocusWithin={{
                  scaleX: 1.01,
                  borderColor: '#D6336C',
                  boxShadow: '0 0 0 4px rgba(214, 51, 108, 0.1)'
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="pl-4 pr-2 flex items-center pointer-events-none">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
                  >
                    <Search className="h-5 w-5 text-gray-400" />
                  </motion.div>
                </div>
                <input
                  type="text"
                  className="flex-1 py-3.5 px-2 text-gray-700 placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none"
                  placeholder="Search for venues, florists, or photographers..."
                />
                <button className="mr-2 p-2 bg-[#D6336C] rounded-full text-white hover:bg-[#B02A58] transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            </motion.div>

            {/* 3. Recommended Venues (Left - Bottom) */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recommended Venues in Lahore</h2>
                <a href="#" className="text-sm font-medium text-[#D6336C] hover:text-[#B02A58]">View All</a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lahoreVenues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    {/* Image Container */}
                    <div className="h-40 relative bg-gray-200">
                      <img src={venue.image} alt={venue.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[#D6336C] shadow-sm">
                        {venue.match} Match
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 p-0 m-0">{venue.name}</h3>
                        <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded text-xs font-semibold text-gray-700">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {venue.rating}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{venue.location}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-medium text-gray-600">{venue.price}</span>
                        <button className="text-xs font-bold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors group-hover:bg-[#D6336C] group-hover:text-white group-hover:border-[#D6336C]">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Event Status Card (Right Sidebar) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
              className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-center shadow-sm relative overflow-hidden h-fit sticky top-24"
            >
              {upcomingEvent ? (
                // Active State
                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${upcomingEvent.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                      upcomingEvent.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                      <CheckCircle className="w-3 h-3" /> {upcomingEvent.status || 'Active'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/edit-event/${upcomingEvent.id}`)}
                        className="p-2 rounded-full text-gray-400 hover:text-[#D6336C] hover:bg-pink-50 transition-colors"
                        title="Edit Event"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(upcomingEvent.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{upcomingEvent.title || 'Untitled Event'}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{upcomingEvent.date ? new Date(upcomingEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date Not Set'}</span>
                  </div>

                  {/* AI Planner CTA */}
                  <button
                    onClick={() => navigate('/ai-planner')}
                    className="w-full mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4" />
                    Plan with AI
                  </button>



                  {/* Progress Bar (Mocked for now as we don't have task completion % in simple model yet) */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div
                      className="bg-[#D6336C] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${30}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 text-right">30% Planned</p>
                </div>
              ) : (
                // Empty State
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No Upcoming Events</h3>
                  <p className="text-sm text-gray-500 mb-4">Ready to start planning your big day?</p>
                  <button
                    onClick={() => navigate('/create-event')}
                    className="text-sm font-medium text-[#D6336C] border border-[#D6336C] px-4 py-2 rounded-full hover:bg-[#D6336C] hover:text-white transition-all"
                  >
                    Start Planning
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
