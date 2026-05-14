"use client";
import React from 'react';
import { motion } from 'framer-motion';

const RecentBookings = () => {
    const bookings = [
        { customer: 'Sarah Jenkins', service: 'Premium Audio Setup', date: 'May 20, 2024', status: 'Confirmed', statusColor: 'bg-secondary-container text-on-secondary-container border-secondary/20' },
        { customer: 'David Miller', service: 'Outdoor Lighting', date: 'May 22, 2024', status: 'Pending', statusColor: 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary/20' },
        { customer: 'Elena Rodriguez', service: 'Stage Rental', date: 'May 12, 2024', status: 'Completed', statusColor: 'bg-surface-container-highest text-on-surface-variant border-outline/20' },
        { customer: 'Michael Chen', service: 'DJ Equipment', date: 'May 10, 2024', status: 'Cancelled', statusColor: 'bg-error-container text-on-error-container border-error/20' },
    ];

    return (
        <div className="card-level-1 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
                <h4 className="text-xl font-black tracking-tight">Recent Bookings</h4>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-primary font-bold hover:underline bg-primary-fixed px-4 py-1.5 rounded-full"
                >
                    View All Bookings
                </motion.button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surface-container-low/30 border-b border-outline-variant">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">Customer Name</th>
                            <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">Service</th>
                            <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                        {bookings.map((booking, idx) => (
                            <motion.tr 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="hover:bg-primary-fixed/30 transition-colors"
                            >
                                <td className="px-6 py-6 font-bold text-on-surface">{booking.customer}</td>
                                <td className="px-6 py-6 text-on-surface-variant">{booking.service}</td>
                                <td className="px-6 py-6 text-on-surface-variant">{booking.date}</td>
                                <td className="px-6 py-6">
                                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${booking.statusColor}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <button className="material-symbols-outlined p-2 hover:bg-white rounded-full transition-all text-on-surface-variant">more_vert</button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentBookings;
