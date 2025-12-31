import React from 'react';
import { VENUES, VENDORS } from '../data';

const Budget = ({ eventData }) => {
    // Helpers
    const getVenueCost = () => {
        const venue = VENUES.find(v => v.id === eventData.selectedVenueId);
        return venue ? venue.cost : 0;
    };

    const getVendorsCost = () => {
        const allVendors = Object.values(VENDORS).flat();
        const selected = allVendors.filter(v => (eventData.selectedVendorIds || []).includes(v.id));
        return selected.reduce((total, v) => {
            if (v.costPerHead) {
                // Determine guest count default to 100 if missing
                const guests = parseInt(eventData.guestCount) || 100;
                return total + (v.costPerHead * guests);
            }
            return total + (v.cost || 0);
        }, 0);
    };

    const venueCost = getVenueCost();
    const vendorsCost = getVendorsCost();
    // Example fixed misc cost
    const miscCost = 1000;
    const totalCost = venueCost + vendorsCost + miscCost;
    const paidAmount = 0; // Keeping simple
    const remainingAmount = totalCost - paidAmount;

    // Breakdown Items
    const breakdown = [];
    if (eventData.selectedVenueId) {
        const venue = VENUES.find(v => v.id === eventData.selectedVenueId);
        breakdown.push({ item: `Venue: ${venue?.name}`, cost: venue?.priceDisplay });
    } else {
        breakdown.push({ item: "Venue (Not Selected)", cost: "$0" });
    }

    const allVendors = Object.values(VENDORS).flat();
    (eventData.selectedVendorIds || []).forEach(id => {
        const v = allVendors.find(vend => vend.id === id);
        if (v) {
            let costStr = v.priceDisplay;
            if (v.costPerHead) {
                const guests = parseInt(eventData.guestCount) || 100;
                costStr = `$${v.costPerHead * guests} (${guests} guests)`;
            }
            breakdown.push({ item: `${v.type}: ${v.name}`, cost: costStr });
        }
    });

    breakdown.push({ item: "Miscellaneous (Est.)", cost: "$1,000" });

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Budget Overview</h1>
                <p className="text-gray-500">Track expenses and manage your event financial health.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-gray-400 text-sm font-medium mb-1">Total Estimated</p>
                    <h2 className="text-3xl font-bold">${totalCost.toLocaleString()}</h2>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Paid So Far</p>
                    <h2 className="text-3xl font-bold text-green-600">${paidAmount.toLocaleString()}</h2>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Remaining</p>
                    <h2 className="text-3xl font-bold text-[#D6336C]">${remainingAmount.toLocaleString()}</h2>
                </div>
            </div>

            {/* Progress Bar (Arbitrary budget used percentage for demo, or 0 if paid is 0) */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                    <span>Budget Used</span>
                    <span>{paidAmount > 0 ? Math.round((paidAmount / totalCost) * 100) : 0}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-[#D6336C] rounded-full shadow-lg transition-all duration-500"
                        style={{ width: `${paidAmount > 0 ? (paidAmount / totalCost) * 100 : 0}%` }}
                    ></div>
                </div>
            </div>

            {/* Breakdown List */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
                <div className="p-4 border-b border-gray-50 font-bold text-gray-900 flex justify-between bg-gray-50">
                    <span>Expense Item</span>
                    <span>Estimated Cost</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {breakdown.map((expense, idx) => (
                        <div key={idx} className="p-4 flex justify-between text-sm hover:bg-gray-50 transition-colors">
                            <span className="text-gray-700">{expense.item}</span>
                            <span className="font-bold text-gray-900">{expense.cost}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Budget;
