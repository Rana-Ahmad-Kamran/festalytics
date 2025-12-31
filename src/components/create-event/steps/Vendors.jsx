import React, { useState } from 'react';
import { Star, Plus, X, Sparkles } from 'lucide-react';
import { VENDORS } from '../data';

const Vendors = ({ eventData, updateFormData }) => {
    const [activeVendorTab, setActiveVendorTab] = useState('Catering');

    const toggleVendor = (vendorId) => {
        const current = eventData.selectedVendorIds || [];
        if (current.includes(vendorId)) {
            updateFormData('selectedVendorIds', current.filter(id => id !== vendorId));
        } else {
            updateFormData('selectedVendorIds', [...current, vendorId]);
        }
    };

    const getVendorDetails = (id) => {
        const allVendors = Object.values(VENDORS).flat();
        return allVendors.find(v => v.id === id);
    };

    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-8">
            {/* Left Side: Tabs & Grid */}
            <div className="flex-1 flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">Vendors & Services</h1>
                    <p className="text-gray-500">Add catering, decor, photography and more.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                    {Object.keys(VENDORS).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveVendorTab(tab)}
                            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeVendorTab === tab
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-[#D6336C] hover:text-[#D6336C]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Vendor Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[500px] pr-2 pb-4">
                    {VENDORS[activeVendorTab].map(vendor => {
                        const isSelected = (eventData.selectedVendorIds || []).includes(vendor.id);
                        return (
                            <div key={vendor.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-4 hover:shadow-md transition-all">
                                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                    <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900">{vendor.name}</h4>
                                        <span className="flex items-center text-xs font-bold text-amber-500">
                                            <Star size={10} className="fill-current mr-0.5" /> {vendor.rating}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{activeVendorTab} • Starting at {vendor.priceDisplay}</p>
                                    <button
                                        onClick={() => toggleVendor(vendor.id)}
                                        className={`mt-auto text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${isSelected
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-gray-50 text-gray-600 hover:bg-[#D6336C] hover:text-white'
                                            }`}
                                    >
                                        {isSelected ? <><X size={12} /> Remove</> : <><Plus size={12} /> Add Vendor</>}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side: Selected Vendors Panel */}
            <div className="hidden lg:flex w-80 bg-gray-50 rounded-2xl p-6 flex-col border border-gray-100 h-fit">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#D6336C]" /> Selected Vendors
                </h3>

                {(eventData.selectedVendorIds || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No vendors selected yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                        {(eventData.selectedVendorIds || []).map(id => {
                            const v = getVendorDetails(id);
                            if (!v) return null;
                            return (
                                <div key={id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                                        <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-sm text-gray-900 truncate">{v.name}</h5>
                                        <p className="text-xs text-gray-500">{v.priceDisplay}</p>
                                    </div>
                                    <button onClick={() => toggleVendor(id)} className="text-gray-400 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vendors;
