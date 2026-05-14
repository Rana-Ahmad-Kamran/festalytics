"use client";
import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsPreview = () => {
    const barData = [
        { day: 'MON', height: '40%' },
        { day: 'TUE', height: '65%' },
        { day: 'WED', height: '50%' },
        { day: 'THU', height: '85%' },
        { day: 'FRI', height: '100%', active: true },
        { day: 'SAT', height: '30%' },
        { day: 'SUN', height: '45%' },
    ];

    const serviceData = [
        { label: 'Premium Audio Setup', value: 45, color: 'bg-primary' },
        { label: 'Outdoor Lighting', value: 32, color: 'bg-secondary' },
        { label: 'Stage Rental', value: 15, color: 'bg-tertiary' },
        { label: 'Other Services', value: 8, color: 'bg-outline-variant' },
    ];

    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-level-1 p-6 rounded-3xl bg-white">
                <h4 className="text-xl font-black tracking-tight mb-6">Last 7 Days Bookings</h4>
                <div className="h-[240px] flex items-end justify-between gap-4 px-4">
                    {barData.map((bar, idx) => (
                        <div key={idx} className="w-full flex flex-col items-center gap-2">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: bar.height }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className={`w-full rounded-full ${bar.active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-primary-fixed'}`}
                            ></motion.div>
                            <span className={`text-[10px] font-black ${bar.active ? 'text-primary' : 'text-on-surface-variant'}`}>{bar.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card-level-1 p-6 rounded-3xl bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-black tracking-tight">Service Popularity</h4>
                    <select className="bg-primary-fixed border-none font-bold text-xs text-primary px-4 py-2 rounded-full cursor-pointer outline-none focus:ring-2 focus:ring-primary/20">
                        <option>This Quarter</option>
                        <option>This Year</option>
                    </select>
                </div>
                <div className="space-y-6">
                    {serviceData.map((service, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs font-black tracking-wide">
                                <span>{service.label}</span>
                                <span className={service.color.replace('bg-', 'text-')}>{service.value}%</span>
                            </div>
                            <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${service.value}%` }}
                                    transition={{ duration: 1, delay: idx * 0.2 }}
                                    className={`h-full rounded-full ${service.color}`}
                                ></motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AnalyticsPreview;
