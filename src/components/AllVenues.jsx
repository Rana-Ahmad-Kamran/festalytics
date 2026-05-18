"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
import HallCard from './HallCard';
import hallsData from '../data/halls.json';
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const AllVenues = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [dbVenuesMap, setDbVenuesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const getFirestoreDocId = (venueObj) => {
    if (!venueObj) return null;
    const name = venueObj.hall_name ? venueObj.hall_name.toLowerCase() : "";
    if (venueObj.hall_id === "1" || name.includes("zaydan banquet hall")) {
      return "zaydan-banquet-hall";
    }
    if (venueObj.hall_id === "2" || name.includes("qasar e zaydan")) {
      return "qasar-e-zaydan";
    }
    return venueObj.hall_id?.toString() || venueObj.hall_name?.toLowerCase().replace(/\s+/g, '-');
  };

  useEffect(() => {
    const fetchAllDbVenues = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "venues"));
        const venuesMap = {};
        querySnapshot.forEach((doc) => {
          venuesMap[doc.id] = doc.data();
        });
        setDbVenuesMap(venuesMap);
      } catch (err) {
        console.error("Error fetching all venues from Firestore: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllDbVenues();
  }, []);

  const mergedHalls = useMemo(() => {
    // 1. Map existing local halls with database updates
    const updatedLocalHalls = hallsData.map(hall => {
      const docId = getFirestoreDocId(hall);
      const dbData = dbVenuesMap[docId];
      if (!dbData) return hall;

      // Merge pricing, profiles, images, and active state
      const images = dbData.images ? dbData.images.map(img => img.url) : hall.images;

      return {
        ...hall,
        hall_name: dbData.profile?.hall_name || dbData.hallName || hall.hall_name,
        full_address: dbData.profile?.address || dbData.address || hall.full_address,
        area: dbData.profile?.area || dbData.area || hall.area,
        capacity_sitting: dbData.profile?.capacity?.toString() || dbData.capacity?.toString() || hall.capacity_sitting,
        phone_1: dbData.profile?.phone_1 || dbData.phone_1 || hall.phone_1,
        // Sync active state from vendor ERP
        serviceActive: dbData.serviceActive !== false,
        price_range: dbData.pricing?.hallRent ? `PKR ${dbData.pricing.hallRent * 45} base rent` : hall.price_range,
        images: images,
        one_dish_chicken: dbData.cateringPackages?.find(p => p.type?.toLowerCase().includes("chicken"))?.perPlatePrice * 45 || hall.one_dish_chicken,
        one_dish_beef: dbData.cateringPackages?.find(p => p.type?.toLowerCase().includes("beef"))?.perPlatePrice * 50 || hall.one_dish_beef,
        one_dish_mutton: dbData.cateringPackages?.find(p => p.type?.toLowerCase().includes("mutton"))?.perPlatePrice * 45 || hall.one_dish_mutton,
        isFromDb: true
      };
    }).filter(hall => hall.serviceActive !== false); // Filter out inactive services!

    // 2. Add any newly registered vendor halls in Firestore that do not exist in local json
    const localDocIds = new Set(hallsData.map(h => getFirestoreDocId(h)));
    const newDbHalls = [];
    
    Object.keys(dbVenuesMap).forEach(docId => {
      if (!localDocIds.has(docId)) {
        const dbData = dbVenuesMap[docId];
        if (dbData.serviceActive !== false) {
          const primaryImg = dbData.images?.find(img => img.isPrimary)?.url || dbData.images?.[0]?.url || '/images/placeholder-hall.jpg';
          newDbHalls.push({
            hall_id: docId,
            hall_name: dbData.profile?.hall_name || dbData.hallName || docId.replace(/-/g, ' '),
            category: "Luxury",
            description: dbData.profile?.description || "A registered premium wedding hall vendor.",
            full_address: dbData.profile?.address || "Address",
            area: dbData.profile?.area || "Lahore",
            capacity_sitting: dbData.profile?.capacity?.toString() || "500",
            phone_1: dbData.profile?.phone_1 || "",
            price_range: dbData.pricing?.hallRent ? `PKR ${dbData.pricing.hallRent * 45} base rent` : "Contact for Pricing",
            images: dbData.images ? dbData.images.map(img => img.url) : [primaryImg],
            one_dish_chicken: dbData.cateringPackages?.find(p => p.type?.toLowerCase().includes("chicken"))?.perPlatePrice * 45 || "2000",
            one_dish_beef: dbData.cateringPackages?.find(p => p.type?.toLowerCase().includes("beef"))?.perPlatePrice * 50 || "2850",
            one_dish_mutton: dbData.cateringPackages?.find(p => p.type?.toLowerCase().includes("mutton"))?.perPlatePrice * 45 || "4100",
            isFromDb: true
          });
        }
      }
    });

    return [...updatedLocalHalls, ...newDbHalls];
  }, [dbVenuesMap]);

  // Extract unique locations for the filter
  const locations = useMemo(() => {
    const locs = mergedHalls.map(hall => hall.area || 'Lahore').filter(Boolean);
    const uniqueLocs = [...new Set(locs)].sort();
    return ['All', ...uniqueLocs];
  }, [mergedHalls]);

  const filteredHalls = mergedHalls.filter(hall => {
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
            onClick={() => router.back()}
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
              let dynamicImagePath = `/Marriage_hall/${normalizedName}/1.jpeg`;
              if (hall.images && hall.images.length > 0 && !hall.images[0].includes('placeholder')) {
                dynamicImagePath = hall.images[0].replace('/Marriage Hall/', '/Marriage_hall/');
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
