"use client";
import React from 'react';
import Sidebar from '@/components/vendor/Sidebar';
import Header from '@/components/vendor/Header';

export default function VendorLayout({ children }) {
    return (
        <div className="bg-background min-h-screen">
            <Sidebar />
            <Header />
            <main className="ml-[260px] pt-20 min-h-screen">
                <div className="max-w-[1440px] mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
