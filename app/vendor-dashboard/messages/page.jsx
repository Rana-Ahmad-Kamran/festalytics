"use client";
import React from 'react';
import ChatSidebar from '@/components/vendor/messages/ChatSidebar';
import ChatThread from '@/components/vendor/messages/ChatThread';
import ChatQuickReplies from '@/components/vendor/messages/ChatQuickReplies';

const MessagesPage = () => {
    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
            {/* Thread List Sidebar */}
            <ChatSidebar />

            {/* Main Chat Area */}
            <ChatThread />

            {/* Quick Replies Sidebar (Hidden on smaller screens, shown in main area if needed) */}
            <div className="hidden 2xl:block">
                <ChatQuickReplies />
            </div>
        </div>
    );
};

export default MessagesPage;
