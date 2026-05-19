"use client";
import React, { useState, useEffect } from 'react';
import ChatSidebar from '@/components/vendor/messages/ChatSidebar';
import ChatThread from '@/components/vendor/messages/ChatThread';
import ChatQuickReplies from '@/components/vendor/messages/ChatQuickReplies';

const MessagesPage = () => {
    const [activeThread, setActiveThread] = useState(null);
    const [threads, setThreads] = useState([
        {
            id: 1,
            name: 'Elena Rodriguez',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmN1VmOGB306cjAkFnLLKbxPxhe3v20zDurgWgrDh6xRc85xhTqYQfqrpRYWJ7R0zysBbT8NVmxkWMrkfPSQLgbSU5mvfwPMporRjdbwJxFViOWXx2YcJIoEisOBtS-9cFu2eF9LcpJWJ72Rt4VC2JbQosQlzY-I8hWtSq8vW3Of8TbtrmWfb2JMbTHLNDBY-Nsg36lpw-MCs9zULQvalfXcy5R3GFUaTW8ShyXyG2G-uIKpvd1wiMYoqj_LUGFwoXDcRPTlaUL6Y',
            lastMessage: 'Thanks for the update! Looking forward to seeing the setup for the garden...',
            time: '12:45 PM',
            subject: 'Booking #BK-9821 Discussion',
            unread: true,
            messages: [
                { sender: 'customer', text: 'Hi! Regarding my booking #BK-9821, could we adjust the floral arrangement to include more lilies? I saw some in your portfolio and they were stunning!', time: '10:15 AM' },
                { sender: 'system', text: 'Booking status changed to Confirmed', time: '10:30 AM' },
                { sender: 'vendor', text: 'Absolutely Elena! We can definitely swap the roses for white lilies. I\'ve attached a draft of how that will look with the rest of your palette.', time: '10:42 AM' }
            ]
        },
        {
            id: 2,
            name: 'Marcus Chen',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCex2dv6AEx8LO2NZ1ikJIWfwbeR0ArsjBzXivC7BbzOKxSfNF1RUynhFC-kTIW37W4XJ1VhZA3j7zObbecHVjCVCR3imhs_JMVfgpKBEUpvzYJc9GPqPQoEDTqjNJnSeSrH-sveSRur7IBXYonQ_lmqYpn69t18vAS9t79ixWAJjJYShlDlZ2AkoRJnXAgUWGYmtOtkLIICM64xNW9bApkwu0lroToZb5egbunLvi_kRZJZ9D-pmqifRrCDULA3GSekxZNNEF7m4E',
            lastMessage: 'Is it possible to add extra lighting rigs?',
            time: 'Yesterday',
            subject: 'Quote for Corporate Gala',
            unread: false,
            messages: [
                { sender: 'customer', text: 'Hi! I saw the base pricing for corporate galas. Is it possible to add extra lighting rigs for the stage?', time: 'Yesterday' }
            ]
        },
        {
            id: 3,
            name: 'Sarah Miller',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLiL0OHG692A1kIvZ_QocR-T0Lk9jqgf6TGAAsgpGCa9G_KNZFfiSIA-z2C9dwji_vaZ-GEf8b3rW1D1LeNEDFab5gDoomBMGlsV_b4b7dqNkVrBiDzWqUa5l-csE4rvRMC0v6W5Uh1VDGOVnVpA_w-8mmE6VLEklRg-89MScrE-I2w-u2viz5PuDk4UGOTKS2newA5m91_4cHSaFS8DzRwxByf5qARUdauWA0I4Le0mY_GXxj_uhItAJHBS1I61KjvHwT2nnqLzc',
            lastMessage: 'We have 24 guests with dietary needs...',
            time: 'Oct 14',
            subject: 'Wedding Catering Query',
            unread: false,
            messages: [
                { sender: 'customer', text: 'Hello, we have 24 guests with specific dietary needs (gluten-free and vegan). Can the luxury menu packages accommodate this?', time: 'Oct 14' }
            ]
        }
    ]);

    useEffect(() => {
        // Check if there is an active chat thread requested from Bookings drawer
        const chatReq = localStorage.getItem("activeChatThread");
        if (chatReq) {
            try {
                const parsed = JSON.parse(chatReq);
                // Clean up key
                localStorage.removeItem("activeChatThread");

                // Check if a thread with this name already exists
                const existing = threads.find(t => t.name.toLowerCase() === parsed.name.toLowerCase());
                if (existing) {
                    setActiveThread(existing);
                } else {
                    // Create new dynamic thread!
                    const newThread = {
                        id: Date.now(),
                        name: parsed.name,
                        avatar: null,
                        lastMessage: `Inquired regarding ${parsed.service} proposal`,
                        time: 'Just Now',
                        subject: `Booking #${parsed.bookingId} Discussion`,
                        unread: true,
                        messages: [
                            { sender: 'customer', text: `Hi! I submitted a quote request for ${parsed.service} on ${parsed.date || "selected dates"}. I'd love to chat details here!`, time: 'Just Now' }
                        ]
                    };
                    setThreads(prev => [newThread, ...prev]);
                    setActiveThread(newThread);
                }
            } catch (e) {
                console.error("Error parsing chat parameters:", e);
                setActiveThread(threads[0]);
            }
        } else {
            // Default to Elena
            setActiveThread(threads[0]);
        }
    }, []);

    const handleSendMessage = (text) => {
        if (!activeThread || !text.trim()) return;
        
        const newMessage = { sender: 'vendor', text, time: 'Just Now' };
        
        // Update threads
        setThreads(prev => prev.map(t => {
            if (t.id === activeThread.id) {
                return {
                    ...t,
                    lastMessage: text,
                    time: 'Just Now',
                    messages: [...t.messages, newMessage]
                };
            }
            return t;
        }));
        
        setActiveThread(prev => ({
            ...prev,
            lastMessage: text,
            time: 'Just Now',
            messages: [...prev.messages, newMessage]
        }));
    };

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden text-slate-700 font-sans">
            {/* Thread List Sidebar */}
            <ChatSidebar 
                threads={threads} 
                activeThread={activeThread} 
                onSelectThread={setActiveThread} 
            />

            {/* Main Chat Area */}
            <ChatThread 
                activeThread={activeThread} 
                onSendMessage={handleSendMessage}
            />

            {/* Quick Replies Sidebar */}
            <div className="hidden 2xl:block">
                <ChatQuickReplies onSelectReply={handleSendMessage} />
            </div>
        </div>
    );
};

export default MessagesPage;
