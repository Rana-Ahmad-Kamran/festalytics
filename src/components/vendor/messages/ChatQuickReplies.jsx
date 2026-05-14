"use client";
import React from 'react';
import { motion } from 'framer-motion';

const ChatQuickReplies = () => {
    const replies = [
        "Thank you for booking!",
        "Unfortunately, we're not available.",
        "Can we hop on a call?",
        "I've sent the invoice over.",
        "Please check the updated dates."
    ];

    return (
        <aside className="w-72 flex flex-col bg-surface-container-low p-6 gap-6 rounded-3xl border border-outline-variant/50">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary-container rounded-lg flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-xl fill-1">bolt</span>
                    </div>
                    <h4 className="font-black text-xs text-on-surface uppercase tracking-[0.1em]">Quick Replies</h4>
                </div>
                
                <div className="space-y-3">
                    {replies.map((reply, idx) => (
                        <motion.button 
                            key={idx}
                            whileHover={{ x: 5, backgroundColor: '#ffffff' }}
                            className="w-full text-left p-4 text-[11px] font-black leading-snug bg-white/50 rounded-2xl border border-outline-variant/30 hover:border-primary hover:text-primary transition-all shadow-sm uppercase tracking-wide"
                        >
                            "{reply}"
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-outline-variant/30">
                <button className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 border-dashed border-outline text-outline font-black text-[10px] uppercase tracking-widest hover:border-secondary hover:text-secondary hover:bg-white transition-all group">
                    <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add</span>
                    Create Template
                </button>
            </div>
        </aside>
    );
};

export default ChatQuickReplies;
