import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Edit3, Trash2 } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

const MyEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const storedEvents = JSON.parse(localStorage.getItem('festalytics_events') || '[]');
        setEvents(storedEvents);
    }, []);

    const handleDelete = (e, eventId) => {
        e.stopPropagation();
        const updatedEvents = events.filter(ev => ev.id !== eventId);
        localStorage.setItem('festalytics_events', JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans flex flex-col">
            <DashboardHeader />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Events</h1>
                        <p className="text-gray-500 mt-1">Manage all your upcoming and past events.</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-event')}
                        className="flex items-center gap-2 bg-[#D6336C] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-pink-200 hover:brightness-110 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Event
                    </button>
                </div>

                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Plus className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
                        <p className="text-gray-500 mb-8 max-w-md">You haven't created any events yet. Start planning your first event now!</p>
                        <button
                            onClick={() => navigate('/create-event')}
                            className="bg-[#D6336C] text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-colors"
                        >
                            Create Your First Event
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => navigate(`/manage-event/${event.id}`)}
                                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full cursor-pointer relative"
                            >
                                {/* Card Image */}
                                <div className="h-48 relative overflow-hidden bg-gray-100">
                                    <img
                                        src={event.image || "https://images.unsplash.com/photo-1505236858274-038a44874e17?w=800&q=80"}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm capitalize">
                                        {event.eventType || 'Event'}
                                    </div>
                                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-emerald-100 text-emerald-700">
                                        {event.status || 'Active'}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date Not Set'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="line-clamp-1">{event.location || 'Location Not Set'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-50">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/edit-event/${event.id}`); }}
                                            className="flex-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl py-2.5 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit3 className="w-4 h-4" /> Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, event.id)}
                                            className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
};

export default MyEvents;
