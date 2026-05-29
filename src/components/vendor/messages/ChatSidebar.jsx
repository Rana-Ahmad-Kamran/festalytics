"use client";
import React from 'react';
import { motion } from 'framer-motion';

const ChatSidebar = ({ threads = [], activeThread = null, onSelectThread, loading = false, error = null }) => {
    const activeKey = activeThread?.chatId || activeThread?.id;

    return (
        <aside className="w-[340px] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-outline-variant h-full text-slate-700 font-sans">
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black text-on-surface tracking-tight">Inbox</h2>
                    <span className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest">{threads.filter(t => t.unread).length} New</span>
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary text-white font-black py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(224,64,160,0.3)] text-xs tracking-[0.2em] cursor-pointer"
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
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-full transition-all group border-0 text-left cursor-pointer
                                ${filter.active 
                                    ? 'bg-primary-fixed text-on-primary-fixed-variant font-black shadow-sm' 
                                    : 'text-on-surface-variant hover:bg-surface-container font-bold bg-transparent'}
                            `}
                        >
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' ${filter.fill || 0}` }}>
                                {filter.icon}
                            </span>
                            <span className="text-xs tracking-wide uppercase">{filter.label}</span>
                            {filter.label === 'Unread' && threads.some(t => t.unread) && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-primary"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Thread List */}
            <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
                {error && (
                    <p className="px-4 py-2 text-xs font-bold text-rose-600 text-center">{error}</p>
                )}
                {loading && (
                    <p className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-outline text-center">
                        Syncing inbox…
                    </p>
                )}
                {!loading && threads.length === 0 && (
                    <p className="px-4 py-6 text-xs text-outline text-center font-medium">
                        No conversations yet. Open a booking and start a chat with a customer.
                    </p>
                )}
                <div className="space-y-2">
                    {threads.map((thread) => {
                        const threadKey = thread.chatId || thread.id;
                        const isActive = activeKey && activeKey === threadKey;
                        return (
                            <motion.div 
                                key={threadKey}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => onSelectThread && onSelectThread(thread)}
                                className={`p-5 rounded-2xl cursor-pointer transition-all border-l-4 text-left
                                    ${isActive 
                                        ? 'bg-surface-container-low border-primary shadow-md ring-1 ring-primary/5' 
                                        : 'hover:bg-surface-container border-transparent'}
                                `}
                            >
                                <div className="flex gap-4">
                                    <div className="relative flex-shrink-0">
                                        {thread.avatar ? (
                                            <img 
                                                src={thread.avatar} 
                                                alt={thread.name} 
                                                className="w-14 h-14 rounded-[1.25rem] object-cover border-2 border-primary-fixed shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-[1.25rem] bg-secondary/10 text-secondary border border-secondary-fixed flex items-center justify-center font-black text-sm uppercase">
                                                {thread.name.substring(0, 2)}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                                            ${thread.unread ? 'bg-primary' : 'bg-green-500'}
                                        `}></div>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-black text-on-surface truncate text-sm tracking-tight">{thread.name}</p>
                                            <span className={`text-[9px] font-black whitespace-nowrap uppercase tracking-widest 
                                                ${isActive ? 'text-primary' : 'text-outline'}
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
                        );
                    })}
                </div>
            </div>
        </aside>
    );
};

export default ChatSidebar;
