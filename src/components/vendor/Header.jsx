"use client";
import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
    return (
        <header className="fixed top-0 right-0 left-0 z-50 flex justify-between items-center px-8 h-20 bg-white/80 backdrop-blur-md ml-[260px] border-b border-outline-variant shadow-sm">
            <div className="flex items-center flex-1 max-w-xl">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
                    <input 
                        className="w-full h-12 pl-12 pr-6 bg-surface-container-low border-2 border-outline-variant rounded-full focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="Search analytics, bookings..." 
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 ml-8">
                <motion.button 
                    whileHover={{ scale: 1.1, backgroundColor: 'var(--color-primary-fixed)' }}
                    whileTap={{ scale: 0.9 }}
                    className="material-symbols-outlined p-3 text-on-surface-variant rounded-full cursor-pointer transition-all"
                >
                    notifications
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.1, backgroundColor: 'var(--color-primary-fixed)' }}
                    whileTap={{ scale: 0.9 }}
                    className="material-symbols-outlined p-3 text-on-surface-variant rounded-full cursor-pointer transition-all"
                >
                    settings
                </motion.button>
                <div className="h-8 w-px bg-outline-variant mx-2"></div>
                <div className="flex items-center gap-2 cursor-pointer group hover:bg-primary-fixed p-2 pr-4 rounded-full transition-all">
                    <img 
                        alt="Vendor Profile Avatar" 
                        className="h-10 w-10 rounded-full object-cover border-2 border-primary" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0dk2M79C3xRWVECpanYySfp7qBsT21kYS2jSXptblBFD6B2FKrFJVEK0WYBs8OgL2ts9EkVKX86SUBwI3DjGluNAOnVVOpfEMrFJMLrSvklHicNQu9BIZd37PsSGY7zMcfqWoPpr2bVX3lKjryml0kbQRNNElm9FkME4uKbzVqPNWapjSDgqdgAb7oNwQESRMRRnkVgK54d5ELniaB7N8hxgYKOt9wn8_rFfN06mzBNanxHZr5fEDP-M7qUgUuzsge-91-07ElYw"
                    />
                    <span className="font-bold text-on-surface">Alex Rivera</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
