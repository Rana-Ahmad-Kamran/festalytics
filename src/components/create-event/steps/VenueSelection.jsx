import React, { useState } from 'react';
import { Search, Star, Check, Users, Store } from 'lucide-react';
import { VENUES } from '../data';

const VenueSelection = ({ eventData, updateFormData }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredVenues = VENUES.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full h-full flex flex-col">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Select a Venue</h1>
                <p className="text-gray-500">Choose the perfect location for your special day.</p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto w-full mb-8 relative">
                <Search className="absolute top-3.5 left-4 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-[#D6336C] focus:ring-2 focus:ring-pink-100 outline-none shadow-sm"
                />
            </div>

            {/* Venue Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto px-1 pb-4 flex-1">
                {filteredVenues.map(venue => (
                    <div
                        key={venue.id}
                        onClick={() => updateFormData('selectedVenueId', venue.id)}
                        className={`group relative bg-white rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${eventData.selectedVenueId === venue.id
                                ? 'border-[#D6336C] shadow-lg ring-2 ring-pink-100'
                                : 'border-transparent shadow-md hover:shadow-lg hover:border-gray-200'
                            }`}
                    >
                        <div className="h-40 relative">
                            <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                            {eventData.selectedVenueId === venue.id && (
                                <div className="absolute top-2 right-2 bg-[#D6336C] text-white p-1 rounded-full shadow-sm">
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 group-hover:text-[#D6336C] transition-colors">{venue.name}</h3>
                                <div className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                                    <Star size={10} className="fill-current mr-0.5" /> {venue.rating}
                                </div>
                            </div>
                            <div className="space-y-1.5 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Users size={14} /> {venue.capacity}
                                </div>
                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                    <Store size={14} /> {venue.priceDisplay}
                                </div>
                            </div>
                            <button className={`w-full mt-4 py-2 rounded-xl text-sm font-bold transition-all ${eventData.selectedVenueId === venue.id
                                    ? 'bg-[#D6336C] text-white'
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}>
                                {eventData.selectedVenueId === venue.id ? 'Selected' : 'Select Venue'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VenueSelection;
