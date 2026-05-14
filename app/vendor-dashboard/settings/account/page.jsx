"use client";
import React from 'react';
import { motion } from 'framer-motion';

const AccountSettings = () => {
    return (
        <div className="space-y-10">
            {/* Page Header */}
            <header>
                <h1 className="text-4xl font-black text-on-background tracking-tighter">Account Settings</h1>
                <p className="text-on-surface-variant font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Manage your personal profile and account preferences</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information Card */}
                <section className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl border border-outline-variant/30">
                    <h2 className="text-xl font-black text-primary flex items-center gap-3 mb-10 tracking-tight">
                        <span className="material-symbols-outlined text-2xl fill-1">badge</span>
                        Profile Information
                    </h2>
                    
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-primary-fixed shadow-2xl ring-4 ring-white">
                                    <img 
                                        alt="Profile Photo" 
                                        className="w-full h-full object-cover" 
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgeLzlA5XtTQ0l7oEDflZ9ehbgwu8VjwxLrQjx-DwpUVzYU2pZZeOId8YywmTI0NvAtf9WhK9jIZKAMkzkgG18NQO6nVwSAiZcNsGWY55P9jk_dVBQjkebW4kgCG4qGAGdboi11VYpcAm99fbugNHi8CLrYlaLXBxyjdJkRD8lBqSl-GTmZkfauEwzWFJ03TnYnlZuoieR-QgTwGX886iKkyzagbvPko2mjaW98hZOijtwwWugXcCTxA6JBXv_CeOYiY2Z0sLEhDc"
                                    />
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl border-2 border-white"
                                >
                                    <span className="material-symbols-outlined text-lg fill-1">photo_camera</span>
                                </motion.button>
                            </div>
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Change Avatar</button>
                        </div>

                        <div className="flex-1 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Full Name</label>
                                    <input 
                                        className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all" 
                                        type="text" 
                                        defaultValue="Sarah Jenkins"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Phone Number</label>
                                    <input 
                                        className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl px-6 py-4 focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all" 
                                        type="tel" 
                                        defaultValue="+1 (555) 0123-456"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Email Address</label>
                                <div className="w-full bg-surface-container-highest/30 text-on-surface-variant/70 rounded-2xl px-6 py-4 font-bold text-sm flex items-center justify-between border-2 border-dashed border-outline-variant/30">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg">lock</span>
                                        sarah.jenkins@sweettreats.co
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-outline-variant/20 px-2 py-1 rounded">Primary</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Professional Bio</label>
                                <textarea 
                                    className="w-full bg-surface-container-low border-2 border-transparent rounded-3xl px-6 py-4 focus:border-primary focus:ring-0 text-on-surface font-bold text-sm resize-none transition-all" 
                                    rows="4" 
                                    defaultValue="Founder and Chief Pastry Officer at Sweet Treats Co. Specialized in artisanal macaroons and bespoke event catering since 2018."
                                ></textarea>
                            </div>

                            <div className="pt-6">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-4 bg-primary text-on-primary rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30"
                                >
                                    Save Profile
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Status Card */}
                <section className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-outline-variant/30 flex flex-col">
                    <h2 className="text-xl font-black text-secondary flex items-center gap-3 mb-8 tracking-tight">
                        <span className="material-symbols-outlined text-2xl fill-1">analytics</span>
                        Account Health
                    </h2>
                    
                    <div className="space-y-8 flex-1">
                        {[
                            { label: 'Account Type', value: 'Business', color: 'secondary' },
                            { label: 'Created Date', value: 'March 1, 2024', color: 'on-surface' },
                            { label: 'Last Login', value: 'Today, 2:15 PM', color: 'on-surface' },
                        ].map((stat, i) => (
                            <div key={i} className="flex justify-between items-center py-4 border-b border-outline-variant/20">
                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{stat.label}</span>
                                <span className={`text-sm font-black text-${stat.color} ${stat.label === 'Account Type' ? 'bg-secondary-fixed px-4 py-1 rounded-full' : ''}`}>
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                        
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</span>
                            <div className="flex items-center gap-3 bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                Active
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-10 p-6 bg-tertiary-fixed/30 rounded-3xl border border-tertiary-fixed/50">
                        <div className="flex gap-4">
                            <span className="material-symbols-outlined text-tertiary text-2xl fill-1">verified</span>
                            <p className="text-[11px] text-on-tertiary-fixed-variant leading-relaxed font-bold">
                                Your account is in good standing. You've completed 100% of your verification requirements.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="lg:col-span-3 bg-primary/5 rounded-[2.5rem] p-10 border-2 border-dashed border-primary/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3">
                            <h2 className="text-xl font-black text-primary flex items-center gap-3 tracking-tight">
                                <span className="material-symbols-outlined text-2xl fill-1">warning</span>
                                Danger Zone
                            </h2>
                            <p className="text-on-surface-variant font-bold text-sm max-w-2xl leading-relaxed">
                                Deleting your account is permanent. This action will immediately remove all access to your shop, transaction history, and customer data. This cannot be undone.
                            </p>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: '#e11d48' }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-on-primary px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 whitespace-nowrap transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">delete_forever</span>
                            Delete Account
                        </motion.button>
                    </div>
                </section>
            </div>

            {/* Sticky Save Button (as shown in HTML) */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 2 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-primary text-white flex items-center gap-4 px-10 py-5 rounded-full font-black text-lg shadow-[0_15px_40px_rgba(224,64,160,0.4)] border-2 border-white/20 backdrop-blur-md"
                >
                    <span className="material-symbols-outlined text-2xl fill-1">save</span>
                    SAVE CHANGES
                </motion.button>
            </div>
        </div>
    );
};

export default AccountSettings;
