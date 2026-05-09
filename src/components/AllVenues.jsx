import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
import HallCard from './HallCard';
import hallsData from '../data/halls.json';

const AllVenues = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Extract unique locations for the filter
  const locations = useMemo(() => {
    const locs = hallsData.map(hall => hall.area || 'Lahore').filter(Boolean);
    const uniqueLocs = [...new Set(locs)].sort();
    return ['All', ...uniqueLocs];
  }, []);

  const filteredHalls = hallsData.filter(hall => {
    const matchesSearch = 
      (hall.hall_name && hall.hall_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hall.full_address && hall.full_address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = selectedLocation === 'All' || (hall.area || 'Lahore') === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header & Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Marriage Halls</h1>
            <p className="text-gray-500 mt-1">Browse and filter through all available venues</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D6336C] focus:border-transparent outline-none transition-all"
              placeholder="Search by name or address..."
            />
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-10 py-3 appearance-none border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D6336C] focus:border-transparent outline-none transition-all bg-white"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredHalls.length} {filteredHalls.length === 1 ? 'Venue' : 'Venues'} Found
          </h2>
        </div>

        {/* Grid Layout */}
        {filteredHalls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHalls.map((hall, index) => {
              // Normalization & Dynamic Pathing logic as requested
              const normalizedName = hall.hall_name ? hall.hall_name.toLowerCase().trim() : '';
              
              // Use the pre-processed path if available, or generate it dynamically
              let dynamicImagePath = `/Marriage Hall/${normalizedName}/1.jpeg`;
              if (hall.images && hall.images.length > 0 && !hall.images[0].includes('placeholder')) {
                dynamicImagePath = hall.images[0].replace('/Marriage_hall/', '/Marriage Hall/');
              }

              return (
                <HallCard key={hall.hall_id || index} venue={hall} index={index} imagePath={dynamicImagePath} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No venues found</h3>
            <p className="text-gray-500">Try adjusting your search or location filter.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedLocation('All'); }}
              className="mt-4 text-[#D6336C] font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllVenues;
