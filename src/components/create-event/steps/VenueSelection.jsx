import React, { useState } from 'react';
import { Search, Star, Check, Users, Store, MapPin } from 'lucide-react';
import hallsData from '../../../data/halls.json';

const VenueSelection = ({ eventData, updateFormData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(12);

    const filteredVenues = hallsData.filter(hall =>
        (hall.hall_name && hall.hall_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (hall.area && hall.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (hall.full_address && hall.full_address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelectVenue = (hall) => {
        updateFormData('selectedVenueId', hall.hall_id);
        updateFormData('selectedVenueName', hall.hall_name);
        updateFormData('selectedVenuePrice', hall.price_range);
        updateFormData('selectedVenueLocation', hall.full_address || hall.area);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="text-center mb-6 shrink-0">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Select a Venue</h1>
                <p className="text-gray-500">Choose the perfect location from our extensive catalog.</p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto w-full mb-6 relative shrink-0">
                <Search className="absolute top-3.5 left-4 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(12); }}
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-[#D6336C] focus:ring-2 focus:ring-pink-100 outline-none shadow-sm"
                />
            </div>

            {/* Venue Grid */}
            <div className="overflow-y-auto px-1 pb-4 flex-1">
                {filteredVenues.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVenues.slice(0, visibleCount).map((hall, index) => {
                                // Dynamic Pathing & Normalization
                                const normalizedName = hall.hall_name ? hall.hall_name.toLowerCase().trim() : '';
                                let imagePath = `/Marriage Hall/${normalizedName}/1.jpeg`;
                                if (hall.images && hall.images.length > 0 && !hall.images[0].includes('placeholder')) {
                                    imagePath = hall.images[0].replace('/Marriage_hall/', '/Marriage Hall/');
                                } else if (hall.images && hall.images[0].includes('placeholder')) {
                                    imagePath = '/images/placeholder-hall.jpg';
                                }

                                const rating = hall.rating || (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
                                const isSelected = eventData.selectedVenueId === hall.hall_id;

                                return (
                                    <div
                                        key={hall.hall_id || index}
                                        onClick={() => handleSelectVenue(hall)}
                                        className={`group relative bg-white rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col ${isSelected
                                                ? 'border-[#D6336C] shadow-lg ring-2 ring-pink-100'
                                                : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="h-40 relative bg-gray-200 shrink-0">
                                            <img src={imagePath} alt={hall.hall_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2698&auto=format&fit=crop'; }} />
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-[#D6336C] text-white p-1 rounded-full shadow-sm z-10">
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h3 className="font-bold text-gray-900 group-hover:text-[#D6336C] transition-colors line-clamp-1">{hall.hall_name}</h3>
                                                <div className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                                    <Star size={10} className="fill-current mr-0.5" /> {rating}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                                                <MapPin size={12} className="shrink-0" />
                                                <span className="line-clamp-1">{hall.full_address || hall.area || 'Lahore'}</span>
                                            </div>

                                            <div className="space-y-1.5 text-sm text-gray-500 mt-auto">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={14} className="shrink-0 text-blue-500" /> {hall.capacity_sitting || 'N/A'} Guests
                                                </div>
                                                <div className="flex items-center gap-1.5 font-medium text-[#D6336C]">
                                                    <Store size={14} className="shrink-0" /> {hall.price_range ? hall.price_range.split(' ')[1] || hall.price_range : 'Contact for price'}
                                                </div>
                                            </div>
                                            <button className={`w-full mt-4 py-2 rounded-xl text-sm font-bold transition-all ${isSelected
                                                    ? 'bg-[#D6336C] text-white'
                                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                                }`}>
                                                {isSelected ? 'Selected' : 'Select Venue'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {filteredVenues.length > visibleCount && (
                            <div className="text-center mt-8 pb-4">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 12)}
                                    className="px-6 py-2 border border-gray-300 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    Show More Venues
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No venues found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default VenueSelection;
