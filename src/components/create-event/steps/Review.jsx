import React from 'react';
import { ArrowRight, Info, MapPin, Users, Save } from 'lucide-react';
import { VENUES, VENDORS } from '../data';
import { useRouter } from 'next/navigation';

const Review = ({ eventData, onNext, isEditing }) => {
    const router = useRouter();

    const getVenue = () => VENUES.find(v => v.id === eventData.selectedVenueId);

    const getVendors = () => {
        const allVendors = Object.values(VENDORS).flat();
        return allVendors.filter(v => (eventData.selectedVendorIds || []).includes(v.id));
    };

    const venue = getVenue();
    const vendors = getVendors();

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Review & Finalize</h1>
                <p className="text-gray-500">Review all details before {isEditing ? 'updating' : 'creating'} your event.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Basic Info Summary */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <Info size={20} className="text-[#D6336C]" /> Event Details
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Event Title</span>
                            <span className="font-bold text-gray-900">{eventData.title || "Not Set"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Type</span>
                            <span className="font-bold text-gray-900 capitalize">{eventData.eventType || "Not Set"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Date & Time</span>
                            <span className="font-bold text-gray-900">{eventData.date} at {eventData.time}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Location</span>
                            <span className="font-bold text-gray-900">{eventData.location}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Guests</span>
                            <span className="font-bold text-gray-900">{eventData.guestCount} People</span>
                        </div>
                    </div>
                </div>

                {/* Venue Summary */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-[#D6336C]" /> Venue
                    </h3>
                    {venue ? (
                        <div>
                            <img src={venue.image} alt="Venue" className="w-full h-32 object-cover rounded-xl mb-3" />
                            <h4 className="font-bold text-gray-900">{venue.name}</h4>
                            <p className="text-sm text-gray-500">{venue.capacity} • {venue.priceDisplay}</p>
                        </div>
                    ) : (
                        <div className="text-gray-400 italic">No venue selected</div>
                    )}
                </div>
            </div>

            {/* Selected Vendors Summary */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Users size={20} className="text-[#D6336C]" /> Selected Vendors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendors.length > 0 ? vendors.map(v => (
                        <div key={v.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                            <img src={v.image} alt={v.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                                <p className="font-bold text-sm text-gray-900">{v.name}</p>
                                <p className="text-xs text-gray-500">{v.priceDisplay}</p>
                            </div>
                        </div>
                    )) : <p className="text-gray-400 italic">No vendors selected</p>}
                </div>
            </div>

            <div className="flex gap-4">
                <button className="flex-1 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Save size={20} /> Save as Draft
                </button>
                <button
                    onClick={onNext}
                    className="flex-[2] py-4 bg-[#D6336C] text-white font-bold rounded-2xl shadow-lg shadow-pink-200 hover:brightness-110 flex items-center justify-center gap-2"
                >
                    {isEditing ? 'Update Event' : 'Create Event'} <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Review;
