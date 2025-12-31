import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, MapPin, Users, Clock, DollarSign, CheckCircle, Store,
    Bell, Settings, Plus, LayoutDashboard, Utensils, Music, Edit
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

const ManageEvent = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = ['Overview', 'Vendors', 'Budget', 'Timeline', 'Guests'];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <DashboardHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Event Header */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">Sarah's 25th Birthday</h1>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Active Planning</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                            <span className="flex items-center gap-1.5"><Calendar size={16} /> Dec 10, 2025</span>
                            <span className="flex items-center gap-1.5"><Clock size={16} /> 7:00 PM</span>
                            <span className="flex items-center gap-1.5"><MapPin size={16} /> The Grand Hall, Lahore</span>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2">
                            <Settings size={18} /> Settings
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-3 bg-[#D6336C] text-white font-bold rounded-xl shadow-lg shadow-pink-200 hover:brightness-110 flex items-center justify-center gap-2">
                            <Edit size={18} /> Edit Event
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar border-b border-gray-200">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-[#D6336C] text-[#D6336C]'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'Overview' && (
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Days Left</p>
                                    <h3 className="text-3xl font-bold text-gray-900">45</h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Budget Spent</p>
                                    <h3 className="text-3xl font-bold text-gray-900">$4,200 <span className="text-gray-400 text-lg font-normal">/ $15k</span></h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Guests Confirmed</p>
                                    <h3 className="text-3xl font-bold text-gray-900">82 <span className="text-gray-400 text-lg font-normal">/ 120</span></h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Vendors Booked</p>
                                    <h3 className="text-3xl font-bold text-gray-900">3 <span className="text-gray-400 text-lg font-normal">/ 6</span></h3>
                                </div>
                            </div>

                            {/* Recent Activity / Next Tasks placeholder */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4">Upcoming Tasks</h3>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                                <span className="flex-1 font-medium text-gray-700">Finalize menu options with caterer</span>
                                                <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Urgent</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4">Budget Health</h3>
                                    <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                                        [Graph Placeholder]
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Vendors' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><Utensils /></div>
                                    <div>
                                        <h4 className="font-bold text-lg">Delightful Bites</h4>
                                        <p className="text-sm text-gray-500">Catering</p>
                                    </div>
                                    <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Booked</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Cost: $2,500</span>
                                    <button className="text-[#D6336C] font-bold hover:underline">Manage</button>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:bg-white hover:border-[#D6336C] transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-2 group-hover:bg-pink-100 group-hover:text-[#D6336C] transition-colors">
                                    <Plus />
                                </div>
                                <h4 className="font-bold text-gray-600 group-hover:text-gray-900">Add Vendor</h4>
                                <p className="text-xs text-gray-400">Find professionals</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Budget' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                            Budget detailed view placeholder.
                        </div>
                    )}

                    {activeTab === 'Timeline' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                            Timeline detailed view placeholder.
                        </div>
                    )}

                    {activeTab === 'Guests' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-sm text-gray-400">
                                        <th className="pb-3 pl-2">Name</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Dietary Info</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    <tr className="group hover:bg-gray-50">
                                        <td className="py-3 pl-2 font-medium">Alice Johnson</td>
                                        <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Confirmed</span></td>
                                        <td className="py-3 text-gray-500">Vegetarian</td>
                                    </tr>
                                    <tr className="group hover:bg-gray-50">
                                        <td className="py-3 pl-2 font-medium">Bob Smith</td>
                                        <td className="py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending</span></td>
                                        <td className="py-3 text-gray-500">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default ManageEvent;
