"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MetricCard from '@/components/vendor/MetricCard';
import RecentBookings from '@/components/vendor/RecentBookings';
import Calendar from '@/components/vendor/Calendar';
import AnalyticsPreview from '@/components/vendor/AnalyticsPreview';
import { db, auth } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const VendorDashboard = () => {
    const [vendorName, setVendorName] = useState("Alex Rivera");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (user.displayName) {
                    setVendorName(user.displayName);
                } else {
                    try {
                        const userDocRef = doc(db, "users", user.uid);
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            const userData = userDocSnap.data();
                            if (userData.name) {
                                setVendorName(userData.name);
                            }
                        }
                    } catch (err) {
                        console.error("Error fetching vendor name: ", err);
                    }
                }
            } else {
                setVendorName("Alex Rivera");
            }
        });
        return () => unsubscribe();
    }, []);

    const metrics = [
        { icon: 'calendar_month', label: 'Total Bookings', value: '24', trend: '+12%', iconBg: 'bg-primary-fixed' },
        { icon: 'payments', label: 'Revenue', value: '$4,250', trend: '+8%', iconBg: 'bg-tertiary-fixed' },
        { icon: 'notification_important', label: 'Pending Requests', value: '3', trendLabel: 'View All', iconBg: 'bg-error-container' },
        { icon: 'star', label: 'Average Rating', value: '4.8', trendLabel: '124 reviews', iconBg: 'bg-secondary-fixed' },
    ];

    // Format current date dynamically
    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).toUpperCase();

    return (
        <>
            {/* Welcome Section */}
            <section className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <p className="text-xs font-black text-primary mb-1 uppercase tracking-widest">{formattedDate}</p>
                    <h2 className="text-4xl font-black text-on-surface tracking-tight">Welcome back, {vendorName}!</h2>
                    <p className="text-lg text-on-surface-variant">Here's what's happening with your event services today.</p>
                </motion.div>
                <div className="flex gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-8 h-12 bg-white border-2 border-primary text-primary font-bold rounded-full hover:bg-primary-fixed transition-all shadow-md"
                    >
                        <span className="material-symbols-outlined">event</span>
                        View Schedule
                    </motion.button>
                    <Link href="/vendor-dashboard/my-services/create">
                        <motion.button 
                            whileHover={{ scale: 1.05, shadow: '0 20px 25px -5px rgb(224 64 160 / 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-8 h-12 bg-primary text-white font-bold rounded-full transition-all shadow-lg shadow-primary/30"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Create Service
                        </motion.button>
                    </Link>
                </div>
            </section>

            {/* Key Metrics Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric, idx) => (
                    <MetricCard key={idx} {...metric} />
                ))}
            </section>

            {/* Recent Activity & Calendar Section */}
            <section className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mb-8">
                <RecentBookings />
                <Calendar />
            </section>

            {/* Analytics Preview */}
            <AnalyticsPreview />
        </>
    );
};

export default VendorDashboard;
