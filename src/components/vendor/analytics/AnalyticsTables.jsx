"use client";
import React from 'react';
import { motion } from 'framer-motion';

export const SatisfactionPanel = () => (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Breakdown */}
        <div className="lg:col-span-1 bg-white p-10 rounded-[2.5rem] border border-outline-variant shadow-xl flex flex-col items-center">
            <h4 className="font-black text-xl text-on-surface self-start mb-8 tracking-tight">Customer Satisfaction</h4>
            <div className="text-7xl font-black text-primary mb-3 tracking-tighter">4.7</div>
            <div className="flex mb-8 scale-150">
                {[1, 2, 3, 4].map(i => (
                    <span key={i} className="material-symbols-outlined text-primary fill-1">star</span>
                ))}
                <span className="material-symbols-outlined text-primary fill-1">star_half</span>
            </div>
            <div className="w-full space-y-4">
                {[
                    { star: 5, pct: 82 },
                    { star: 4, pct: 12 },
                    { star: 3, pct: 4 },
                    { star: 2, pct: 2 },
                ].map((item) => (
                    <div key={item.star} className="flex items-center gap-5">
                        <span className="text-xs font-black w-4 text-on-surface-variant">{item.star}</span>
                        <div className="flex-1 h-3 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.pct}%` }}
                                transition={{ delay: 1.5, duration: 1 }}
                                className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(224,64,160,0.3)]"
                            ></motion.div>
                        </div>
                        <span className="text-[10px] text-outline font-black w-8">{item.pct}%</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Reviews Preview */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-outline-variant shadow-xl">
            <div className="flex justify-between items-center mb-8">
                <h4 className="font-black text-xl text-on-surface tracking-tight">Latest Reviews</h4>
                <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">View All Reviews</button>
            </div>
            <div className="space-y-5">
                {[
                    { name: 'James Smith', initials: 'JS', service: 'Luxury Wedding Decor', rating: 5, comment: "Absolutely phenomenal service! The decor exceeded our expectations and the team was professional throughout.", color: 'secondary' },
                    { name: 'Anita Miller', initials: 'AM', service: 'Gourmet Catering', rating: 4, comment: "Food was great, though delivery was 10 minutes late. Everyone loved the appetizers!", color: 'tertiary' },
                ].map((review, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ x: 10 }}
                        className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant hover:bg-white hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl bg-${review.color}-fixed flex items-center justify-center text-${review.color} font-black text-sm shadow-sm`}>
                                    {review.initials}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-on-surface">{review.name}</div>
                                    <div className="text-[10px] text-outline font-black uppercase tracking-[0.1em] mt-1">{review.service}</div>
                                </div>
                            </div>
                            <div className="flex text-primary gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'fill-1' : ''}`}>
                                        {i < review.rating ? 'star' : 'star_outline'}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-on-surface-variant italic font-medium leading-relaxed">"{review.comment}"</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export const ServicePerformanceTable = () => (
    <div className="bg-white rounded-[2.5rem] border border-outline-variant shadow-xl overflow-hidden">
        <div className="p-8 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
            <h4 className="font-black text-xl text-on-surface tracking-tight">Service Performance</h4>
            <button className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 group">
                VIEW FULL REPORT 
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-surface-container-low/50 text-[10px] font-black text-outline uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-8 py-5">Service</th>
                        <th className="px-8 py-5">Bookings</th>
                        <th className="px-8 py-5 text-right">Revenue</th>
                        <th className="px-8 py-5 text-center">Avg Rating</th>
                        <th className="px-8 py-5">Last Booked</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                    {[
                        { name: 'Luxury Wedding Decor', bookings: 45, revenue: '$6,200', rating: 4.9, date: 'Oct 12, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCp2NMw7fwpmKB-J2Syj-GD6qKA6mp-mZWCFn1DzGeJiqgEH_vb3onXfZlMFrA11uNK9dEdHXdVx1biO141HKVSoi6UPOrksUsQTv0yxyDG2eZfJawi_zDUvoadxXJGtYB0DRNuww99VioiT7t6qFNeyh_NBllNxUz9z5mJ_ib652R6fDZ-nUxshf16MrLGRz9lzpBp9Hl-5ThlQU-Osryjm2USwTDLlfdhWLRyNo7HeBWE7yENvlM5AGrzF5NqkjrTEPP_C7QO-_A' },
                        { name: 'Gourmet Catering Pack', bookings: 38, revenue: '$4,150', rating: 4.7, date: 'Oct 10, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo9NTKjx5VatXfL5j3YCiI5_CsB_zFFcypPfww9bg7yrNsEx-yCMXjv0Dp2FQzrmJHBnWSqeIBuYK396sAt62XJHZSFXaYOnLHano_ZcK90MbZyu6YuWLEtldwZmmF7A03ReTqYXE0GYMmqjGro1bT9lTOZRSLlt9fuAax8weZ5AWOtRG5NqpzjIiZOxmADmYaLM-12p4M8g_juOevg4Gnl6WdYeouT5MUidoqsswVPSscZquw5HXj9oLf1ApwkoL8OTVM-1VxPqQ' },
                        { name: 'Pro AV Setup', bookings: 24, revenue: '$1,800', rating: 4.5, date: 'Oct 08, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO-YCQhqjFOYzusdu-CvUX5ye6v23zzD6nPQ8AXkcVYojqOXlw4eoFBwzuzBhjCElysW_RxIILVGs5HUGIz_uINkILVhXiMAHDJOENsjadVZ_-B2bT9UoIuQsqAisOJvIlMTxLnqbLH7CBjVuz80CFTN8tZ5yxvCP63AcTAatJtF9PLHVR_AOTFXEJpEbpvKZjv2FYpWcxCwa7-PPnbCPPv6lXDpNuOP63sDDuCo4njy91g2hhDRRM1jXLuSGQSk09yt5LhIeNnm0' },
                    ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-fixed overflow-hidden shadow-sm ring-1 ring-outline-variant/30">
                                        <img src={row.img} alt={row.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    </div>
                                    <span className="font-black text-on-surface text-sm">{row.name}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 font-bold text-on-surface-variant text-sm">{row.bookings}</td>
                            <td className="px-8 py-5 font-black text-primary text-sm text-right">{row.revenue}</td>
                            <td className="px-8 py-5 text-center">
                                <div className="inline-flex items-center gap-1.5 font-black text-sm bg-primary-fixed px-3 py-1 rounded-full text-primary">
                                    {row.rating} <span className="material-symbols-outlined text-sm fill-1">star</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">{row.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const PaymentActivityTable = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Performance */}
        <div className="bg-white rounded-[2.5rem] border border-outline-variant shadow-xl overflow-hidden">
            <div className="p-8 border-b border-outline-variant bg-surface-container-low/50">
                <h4 className="font-black text-lg text-on-surface tracking-tight">Weekly Performance</h4>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surface-container-low/50 text-[10px] font-black text-outline uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-5">Day</th>
                            <th className="px-8 py-5">Bookings</th>
                            <th className="px-8 py-5 text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                        {[
                            { day: 'Monday', bookings: 12, revenue: '$1,200', active: false },
                            { day: 'Wednesday', bookings: 15, revenue: '$1,450', active: false },
                            { day: 'Saturday', bookings: 34, revenue: '$3,800', active: true },
                            { day: 'Sunday', bookings: 28, revenue: '$2,900', active: true },
                        ].map((row, idx) => (
                            <tr key={idx} className={`hover:bg-surface-container-low transition-colors ${row.active ? 'bg-primary-fixed/20' : ''}`}>
                                <td className="px-8 py-4 font-black text-sm text-on-surface">{row.day}</td>
                                <td className={`px-8 py-4 font-bold text-sm ${row.active ? 'text-primary' : 'text-on-surface-variant'}`}>{row.bookings}</td>
                                <td className={`px-8 py-4 font-black text-sm text-right ${row.active ? 'text-primary' : 'text-on-surface-variant'}`}>{row.revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-[2.5rem] border border-outline-variant shadow-xl overflow-hidden">
            <div className="p-8 border-b border-outline-variant bg-surface-container-low/50">
                <h4 className="font-black text-lg text-on-surface tracking-tight">Recent Payments</h4>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surface-container-low/50 text-[10px] font-black text-outline uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Booking ID</th>
                            <th className="px-8 py-5">Amount</th>
                            <th className="px-8 py-5 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                        {[
                            { date: 'Oct 14, 2023', id: '#BK-9021', amount: '$450', status: 'Paid', color: 'tertiary' },
                            { date: 'Oct 14, 2023', id: '#BK-9018', amount: '$1,200', status: 'Paid', color: 'tertiary' },
                            { date: 'Oct 13, 2023', id: '#BK-8995', amount: '$780', status: 'Pending', color: 'secondary' },
                        ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                                <td className="px-8 py-4 text-xs font-black text-outline uppercase tracking-widest">{row.date}</td>
                                <td className="px-8 py-4 font-black text-primary text-sm tracking-widest">{row.id}</td>
                                <td className="px-8 py-4 font-black text-on-surface text-sm">{row.amount}</td>
                                <td className="px-8 py-4 text-right">
                                    <span className={`px-4 py-1.5 bg-${row.color}-fixed text-${row.color} text-[10px] font-black rounded-full uppercase tracking-widest border border-${row.color}/10`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
