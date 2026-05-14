"use client";
import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ icon, label, value, trend, trendLabel, iconBg }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="card-level-1 p-6 rounded-3xl"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-full shadow-inner ${iconBg}`}>
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-xs font-bold text-secondary bg-secondary-fixed px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-xs">trending_up</span>
                        {trend}
                    </span>
                )}
                {trendLabel && (
                    <span className="text-xs font-bold text-on-surface-variant">{trendLabel}</span>
                )}
            </div>
            <p className="text-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">{label}</p>
            <h3 className="text-5xl font-black text-on-surface">{value}</h3>
        </motion.div>
    );
};

export default MetricCard;
