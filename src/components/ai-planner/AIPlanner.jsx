"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Sparkles, DollarSign, Calendar, MapPin } from 'lucide-react';
import PublicSiteHeader from '../PublicSiteHeader';
import Footer from '../Footer';
import { useAuth } from '@/context/AuthContext';
import ChatBubble from './ChatBubble';
import QuickActionButton from './QuickActionButton';

const AIPlanner = () => {
    const { requireAuth, user, loadPendingAction } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: "Hello! I'm your AI Wedding Assistant. I can help you find venues, manage your budget, or analyze decor styles. How can I help you today?"
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const pending = loadPendingAction?.();
        if (!pending || pending.action !== 'ai' || !pending.payload?.text) return;
        setInputValue(pending.payload.text);
    }, [loadPendingAction]);

    const sendAiMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        setTimeout(() => {
            let aiResponse = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "I'm not sure about that yet, but I'm learning! Try asking about venues or budget."
            };

            const lowerText = text.toLowerCase();

            if (lowerText.includes('venue')) {
                aiResponse = {
                    ...aiResponse,
                    text: "Based on your preferences, here are some top-rated venues in Lahore that match your style:",
                    decorAnalysis: {
                        tags: ['Elegant', 'Traditional', 'Grand'],
                        colors: ['#F5F5DC', '#FFD700', '#FFFFFF', '#800000'],
                        vendors: [
                            { id: 101, name: "Pearl Continental", type: "Venue", match: "98%", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800" },
                            { id: 102, name: "Royal Palm", type: "Venue", match: "95%", image: "https://images.unsplash.com/photo-1561587843-c7931c3bf714?q=80&w=800" }
                        ]
                    }
                };
            } else if (lowerText.includes('budget')) {
                aiResponse.text = "Here is a suggested budget breakdown for a wedding with 300 guests:";
                aiResponse.text += "\n\n• Venue & Food: 45%\n• Decor: 15%\n• Photography: 10%\n• Attire: 15%\n• Misc: 15%";
            } else if (lowerText.includes('timeline')) {
                aiResponse.text = "Ideally, you should book your venue 6-8 months in advance. Assuming your wedding is in 6 months, here's a high-level timeline:\n\nMonth 1: Book Venue & Photographer\nMonth 3: Finalize Decor & Menu\nMonth 5: Send Invites";
            } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
                aiResponse.text = "Hi there! Ready to plan your dream wedding?";
            }

            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleSendMessage = (text = inputValue) => {
        const messageText = text.trim();
        if (!messageText) return;

        if (!user) {
            requireAuth({
                action: 'ai',
                payload: { text: messageText },
                onAuthed: () => sendAiMessage(messageText),
            });
            return;
        }

        sendAiMessage(messageText);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans flex flex-col">
            <PublicSiteHeader />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-80px)]">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">AI Planner Beta</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Personal Event Assistant</h1>
                    <p className="text-sm text-gray-500">Ask anything about your wedding plans.</p>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                        {messages.map(msg => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 items-center"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D6336C] to-purple-600 flex items-center justify-center shadow-sm">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                    <motion.span className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
                                    <motion.span className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} />
                                    <motion.span className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length < 3 && (
                        <div className="px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                            <QuickActionButton icon={MapPin} label="Suggest Venues" onClick={() => handleSendMessage("Suggest some venues in Lahore")} />
                            <QuickActionButton icon={DollarSign} label="Budget Breakdown" onClick={() => handleSendMessage("Help me plan my budget")} />
                            <QuickActionButton icon={Calendar} label="Create Timeline" onClick={() => handleSendMessage("Create a wedding timeline")} />
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="bg-white border border-gray-200 rounded-2xl flex items-center p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#D6336C]/20 focus-within:border-[#D6336C] transition-all">
                            <button className="p-2 text-gray-400 hover:text-[#D6336C] hover:bg-pink-50 rounded-xl transition-colors">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue.trim()}
                                className="p-2 bg-[#D6336C] text-white rounded-xl shadow-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AIPlanner;
