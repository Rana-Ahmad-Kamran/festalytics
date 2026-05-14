"use client";
import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsKPIs = () => {
    const kpis = [
        { label: 'Total Revenue', value: '$12,450', trend: '+15%', icon: 'payments', color: 'primary', bg: 'primary-fixed', shadow: 'candy-shadow-pink' },
        { label: 'Total Bookings', value: '127', trend: '+8', icon: 'calendar_today', color: 'secondary', bg: 'secondary-container' },
        { label: 'Conversion Rate', value: '3.2%', trend: null, icon: 'filter_alt', color: 'tertiary', bg: 'tertiary-fixed' },
        { label: 'Average Rating', value: '4.7/5', trend: '4.7', icon: 'star', color: 'primary', bg: 'surface-container-high', isRating: true },
    ];

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className={`bg-white p-6 rounded-3xl border border-outline-variant shadow-lg hover:shadow-xl transition-all duration-300 ${kpi.shadow || ''}`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 bg-${kpi.bg} rounded-2xl text-${kpi.color}`}>
                            <span className={`material-symbols-outlined text-2xl ${kpi.isRating ? 'fill-1' : ''}`}>
                                {kpi.icon}
                            </span>
                        </div>
                        {kpi.trend && (
                            <div className={`flex items-center gap-1 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider
                                ${kpi.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-fixed text-primary'}
                            `}>
                                {kpi.trend.startsWith('+') && <span className="material-symbols-outlined text-xs">trending_up</span>}
                                {kpi.trend}
                            </div>
                        )}
                        {!kpi.trend && kpi.label === 'Conversion Rate' && (
                            <span className="material-symbols-outlined text-outline">horizontal_rule</span>
                        )}
                    </div>
                    <h3 className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.15em]">{kpi.label}</h3>
                    <p className="text-4xl font-black text-on-surface mt-2 tracking-tight">{kpi.value}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 mt-3 uppercase tracking-widest">
                        {kpi.label === 'Average Rating' ? 'From 28 reviews' : 'vs last period'}
                    </p>
                </motion.div>
            ))}
        </section>
    );
};

export default AnalyticsKPIs;
