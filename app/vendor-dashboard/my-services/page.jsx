"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ServiceCard from '@/components/vendor/ServiceCard';
import ServiceFilters from '@/components/vendor/ServiceFilters';
import Pagination from '@/components/vendor/Pagination';

const MyServices = () => {
    const services = [
        {
            title: "Grand Azure Ballroom",
            category: "Premium Venue",
            price: "$1,200/event",
            bookings: "142",
            rating: "4.9",
            status: "Active",
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLqkmpv-tKIE64uT85t9dw_PmrKxVQA9pCImmMNAKiJc0GF4ad7sgHvokk26Vn74G2V_ej-b2jmpornD4tFS2Jv5A2jlNgj3FcsFQvxEjau4DkuDFBhk8b5Meqp0dMAwplpTUxZik1fPBUcfgPSPWLRURsPm0h8ObdybU1XKrFtRJpXyFjw6aeRIjjAnEEUz651m8n1JNo4K4F_Kba62CXP_slwnsriDFVTav2KrlUNVfbunk0s_Z3qOa6x5_I9icgqb7bZkcBzNA",
            badgeColor: "bg-primary-fixed text-on-primary-fixed-variant"
        },
        {
            title: "Artisan Fusion Buffet",
            category: "Catering",
            price: "$45/guest",
            bookings: "0",
            rating: null,
            status: "Draft",
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvvFXxN6Vds8biGS1TVYaihPnWbagWZFCWqww10B_1OneZiMdHHYANZMQPpygUQABzsnjEXGIoDj6t5oUMUw-yhgiZyni18YiZj283Dt7wKUu_IlzOzFQzri_5swLkMpncgv2nizQd2UfEO4VqwHlRZsDQZEcd4P0ha9taG4MqgMWhbUh8UUAUquO8vlBk2UYa2ijXPsNLH7AnOKagbt4UFnP8F1sB3ER1RviJKFBxOr0p7dXKInsVq0-LZaj8qDLjlKmzeHRFWaw",
            badgeColor: "bg-secondary-fixed text-on-secondary-fixed-variant"
        },
        {
            title: "Electric Vibes DJ Crew",
            category: "Entertainment",
            price: "$800/night",
            bookings: "28",
            rating: "5.0",
            status: "Pending",
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAV1q3B5bYyRp08Mnwdbg5mCYvGa_yi368QdEvK5oKTjb5I-I4yqL32Ee8hIir8yJAjGU49Pvuwigl11DuyKNVlfcN7legadhjpKirIGmugSNcAHFplS1f5l2Mgur3eaERcLl0mL_xSEhD9M7lCNE3X-p_floWiVg5wH0rWxr9h2txUEq5Evx7ymewk3B3LDSrg2hgcvLtS_V5OR6-k3kOyCs38cDmRhKvtgSyUsfdjUAEqqW52r2WLyfU9qT788q9pSJgWgMTQQf8",
            badgeColor: "bg-tertiary-fixed text-on-tertiary-fixed-variant"
        },
        {
            title: "Modern Summit Hall",
            category: "Conference",
            price: "$2,500/day",
            bookings: "56",
            rating: "4.7",
            status: "Active",
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJZOrqmKovv1Msvoqxf9pZcphDELLCSnKH1jPCriBiXs7aObyb2oOFe8Re76Ph8RyA5J2H71HbidrvK21V9ymk0m_aouXan3SUv9Mg5iF8Tf1guc_QxwgDNsu3k7qUACaVUqkO0PuBpYaYCZMsrCqSjICh9iXAeK5M_SXhfdVI6vQaiz8_gWo9aMG3YR-1jO1Y8tnKdD9tsY5Kjt84DiawCf2-PrpoT429dy86zWuzNxRGj2kcXdBOICn4osCCQrz6ChScLNCSdiA",
            badgeColor: "bg-primary-fixed text-on-primary-fixed-variant"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <nav className="flex items-center gap-2 text-sm text-secondary font-medium mb-2">
                        <a className="hover:text-primary transition-colors" href="/vendor-dashboard">Dashboard</a>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-on-surface-variant">Services</span>
                    </nav>
                    <h2 className="text-4xl font-black text-on-surface tracking-tight">My Services</h2>
                </div>
                    <Link href="/vendor-dashboard/my-services/create">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-[0_8px_24px_rgba(224,64,160,0.3)]"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            Create New Service
                        </motion.button>
                    </Link>
            </div>

            {/* Filter Bar */}
            <ServiceFilters />

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {services.map((service, idx) => (
                    <ServiceCard key={idx} {...service} />
                ))}
            </div>

            {/* Pagination */}
            <Pagination current={12} total={24} />

            {/* Mobile FAB */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-[0_12px_24px_rgba(224,64,160,0.4)] flex items-center justify-center z-50 md:hidden"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </motion.button>
        </motion.div>
    );
};

export default MyServices;
