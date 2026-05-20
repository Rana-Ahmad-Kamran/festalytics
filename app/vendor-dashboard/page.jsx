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
import { listenToIncomingQuotations } from "@/lib/firestore/quotations";

const VendorDashboard = () => {
    const [vendorName, setVendorName] = useState("Alex Rivera");
    const [vendorSlug, setVendorSlug] = useState("zaydan-banquet-hall");
    const [incomingQuotations, setIncomingQuotations] = useState([]);
    const [quotationsError, setQuotationsError] = useState(null);

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
                            if (userData.venueId) {
                                setVendorSlug(userData.venueId);
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

    useEffect(() => {
        const unsubscribe = listenToIncomingQuotations(
            vendorSlug,
            (quotations) => {
                setIncomingQuotations(quotations);
                setQuotationsError(null);
            },
            (error) => {
                setQuotationsError(error.message);
            }
        );

        return () => unsubscribe();
    }, [vendorSlug]);

    const metrics = [
        { icon: 'calendar_month', label: 'Total Bookings', value: '24', trend: '+12%', iconBg: 'bg-primary-fixed' },
        { icon: 'payments', label: 'Revenue', value: 'Rs. 4,250', trend: '+8%', iconBg: 'bg-tertiary-fixed' },
        { icon: 'notification_important', label: 'Pending Requests', value: String(incomingQuotations.length), trendLabel: 'Live from ERP', iconBg: 'bg-error-container' },
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

            {/* Incoming quotation requests (real-time) */}
            <section className="mb-8">
                <div className="card-level-1 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
                        <div>
                            <h4 className="text-xl font-black tracking-tight">Incoming Quotation Requests</h4>
                            <p className="text-sm text-on-surface-variant mt-1">
                                Venue: <span className="font-semibold">{vendorSlug}</span>
                            </p>
                        </div>
                        <span className="px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border bg-error-container text-on-error-container border-error/20">
                            {incomingQuotations.length} pending
                        </span>
                    </div>
                    {quotationsError ? (
                        <p className="p-6 text-sm text-error">{quotationsError}</p>
                    ) : incomingQuotations.length === 0 ? (
                        <p className="p-6 text-sm text-on-surface-variant">No pending quotation requests right now.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-container-low/30 border-b border-outline-variant">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">Event Date</th>
                                        <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">Guests</th>
                                        <th className="px-6 py-4 text-xs font-black text-on-surface-variant uppercase tracking-widest">Menu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {incomingQuotations.map((q) => (
                                        <tr key={q.id} className="hover:bg-primary-fixed/30 transition-colors">
                                            <td className="px-6 py-6 font-bold text-on-surface">{q.customerName}</td>
                                            <td className="px-6 py-6 text-on-surface-variant">{q.eventDate}</td>
                                            <td className="px-6 py-6 text-on-surface-variant">{q.guestCount}</td>
                                            <td className="px-6 py-6 text-on-surface-variant">
                                                {typeof q.selectedMenu === "object"
                                                    ? q.selectedMenu?.packageName || q.selectedMenu?.name || "—"
                                                    : String(q.selectedMenu ?? "—")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
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
