"use client";
import React from 'react';
import { motion } from 'framer-motion';

const ChatSidebar = () => {
    const threads = [
        {
            id: 1,
            name: 'Elena Rodriguez',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmN1VmOGB306cjAkFnLLKbxPxhe3v20zDurgWgrDh6xRc85xhTqYQfqrpRYWJ7R0zysBbT8NVmxkWMrkfPSQLgbSU5mvfwPMporRjdbwJxFViOWXx2YcJIoEisOBtS-9cFu2eF9LcpJWJ72Rt4VC2JbQosQlzY-I8hWtSq8vW3Of8TbtrmWfb2JMbTHLNDBY-Nsg36lpw-MCs9zULQvalfXcy5R3GFUaTW8ShyXyG2G-uIKpvd1wiMYoqj_LUGFwoXDcRPTlaUL6Y',
            lastMessage: 'Thanks for the update! Looking forward to seeing the setup for the garden...',
            time: '12:45 PM',
            subject: 'Booking #BK-9821 Discussion',
            active: true,
            unread: true,
        },
        {
            id: 2,
            name: 'Marcus Chen',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCex2dv6AEx8LO2NZ1ikJIWfwbeR0ArsjBzXivC7BbzOKxSfNF1RUynhFC-kTIW37W4XJ1VhZA3j7zObbecHVjCVCR3imhs_JMVfgpKBEUpvzYJc9GPqPQoEDTqjNJnSeSrH-sveSRur7IBXYonQ_lmqYpn69t18vAS9t79ixWAJjJYShlDlZ2AkoRJnXAgUWGYmtOtkLIICM64xNW9bApkwu0lroToZb5egbunLvi_kRZJZ9D-pmqifRrCDULA3GSekxZNNEF7m4E',
            lastMessage: 'Is it possible to add extra lighting rigs?',
            time: 'Yesterday',
            subject: 'Quote for Corporate Gala',
            active: false,
            unread: false,
        },
        {
            id: 3,
            name: 'Sarah Miller',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLiL0OHG692A1kIvZ_QocR-T0Lk9jqgf6TGAAsgpGCa9G_KNZFfiSIA-z2C9dwji_vaZ-GEf8b3rW1D1LeNEDFab5gDoomBMGlsV_b4b7dqNkVrBiDzWqUa5l-csE4rvRMC0v6W5Uh1VDGOVnVpA_w-8mmE6VLEklRg-89MScrE-I2w-u2viz5PuDk4UGOTKS2newA5m91_4cHSaFS8DzRwxByf5qARUdauWA0I4Le0mY_GXxj_uhItAJHBS1I61KjvHwT2nnqLzc',
            lastMessage: 'We have 24 guests with dietary needs...',
            time: 'Oct 14',
            subject: 'Wedding Catering Query',
            active: false,
            unread: false,
        }
    ];

    return (
        <aside className="w-[340px] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-outline-variant h-full">
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black text-on-surface tracking-tight">Inbox</h2>
                    <span className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest">12 New</span>
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary text-white font-black py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(224,64,160,0.3)] text-xs tracking-[0.2em]"
                >
                    <span className="material-symbols-outlined text-lg">edit_square</span>
                    COMPOSE
                </motion.button>

                <div className="space-y-1.5">
                    {[
                        { icon: 'mail', label: 'All Messages', active: true, fill: 1 },
                        { icon: 'mark_email_unread', label: 'Unread' },
                        { icon: 'pending_actions', label: 'Pending Queries' },
                        { icon: 'archive', label: 'Archived' },
                    ].map((filter) => (
                        <button 
                            key={filter.label}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-full transition-all group
                                ${filter.active 
                                    ? 'bg-primary-fixed text-on-primary-fixed-variant font-black shadow-sm' 
                                    : 'text-on-surface-variant hover:bg-surface-container font-bold'}
                            `}
                        >
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' ${filter.fill || 0}` }}>
                                {filter.icon}
                            </span>
                            <span className="text-xs tracking-wide uppercase">{filter.label}</span>
                            {filter.label === 'Unread' && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-primary"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Thread List */}
            <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
                <div className="space-y-2">
                    {threads.map((thread) => (
                        <motion.div 
                            key={thread.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-5 rounded-2xl cursor-pointer transition-all border-l-4
                                ${thread.active 
                                    ? 'bg-surface-container-low border-primary shadow-md ring-1 ring-primary/5' 
                                    : 'hover:bg-surface-container border-transparent'}
                            `}
                        >
                            <div className="flex gap-4">
                                <div className="relative flex-shrink-0">
                                    <img 
                                        src={thread.avatar} 
                                        alt={thread.name} 
                                        className="w-14 h-14 rounded-[1.25rem] object-cover border-2 border-primary-fixed shadow-sm"
                                    />
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                                        ${thread.unread ? 'bg-primary' : 'bg-green-500'}
                                    `}></div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-black text-on-surface truncate text-sm tracking-tight">{thread.name}</p>
                                        <span className={`text-[9px] font-black whitespace-nowrap uppercase tracking-widest 
                                            ${thread.active ? 'text-primary' : 'text-outline'}
                                        `}>
                                            {thread.time}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-on-surface-variant/70 truncate uppercase tracking-[0.05em]">{thread.subject}</p>
                                    <p className="text-xs text-outline leading-snug line-clamp-2 mt-1.5 font-medium">
                                        {thread.lastMessage}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default ChatSidebar;
