"use client";
import React from 'react';
import { motion } from 'framer-motion';

const BusinessSettings = () => {
    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-4xl font-black text-on-background tracking-tighter">Business Information</h1>
                <p className="text-on-surface-variant font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Manage your brand presence and operational logistics</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Core Details */}
                <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 shadow-xl border border-outline-variant/30">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-primary-fixed rounded-2xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-2xl fill-1">info</span>
                        </div>
                        <h2 className="text-2xl font-black text-on-surface tracking-tight">Core Details</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Business Name</label>
                            <input className="w-full rounded-2xl border-2 border-transparent bg-surface-container-low px-6 py-4 focus:border-primary focus:ring-0 font-bold text-sm" type="text" defaultValue="Sweet Treats Co."/>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Registration Number</label>
                            <input className="w-full rounded-2xl border-2 border-transparent bg-surface-container-low px-6 py-4 focus:border-primary focus:ring-0 font-bold text-sm" type="text" defaultValue="REG-9920334-X"/>
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Website URL</label>
                            <input className="w-full rounded-2xl border-2 border-transparent bg-surface-container-low px-6 py-4 focus:border-primary focus:ring-0 font-bold text-sm" type="url" defaultValue="https://sweettreatsco.com"/>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Business Type</label>
                            <select className="w-full rounded-2xl border-2 border-transparent bg-surface-container-low px-6 py-4 focus:border-primary focus:ring-0 font-bold text-sm appearance-none cursor-pointer">
                                <option>Private Limited</option>
                                <option>Sole Proprietorship</option>
                                <option>Partnership</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Categories</label>
                            <div className="flex flex-wrap gap-2 bg-surface-container-low rounded-2xl p-3 border-2 border-transparent">
                                <span className="bg-primary text-white text-[10px] font-black py-2 px-4 rounded-full flex items-center gap-2 shadow-lg shadow-primary/20">
                                    BAKERY <span className="material-symbols-outlined text-[14px] cursor-pointer hover:rotate-90 transition-transform">close</span>
                                </span>
                                <span className="bg-secondary text-white text-[10px] font-black py-2 px-4 rounded-full flex items-center gap-2 shadow-lg shadow-secondary/20">
                                    EVENTS <span className="material-symbols-outlined text-[14px] cursor-pointer hover:rotate-90 transition-transform">close</span>
                                </span>
                                <button className="text-tertiary font-black text-[10px] px-4 py-2 hover:bg-white rounded-full transition-colors uppercase tracking-widest">+ Add Category</button>
                            </div>
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Business Description</label>
                            <textarea className="w-full rounded-3xl border-2 border-transparent bg-surface-container-low px-6 py-4 focus:border-primary focus:ring-0 font-bold text-sm resize-none" rows="4" defaultValue="Artisanal bakery specializing in whimsical event catering, custom sugar cookies, and boutique dessert tables for festive occasions and corporate events."></textarea>
                        </div>
                    </div>
                </section>

                {/* Operating Hours */}
                <section className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 shadow-xl border border-outline-variant/30 flex flex-col">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-2xl fill-1">schedule</span>
                        </div>
                        <h2 className="text-2xl font-black text-on-surface tracking-tight">Operating Hours</h2>
                    </div>
                    
                    <div className="space-y-6 flex-1">
                        {[
                            { day: 'Mon - Fri', hours: '09:00 - 18:00', active: true },
                            { day: 'Saturday', hours: '10:00 - 16:00', active: true },
                            { day: 'Sunday', hours: 'Closed', active: false },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <span className="font-black text-on-surface-variant text-[10px] uppercase tracking-widest">{item.day}</span>
                                <div className="flex items-center gap-4">
                                    {item.active ? (
                                        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
                                            <span className="text-sm font-black text-on-surface">{item.hours}</span>
                                            <span className="material-symbols-outlined text-sm text-primary cursor-pointer">edit</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-black text-outline uppercase tracking-[0.2em] bg-surface-container-highest/30 px-6 py-2 rounded-full">Closed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t-2 border-dashed border-outline-variant/30">
                        <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Special Breaks</h3>
                        <div className="flex items-center justify-between bg-secondary-container/50 p-4 rounded-2xl border border-secondary/10">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary text-xl fill-1">restaurant</span>
                                <span className="text-[10px] font-black text-on-secondary-container uppercase tracking-widest">Lunch Break</span>
                            </div>
                            <span className="text-[10px] font-black text-on-secondary-container">12:30 - 13:30</span>
                        </div>
                    </div>
                </section>

                {/* Business Address */}
                <section className="lg:col-span-12 bg-white rounded-[2.5rem] p-10 shadow-xl border border-outline-variant/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-tertiary-fixed rounded-2xl flex items-center justify-center text-tertiary">
                                    <span className="material-symbols-outlined text-2xl fill-1">location_on</span>
                                </div>
                                <h2 className="text-2xl font-black text-on-surface tracking-tight">Business Address</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Street Address</label>
                                    <input className="w-full rounded-2xl border-2 border-transparent bg-surface-container-low px-6 py-4 focus:border-tertiary focus:ring-0 font-bold text-sm transition-all" type="text" defaultValue="123 Confectionery Lane"/>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">City</label>
                                    <input className="w-full rounded-2xl border-2 border-transparent bg-surface-container-low px-6 py-4 focus:border-tertiary focus:ring-0 font-bold text-sm transition-all" type="text" defaultValue="Sugarland"/>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Postal Code</label>
                                    <input className="w-full rounded-2xl border-2 border-transparent bg-surface-container-low px-6 py-4 focus:border-tertiary focus:ring-0 font-bold text-sm transition-all" type="text" defaultValue="77478"/>
                                </div>
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-tertiary text-white font-black text-xs uppercase tracking-widest py-4 px-10 rounded-full shadow-xl shadow-tertiary/30 flex items-center gap-3"
                            >
                                <span className="material-symbols-outlined text-lg">save</span> 
                                UPDATE LOCATION
                            </motion.button>
                        </div>
                        
                        <div className="relative min-h-[400px] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-outline-variant/30 group">
                            <img 
                                alt="Map Location" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByUAxup7W5RNRb9YHJs3VnlPY-qDwX4s7NFqNjmjQPDoyx1eat5EMkztS18kdHecQHzYnG2itxOLBbm6tNDuoKEeRSQfB08LVmsp0FY17ncBPxfmp0i17gLD8F_KrCtN3FX4xXzDqTfKRHruhn-4z1_9XTf4cFNoMqt9ZY_TuJd-Q31Bwv6ZHKfaSpzgS9yp_kmwXMNcEUYGva-mW0zTxV4bY8fIEQEp0S_Dz7TlA3YEbZqzxchWY38-fzHpJPrcqvv88pyHpeJGY"
                            />
                            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-outline-variant/30">
                                <div className="p-3 bg-primary-fixed rounded-2xl shadow-sm">
                                    <span className="material-symbols-outlined text-primary text-2xl fill-1">store</span>
                                </div>
                                <div>
                                    <p className="font-black text-on-surface text-sm tracking-tight">Sweet Treats Co.</p>
                                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Verified Location</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BusinessSettings;
