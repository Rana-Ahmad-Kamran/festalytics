"use client";
import React from 'react';
import { motion } from 'framer-motion';
import AnalyticsKPIs from '@/components/vendor/analytics/AnalyticsKPIs';
import { 
    RevenueTrendChart, 
    BookingStatusChart, 
    PopularServicesChart, 
    MonthlyPerformanceChart 
} from '@/components/vendor/analytics/AnalyticsCharts';
import { 
    SatisfactionPanel, 
    ServicePerformanceTable, 
    PaymentActivityTable 
} from '@/components/vendor/analytics/AnalyticsTables';

const AnalyticsPage = () => {
    return (
        <div className="flex flex-col gap-10 pb-12">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-center gap-6 px-4">
                <div>
                    <h2 className="text-4xl font-black text-on-surface tracking-tighter mb-2">Analytics</h2>
                    <p className="text-secondary font-bold uppercase text-[10px] tracking-[0.2em]">Deep dive into your performance data</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-surface-container-high rounded-full px-5 py-2.5 gap-3 text-on-surface-variant font-black text-[10px] uppercase tracking-widest border border-outline-variant shadow-sm cursor-pointer hover:bg-white transition-all">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        <span>This Month</span>
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary text-on-primary px-8 py-3 rounded-full font-black text-[10px] tracking-[0.2em] shadow-[0_8px_24px_rgba(224,64,160,0.3)] flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        EXPORT REPORT
                    </motion.button>
                </div>
            </header>

            {/* KPI Section */}
            <AnalyticsKPIs />

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RevenueTrendChart />
                <BookingStatusChart />
                <PopularServicesChart />
                <MonthlyPerformanceChart />
            </div>

            {/* Satisfaction & Reviews */}
            <SatisfactionPanel />

            {/* Performance Tables */}
            <ServicePerformanceTable />
            <PaymentActivityTable />
        </div>
    );
};

export default AnalyticsPage;
