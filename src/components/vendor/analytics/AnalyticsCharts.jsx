"use client";
import React from 'react';
import { motion } from 'framer-motion';

export const RevenueTrendChart = () => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-xl shadow-primary/5 h-96 flex flex-col group">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h4 className="font-black text-xl text-on-surface tracking-tight">Revenue Trend</h4>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Growth over the last 6 months</p>
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/30"></div> Actual</span>
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 border-2 border-primary border-dashed rounded-full"></div> Target</span>
            </div>
        </div>
        <div className="flex-1 w-full bg-surface-container-low rounded-[2rem] relative overflow-hidden flex items-end px-8 pb-4">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[12rem] text-primary">show_chart</span>
            </div>
            <div className="w-full flex justify-between items-end h-full pt-12 gap-4">
                {[0.5, 0.75, 0.65, 1, 0.8, 0.95].map((h, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                        className={`w-full ${i === 3 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-primary-container'} rounded-t-2xl relative group/bar`}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity font-black">
                            ${(h * 3000).toFixed(0)}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </div>
);

export const BookingStatusChart = () => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-xl shadow-secondary/5 h-96 flex flex-col">
        <h4 className="font-black text-xl text-on-surface tracking-tight mb-8">Booking Status</h4>
        <div className="flex-1 flex items-center gap-10">
            <div className="relative w-48 h-48">
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e040a0" strokeWidth="4" strokeDasharray="78, 100" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c52aa" strokeWidth="4" strokeDasharray="12, 100" strokeDashoffset="-78" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0096cc" strokeWidth="4" strokeDasharray="8, 100" strokeDashoffset="-90" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e53e3e" strokeWidth="4" strokeDasharray="2, 100" strokeDashoffset="-98" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-on-surface">127</span>
                    <span className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mt-1">Total</span>
                </div>
            </div>
            <div className="space-y-4 flex-1">
                {[
                    { label: 'Confirmed', value: '78%', color: 'primary' },
                    { label: 'Pending', value: '12%', color: 'secondary' },
                    { label: 'Completed', value: '8%', color: 'tertiary' },
                    { label: 'Cancelled', value: '2%', color: 'error' },
                ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center group cursor-default">
                        <span className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">
                            <div className={`w-3 h-3 bg-${item.color} rounded-full shadow-lg shadow-${item.color}/20`}></div> 
                            {item.label}
                        </span>
                        <span className="text-sm font-black text-on-surface">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const PopularServicesChart = () => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-xl h-[480px] flex flex-col">
        <h4 className="font-black text-xl text-on-surface tracking-tight mb-8">Popular Services</h4>
        <div className="space-y-8">
            {[
                { label: 'Luxury Wedding Decor', bookings: 45, width: '90%', color: 'primary' },
                { label: 'Gourmet Catering Pack', bookings: 38, width: '75%', color: 'secondary' },
                { label: 'Pro AV Setup', bookings: 24, width: '50%', color: 'tertiary' },
                { label: 'Live Jazz Band', bookings: 15, width: '30%', color: 'primary-container' },
                { label: 'Photo Booth Express', bookings: 9, width: '18%', color: 'outline' },
            ].map((service, idx) => (
                <div key={idx} className="space-y-3 group">
                    <div className="flex justify-between text-[10px] font-black text-on-surface-variant uppercase tracking-widest group-hover:text-primary transition-colors">
                        <span>{service.label}</span>
                        <span>{service.bookings} BOOKINGS</span>
                    </div>
                    <div className="w-full h-4 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: service.width }}
                            transition={{ delay: idx * 0.1 + 0.5, duration: 1 }}
                            className={`h-full bg-${service.color} rounded-full shadow-lg shadow-${service.color}/20`}
                        ></motion.div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MonthlyPerformanceChart = () => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-xl h-[480px] flex flex-col">
        <div className="flex justify-between items-center mb-10">
            <h4 className="font-black text-xl text-on-surface tracking-tight">Monthly Performance</h4>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-full"></div> Revenue</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-tertiary rounded-full"></div> Bookings</span>
            </div>
        </div>
        <div className="flex-1 flex items-end justify-between px-4 pb-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                const h1 = [40, 55, 70, 85, 65, 100][i];
                const h2 = [30, 45, 50, 60, 40, 75][i];
                return (
                    <div key={month} className="flex flex-col items-center gap-6 h-full w-14">
                        <div className="flex-1 flex items-end justify-center gap-1.5 w-full">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h1}%` }}
                                transition={{ delay: i * 0.05 + 1, duration: 0.8 }}
                                className="w-4 bg-primary rounded-t-lg shadow-lg shadow-primary/10"
                            ></motion.div>
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h2}%` }}
                                transition={{ delay: i * 0.05 + 1.2, duration: 0.8 }}
                                className="w-4 bg-tertiary rounded-t-lg shadow-lg shadow-tertiary/10"
                            ></motion.div>
                        </div>
                        <span className="text-[10px] font-black text-outline uppercase tracking-widest">{month}</span>
                    </div>
                );
            })}
        </div>
    </div>
);
