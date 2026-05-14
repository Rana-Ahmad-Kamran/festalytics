"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SmallCalendar from '@/components/vendor/availability/SmallCalendar';
import DayBookings from '@/components/vendor/availability/DayBookings';
import AvailabilitySettings from '@/components/vendor/availability/AvailabilitySettings';

const AvailabilityPage = () => {
    const [view, setView] = useState('Month');

    return (
        <div className="flex flex-col h-full min-h-[calc(100vh-80px)]">
            {/* Page Header */}
            <header className="flex flex-wrap justify-between items-center gap-6 mb-10 px-4">
                <div className="flex items-center gap-8">
                    <div>
                        <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2">Availability</h2>
                        <p className="text-secondary font-bold uppercase text-[10px] tracking-[0.2em]">Manage your schedule & bookings</p>
                    </div>
                    
                    {/* View Toggles */}
                    <div className="flex bg-surface-container-high p-1.5 rounded-full border border-outline-variant shadow-inner">
                        {['Month', 'Week', 'Day'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-6 py-2 rounded-full text-xs font-black tracking-widest transition-all duration-300
                                    ${view === v 
                                        ? 'bg-white shadow-lg text-primary scale-105' 
                                        : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}
                                `}
                            >
                                {v.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-secondary px-8 py-4 rounded-full font-black text-xs tracking-widest border-2 border-outline-variant hover:border-secondary transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">file_download</span>
                        EXPORT CALENDAR
                    </motion.button>
                </div>
            </header>

            <div className="flex flex-col xl:flex-row gap-10 flex-1">
                {/* Left Column: Calendar View */}
                <aside className="w-full xl:w-[420px] flex-shrink-0">
                    <SmallCalendar />
                </aside>

                {/* Right Column: Details Panel */}
                <main className="flex-1 space-y-8">
                    {/* Details Header Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-3xl shadow-[0_8px_32px_rgba(124,82,170,0.05)] border border-outline-variant"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-primary-container rounded-[2rem] flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                                    <span className="material-symbols-outlined text-3xl fill-1">event</span>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-secondary leading-tight tracking-tight">Friday, March 15, 2024</h4>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                                            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">3 Bookings</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Open 9:00 AM - 6:00 PM</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-8 py-3 rounded-full border-2 border-primary text-primary font-black text-xs tracking-widest hover:bg-primary-fixed transition-all active:scale-95">EDIT DAY</button>
                                <button className="px-8 py-3 rounded-full border-2 border-outline text-outline font-black text-xs tracking-widest hover:bg-surface-variant transition-all active:scale-95">CLEAR ALL</button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        <DayBookings />
                        <AvailabilitySettings />
                    </div>

                    {/* Quick Actions Footer */}
                    <div className="flex flex-wrap items-center gap-4 pt-4 mt-auto">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-secondary text-white px-10 py-5 rounded-full font-black text-xs tracking-[0.15em] shadow-[0_8px_24px_rgba(124,82,170,0.3)] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">sync</span>
                            SET RECURRING
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-error-container text-on-error-container px-10 py-5 rounded-full font-black text-xs tracking-[0.15em] flex items-center gap-2 border border-error/10"
                        >
                            <span className="material-symbols-outlined text-error">block</span>
                            MARK UNAVAILABLE
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05, shadow: '0 20px 25px -5px rgb(224 64 160 / 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-white px-12 py-5 rounded-full font-black text-xs tracking-[0.2em] shadow-[0_8px_24px_rgba(224,64,160,0.3)] ml-auto"
                        >
                            SAVE CHANGES
                        </motion.button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AvailabilityPage;
