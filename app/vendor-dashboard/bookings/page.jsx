"use client";
import React from 'react';
import { motion } from 'framer-motion';
import BookingStats from '@/components/vendor/bookings/BookingStats';
import BookingFilters from '@/components/vendor/bookings/BookingFilters';
import BookingTable from '@/components/vendor/bookings/BookingTable';

const BookingsPage = () => {
    return (
        <div className="flex flex-col gap-10">
            {/* Header with Breadcrumbs */}
            <header className="flex flex-wrap justify-between items-end gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <span>Dashboard</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-primary">Bookings</span>
                    </div>
                    <h2 className="text-5xl font-black text-on-surface tracking-tighter">Bookings</h2>
                </div>
                
                <div className="flex items-center gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-white text-on-surface-variant rounded-2xl border border-outline-variant hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined">download</span>
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-white text-on-surface-variant rounded-2xl border border-outline-variant hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined">print</span>
                    </motion.button>
                </div>
            </header>

            {/* Stats Section */}
            <BookingStats />

            {/* Main Content Section */}
            <section className="space-y-6">
                <BookingFilters />
                <BookingTable />
            </section>
        </div>
    );
};

export default BookingsPage;
