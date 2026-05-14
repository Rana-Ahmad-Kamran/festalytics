"use client";
import React from 'react';
import { motion } from 'framer-motion';

const BookingStats = () => {
    const stats = [
        { label: 'Total Bookings', value: '147', change: '+12%', icon: 'list_alt', color: 'primary', shadow: 'candy-shadow-pink' },
        { label: 'Pending Approval', value: '3', change: 'New', icon: 'pending_actions', color: 'tertiary', shadow: 'candy-shadow-blue' },
        { label: 'Confirmed', value: '102', change: '84%', icon: 'check_circle', color: 'secondary', shadow: 'candy-shadow-purple' },
        { label: 'Completed', value: '42', change: null, icon: 'task_alt', color: 'outline', shadow: 'shadow-sm' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`bg-white p-6 rounded-3xl border-b-4 border-${stat.color} shadow-lg hover:shadow-xl transition-all cursor-default relative overflow-hidden group`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-14 h-14 bg-${stat.color}/10 rounded-2xl flex items-center justify-center text-${stat.color} transition-transform group-hover:scale-110`}>
                            <span className="material-symbols-outlined text-3xl fill-1">{stat.icon}</span>
                        </div>
                        {stat.change && (
                            <span className={`text-[10px] font-black text-${stat.color} bg-${stat.color}-fixed px-3 py-1 rounded-full uppercase tracking-wider`}>
                                {stat.change}
                            </span>
                        )}
                    </div>
                    <p className="text-on-surface-variant font-bold text-sm uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-4xl font-black text-on-surface mt-2 tracking-tight">{stat.value}</h3>
                    
                    {/* Decorative element */}
                    <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-${stat.color}/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                </motion.div>
            ))}
        </div>
    );
};

export default BookingStats;
