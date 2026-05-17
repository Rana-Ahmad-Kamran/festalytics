"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, setDoc, arrayUnion, collection, getDocs, addDoc } from "firebase/firestore";
import BookingStats from '@/components/vendor/bookings/BookingStats';
import BookingFilters from '@/components/vendor/bookings/BookingFilters';

const BookingsPage = () => {
    const [showWalkinForm, setShowWalkinForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [dynamicBookings, setDynamicBookings] = useState([]);
    
    // Firestore Venue settings state
    const [venueData, setVenueData] = useState(null);

    // Form inputs state
    const [fullName, setFullName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [otherName, setOtherName] = useState("");
    const [address, setAddress] = useState("");
    const [guestsCount, setGuestsCount] = useState(150);
    const [eventDate, setEventDate] = useState("");
    const [eventCategory, setEventCategory] = useState("Barat");
    const [eventTiming, setEventTiming] = useState("Morning (1:00 PM - 4:00 PM)");
    const [customCategory, setCustomCategory] = useState("");
    
    // Catering and Addons states
    const [selectedPkgId, setSelectedPkgId] = useState("");
    const [includeAC, setIncludeAC] = useState(true);
    const [includeGenerator, setIncludeGenerator] = useState(true);
    const [includeDecor, setIncludeDecor] = useState(false);
    const [includeSound, setIncludeSound] = useState(false);
    const [includeSecurity, setIncludeSecurity] = useState(false);
    const [advancePaid, setAdvancePaid] = useState(0);

    // Custom Price Overrides (editable for custom discounts)
    const [customHallRent, setCustomHallRent] = useState(2800);
    const [customAcCost, setCustomAcCost] = useState(500);
    const [customGeneratorCost, setCustomGeneratorCost] = useState(350);
    const [customDecorPrice, setCustomDecorPrice] = useState(1200);
    const [customSoundPrice, setCustomSoundPrice] = useState(850);
    const [customSecurityPrice, setCustomSecurityPrice] = useState(400);
    const [customPlatePrices, setCustomPlatePrices] = useState({
        'pkg-1': 45,
        'pkg-2': 32,
        'pkg-3': 65
    });

    // Receipt details for post-booking success display
    const [createdReceipt, setCreatedReceipt] = useState(null);

    // Mock Backup Bookings (fully styled)
    const mockBookings = [
        { 
            id: 'BK-9821', 
            customer: { name: 'Elena Rodriguez', email: 'elena.r@email.com', contact: '+92 300 1234567', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3nJZ87eTfTn0xGvVPaSBmxoK_bKNjw0lxJNe5-1UWwXqIwGVnroC5Kw8CHtDR1u4qYbctnLrlF-X9MiuHCHMCyESsRpJNRdCP6WXEfOrfiWrx6j_aQu1yUU-2xtsJgjvoLolXADAcnM-hLxTRFt5SKFZG90C6eQ9ivNOK1NtNAjmgxtDUXD1MB8OUjtF6h3H6TZMkW99ldlYJk1prHzUqS8bm5PhE6O_KLgWOeTg3CP3kBzSao4V-cyOB7vtXZ69UjoGe3fc7Lc' },
            service: 'Wedding (Barat)',
            bookedDate: 'Oct 12',
            eventDate: '2026-06-24',
            status: 'Confirmed',
            source: 'Online Portal',
            amount: 14850.00
        },
        { 
            id: 'BK-9818', 
            customer: { name: 'Marcus Chen', email: 'm.chen@service.io', contact: '+92 321 9876543', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGc2J-sK-BvFCADAZQGVMhf10TyYi6DhD6Yc1atlF1lmKS4EVjSeFJQJMk7I8qhvjZZA6vPQW47J-e6c0K8w-odx25J7CiSl4He_ZSmWSa_xc06cIdJkVU_SRZH5gNH_OUoIUDAM4xxPCCcbVtbWBkmQOSjltWd71pfaOpr8qACJoiVZuJU5eg0_ClQVCIDr7ivBuSLAB3bpadqC1xFqw3iK2m8yCwE9Fsqmoh3ks6dJfuA3nFEiew7CebUxiEeLHTRbP3O81w15w' },
            service: 'Birthday (Party)',
            bookedDate: 'Oct 10',
            eventDate: '2026-07-15',
            status: 'Confirmed',
            source: 'Online Portal',
            amount: 4850.00
        },
        { 
            id: 'BK-9805', 
            customer: { name: 'Alice Schmidt', email: 'alice.s@web.de', contact: '+92 312 4567890', avatar: null },
            service: 'Walima Banquet',
            bookedDate: 'Sep 28',
            eventDate: '2026-05-05',
            status: 'Completed',
            source: 'Walk-in ERP',
            amount: 18120.00
        }
    ];

    // Show dynamic toast helper
    const triggerToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
    };

    // Load active service data and previous bookings from database
    const loadData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Venue details to retrieve dynamic pricing and catering menu cards
            const docRef = doc(db, "venues", "grand-azure-ballroom");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setVenueData(data);
                if (data.cateringPackages && data.cateringPackages.length > 0) {
                    setSelectedPkgId(data.cateringPackages[0].id);
                }
            }

            // 2. Fetch all walk-in and online bookings from bookings collection
            const bookingsRef = collection(db, "bookings");
            const bookingsSnap = await getDocs(bookingsRef);
            const list = [];
            bookingsSnap.forEach((doc) => {
                const b = doc.data();
                if (b.eventDetails?.venueId === 'grand-azure-ballroom') {
                    list.push({
                        id: b.id,
                        customer: { 
                            name: b.customer?.name || "Client", 
                            email: b.customer?.contact || "No Email",
                            avatar: null 
                        },
                        service: b.eventDetails?.category || "Wedding Event",
                        bookedDate: b.bookedDate || "Today",
                        eventDate: b.eventDetails?.date || "",
                        timing: b.eventDetails?.timing || "",
                        status: b.status || "Confirmed",
                        source: b.eventDetails?.source || "Walk-in ERP",
                        amount: b.financials?.grandTotal || 0
                    });
                }
            });
            setDynamicBookings(list.reverse()); // Show newest bookings first
        } catch (err) {
            console.error("Error pulling database profiles: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (venueData) {
            const p = venueData.pricing || {};
            setCustomHallRent(p.hallRent ?? 2800);
            setCustomAcCost(p.acCost ?? 500);
            setCustomGeneratorCost(p.generatorCost ?? 350);
            setCustomDecorPrice(p.decorPrice ?? 1200);
            setCustomSoundPrice(p.soundPrice ?? 850);
            setCustomSecurityPrice(p.securityPrice ?? 400);

            if (venueData.cateringPackages) {
                const pkgPrices = {};
                venueData.cateringPackages.forEach(pkg => {
                    pkgPrices[pkg.id] = pkg.perPlatePrice;
                });
                setCustomPlatePrices(pkgPrices);
            }
        }
    }, [venueData]);

    // Merge loaded firestore bookings with mock data
    const allBookings = [...dynamicBookings, ...mockBookings];

    // Fallback template values
    const pricing = venueData?.pricing || {
        hallRent: 2800,
        acCost: 500,
        generatorCost: 350,
        decorAvailable: true,
        decorPrice: 1200,
        soundAvailable: true,
        soundPrice: 850,
        securityAvailable: true,
        securityPrice: 400
    };

    const cateringPackages = venueData?.cateringPackages || [
        {
            id: 'pkg-1',
            name: "Barat Luxury Menu",
            type: "Barat",
            perPlatePrice: 45,
            dishes: ["Chicken Biryani", "Mutton Qorma", "Raita & Salad", "Assorted Naan", "Shahi Kheer"]
        },
        {
            id: 'pkg-2',
            name: "Mehndi Feast Chicken Menu",
            type: "Chicken",
            perPlatePrice: 32,
            dishes: ["Chicken Pulao", "Chicken Seekh Kabab", "Fresh Salad", "Mint Raita", "Jalebi"]
        },
        {
            id: 'pkg-3',
            name: "Royal Mutton Walima Menu",
            type: "Mutton",
            perPlatePrice: 65,
            dishes: ["Mutton Mandi", "Mutton Karahi", "Hummus & Pita", "Special Salad", "Shahi Tukray"]
        }
    ];

    // Live calculation calculations
    const selectedPkg = cateringPackages.find(p => p.id === selectedPkgId) || cateringPackages[0];
    
    // Using editable states for all prices to allow custom discounts!
    const baseRent = customHallRent;
    const selectedPkgPrice = customPlatePrices[selectedPkg?.id] !== undefined 
        ? customPlatePrices[selectedPkg.id] 
        : (selectedPkg?.perPlatePrice || 0);

    const cateringCost = selectedPkgPrice * guestsCount;
    const utilitiesCost = (includeAC ? customAcCost : 0) + (includeGenerator ? customGeneratorCost : 0);
    const addonsCost = (includeDecor && pricing.decorAvailable ? customDecorPrice : 0) + 
                       (includeSound && pricing.soundAvailable ? customSoundPrice : 0) + 
                       (includeSecurity && pricing.securityAvailable ? customSecurityPrice : 0);
    
    // Service & Tax calculations (tax at 0% default for now)
    const taxRate = 0.00; 
    const subtotal = baseRent + cateringCost + utilitiesCost + addonsCost;
    const taxCost = subtotal * taxRate;
    const grandTotal = subtotal + taxCost;
    
    const remainingBalance = Math.max(0, grandTotal - parseFloat(advancePaid || 0));

    // Handle confirming the physical booking registration
    const handleRegisterBooking = async (e) => {
        e.preventDefault();
        if (!fullName.trim() || !contactNumber.trim() || !eventDate) {
            triggerToast("Please fill in Client Name, Contact Number and Event Date!", "error");
            return;
        }

        // Check if date is already locked (blocked)
        if (venueData?.blockedDates && venueData.blockedDates.includes(eventDate)) {
            triggerToast(`Date ${eventDate} is already locked for another booking!`, "error");
            return;
        }

        setIsSaving(true);
        const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

        const bookingPayload = {
            id: bookingId,
            customer: {
                name: fullName,
                contact: contactNumber,
                otherName: otherName,
                address: address
            },
            eventDetails: {
                category: eventCategory === 'Other' ? (customCategory || 'Other') : eventCategory,
                date: eventDate,
                timing: eventTiming,
                guests: parseInt(guestsCount, 10),
                venueId: 'grand-azure-ballroom',
                source: 'Walk-in ERP'
            },
            catering: {
                packageId: selectedPkgId,
                packageName: selectedPkg?.name || 'N/A',
                perPlatePrice: selectedPkgPrice,
                dishes: selectedPkg?.dishes || []
            },
            addons: {
                ac: includeAC,
                generator: includeGenerator,
                decor: includeDecor,
                sound: includeSound,
                security: includeSecurity
            },
            financials: {
                hallRent: baseRent,
                cateringCost: cateringCost,
                utilitiesCost: utilitiesCost,
                addonsCost: addonsCost,
                taxPercentage: 0,
                taxCost: 0,
                grandTotal: grandTotal,
                advancePaid: parseFloat(advancePaid || 0),
                remainingBalance: remainingBalance
            },
            status: 'Confirmed',
            bookedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };

        try {
            // 1. Add walk-in booking document to Firestore bookings collection
            const bookingsRef = collection(db, "bookings");
            await addDoc(bookingsRef, bookingPayload);

            // 2. Lock Date Availability inside the venue profile dynamically
            const venueRef = doc(db, "venues", "grand-azure-ballroom");
            await updateDoc(venueRef, {
                blockedDates: arrayUnion(eventDate)
            });

            // Set receipt details for final receipt modal
            setCreatedReceipt(bookingPayload);
            triggerToast("Walk-in Booking Registered & Date Locked Successfully!");
            
            // Reset input values
            setFullName("");
            setContactNumber("");
            setOtherName("");
            setAddress("");
            setGuestsCount(150);
            setEventDate("");
            setEventTiming("Morning (1:00 PM - 4:00 PM)");
            setAdvancePaid(0);
            setIncludeDecor(false);
            setIncludeSound(false);
            setIncludeSecurity(false);

            // Reload dynamic bookings list
            loadData();
        } catch (err) {
            console.error("Error saving booking: ", err);
            triggerToast("Error saving booking. Please try again.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-10 min-h-screen pb-20 relative">
            
            {/* Dynamic Toast Feedback Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: -40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border font-bold text-xs tracking-wider uppercase backdrop-blur-md transition-all
                            ${toast.type === 'success' 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5' 
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/5'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Interactive Invoice Receipt Modal */}
            <AnimatePresence>
                {createdReceipt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="bg-white max-w-lg w-full rounded-[2.5rem] shadow-2xl border border-outline-variant overflow-hidden"
                        >
                            {/* Receipt Header Banner */}
                            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center relative">
                                <span className="material-symbols-outlined text-5xl mb-2 drop-shadow-sm">task_alt</span>
                                <h3 className="text-2xl font-black tracking-tight">Booking Registered!</h3>
                                <p className="text-xs uppercase tracking-widest font-black opacity-85 mt-1">Walk-in physical enrollment invoice</p>
                                <div className="absolute top-6 right-6 font-mono text-[10px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{createdReceipt.id}</div>
                            </div>

                            {/* Client & Date Specs */}
                            <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto scrollbar-hide text-sm font-medium text-slate-700">
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-outline uppercase tracking-wider">Client Name</p>
                                        <p className="font-black text-on-surface mt-1">{createdReceipt.customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-outline uppercase tracking-wider">Contact Number</p>
                                        <p className="font-black text-on-surface mt-1">{createdReceipt.customer.contact}</p>
                                    </div>
                                    {createdReceipt.customer.otherName && (
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-black text-outline uppercase tracking-wider">Other / Event Name</p>
                                            <p className="font-bold text-on-surface mt-0.5">{createdReceipt.customer.otherName}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-2 pb-4 border-b border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-outline uppercase tracking-wider">Event Date</p>
                                        <p className="font-black text-primary mt-1 text-xs">{createdReceipt.eventDetails.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-outline uppercase tracking-wider">Timing Slot</p>
                                        <p className="font-black text-on-surface mt-1 text-[9px] tracking-tight whitespace-nowrap">{createdReceipt.eventDetails.timing || "Morning"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-outline uppercase tracking-wider">Category</p>
                                        <p className="font-bold text-on-surface mt-1 uppercase text-xs">{createdReceipt.eventDetails.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-outline uppercase tracking-wider">Guests Count</p>
                                        <p className="font-black text-secondary mt-1 text-xs">{createdReceipt.eventDetails.guests} PAX</p>
                                    </div>
                                </div>

                                {/* Financial Ledger items */}
                                <div className="space-y-2 pb-4 border-b border-slate-100 font-medium text-on-surface-variant">
                                    <div className="flex justify-between">
                                        <span>Base Venue Seating Rent</span>
                                        <span className="font-bold text-on-surface">${createdReceipt.financials.hallRent.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Catering ({createdReceipt.catering.packageName})</span>
                                        <span className="font-bold text-on-surface">${createdReceipt.financials.cateringCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs pl-2 italic">
                                        <span>— {createdReceipt.catering.perPlatePrice} Per Plate × {createdReceipt.eventDetails.guests} Guests</span>
                                    </div>
                                    {createdReceipt.financials.utilitiesCost > 0 && (
                                        <div className="flex justify-between">
                                            <span>Utility charges (AC / Backup Power)</span>
                                            <span className="font-bold text-on-surface">${createdReceipt.financials.utilitiesCost.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {createdReceipt.financials.addonsCost > 0 && (
                                        <div className="flex justify-between">
                                            <span>Optional Add-ons (Decor, DJ, Security)</span>
                                            <span className="font-bold text-on-surface">${createdReceipt.financials.addonsCost.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between text-on-surface-variant font-bold text-xs uppercase">
                                        <span>Invoice Grand Total</span>
                                        <span className="text-lg font-black text-primary">${createdReceipt.financials.grandTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-600 font-bold text-xs uppercase pt-1.5 border-t border-slate-200">
                                        <span>Advance Deposit Paid</span>
                                        <span className="font-black">${createdReceipt.financials.advancePaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-rose-500 font-bold text-xs uppercase pt-1">
                                        <span>Remaining Balance Due</span>
                                        <span className="font-black text-sm">${createdReceipt.financials.remainingBalance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal actions */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                                <button 
                                    onClick={() => window.print()}
                                    className="flex-1 bg-white hover:bg-slate-55 border border-slate-200 text-on-surface-variant py-4 rounded-full font-black text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">print</span> Print Invoice
                                </button>
                                <button 
                                    onClick={() => setCreatedReceipt(null)}
                                    className="flex-1 bg-primary text-white hover:bg-primary-hover py-4 rounded-full font-black text-xs tracking-wider uppercase transition-all shadow-[0_8px_20px_rgba(224,64,160,0.3)] cursor-pointer"
                                >
                                    Finish Booking
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!showWalkinForm ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex flex-col gap-10"
                    >
                        {/* Header with Add Button */}
                        <header className="flex flex-wrap justify-between items-end gap-6 px-2">
                            <div>
                                <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                    <span>Dashboard</span>
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    <span className="text-primary">Bookings</span>
                                </div>
                                <h2 className="text-5xl font-black text-on-surface tracking-tighter">Bookings Panel</h2>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <motion.button 
                                    onClick={() => setShowWalkinForm(true)}
                                    whileHover={{ scale: 1.05, shadow: '0 20px 25px -5px rgb(224 64 160 / 0.3)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4.5 rounded-[2rem] font-black text-xs tracking-widest uppercase shadow-[0_8px_32px_rgba(224,64,160,0.25)] flex items-center gap-2 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">person_add</span>
                                    Create Walk-in Booking
                                </motion.button>
                            </div>
                        </header>

                        {/* Booking Summary Stats Cards */}
                        <BookingStats />

                        {/* Booking Filters */}
                        <section className="space-y-6">
                            <BookingFilters onNewBooking={() => setShowWalkinForm(true)} />
                            
                            {/* Interactive Live-Firestore Bookings Table */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-outline-variant">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-surface-variant/30 border-b border-outline-variant">
                                            <tr>
                                                <th className="p-6 w-16"><input type="checkbox" className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-outline-variant cursor-pointer" /></th>
                                                <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em]">Booking ID</th>
                                                <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em]">Customer</th>
                                                <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em]">Source</th>
                                                <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] text-center">Event Dates</th>
                                                <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] text-center">Status</th>
                                                <th className="p-6 text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] text-right">Amount</th>
                                                <th className="p-6 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant/30 text-slate-700">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan="8" className="p-12 text-center text-outline font-bold uppercase tracking-widest text-xs">
                                                        <span className="animate-spin inline-block w-6 h-6 border-4 border-primary border-t-transparent rounded-full mr-3 align-middle"></span>
                                                        Loading physical bookings ledger...
                                                    </td>
                                                </tr>
                                            ) : allBookings.map((booking, idx) => (
                                                <motion.tr 
                                                    key={booking.id || idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    className="hover:bg-primary-fixed/5 transition-colors group cursor-pointer"
                                                >
                                                    <td className="p-5">
                                                        <input type="checkbox" className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-outline-variant cursor-pointer" />
                                                    </td>
                                                    <td className="p-5 font-black text-primary text-xs tracking-wider">{booking.id}</td>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-4">
                                                            {booking.customer.avatar ? (
                                                                <img 
                                                                    src={booking.customer.avatar} 
                                                                    alt={booking.customer.name}
                                                                    className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-sm"
                                                                />
                                                            ) : (
                                                                <div className="w-11 h-11 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-black text-sm uppercase">
                                                                    {booking.customer.name.substring(0, 2)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-black text-on-surface leading-tight">{booking.customer.name}</p>
                                                                <p className="text-[10px] text-outline font-bold mt-1 uppercase tracking-wider">{booking.customer.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`text-[9px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider border 
                                                            ${booking.source.includes('Walk-in') 
                                                                ? 'bg-primary-container text-on-primary-container border-primary/10' 
                                                                : 'bg-secondary-container text-on-secondary-container border-secondary/10'}`}>
                                                            {booking.source}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                         <div className="flex flex-col gap-0.5">
                                                             <span className="text-[9px] font-bold text-outline uppercase tracking-wider">Booked: {booking.bookedDate}</span>
                                                             <span className="text-xs font-black text-on-surface">{booking.eventDate}</span>
                                                             {booking.timing && (
                                                                 <span className="text-[8px] font-black text-primary uppercase tracking-tight mt-0.5">{booking.timing.split(" ")[0]} Slot</span>
                                                             )}
                                                         </div>
                                                     </td>
                                                    <td className="p-5 text-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm
                                                            ${booking.status === 'Completed' 
                                                                ? 'bg-slate-100 text-slate-700 border-slate-200' 
                                                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-right font-black text-on-surface tracking-tight text-sm">
                                                        ${booking.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button className="material-symbols-outlined text-outline group-hover:text-primary transition-all p-2 hover:bg-slate-100 rounded-full">
                                                            more_vert
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="walkin"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        className="space-y-8"
                    >
                        {/* Form Header */}
                        <header className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setShowWalkinForm(false)}
                                className="w-12 h-12 bg-white rounded-full border border-outline-variant hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer shadow-sm text-on-surface-variant"
                            >
                                <span className="material-symbols-outlined font-black">arrow_back</span>
                            </button>
                            <div>
                                <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                                    <span>Bookings</span>
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    <span className="text-primary">New Walk-in Enrollment</span>
                                </div>
                                <h2 className="text-3xl font-black text-on-surface tracking-tight">On-site Booking Registration</h2>
                            </div>
                        </header>

                        {/* Interactive Double-Column Grid */}
                        <form onSubmit={handleRegisterBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-700">
                            
                            {/* Left Column: Form Fields */}
                            <div className="lg:col-span-8 space-y-6">
                                
                                {/* Section 1: Client Bio */}
                                <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                                    <h3 className="text-lg font-black text-on-surface border-b border-slate-100 pb-3 flex items-center gap-2 uppercase tracking-wide text-xs text-outline font-black">
                                        <span className="material-symbols-outlined text-primary text-lg">badge</span> 
                                        1. Customer Identification
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Full Name *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="e.g. Ukasha Khan" 
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Contact Number *</label>
                                            <input 
                                                type="tel" 
                                                required
                                                value={contactNumber}
                                                onChange={(e) => setContactNumber(e.target.value)}
                                                placeholder="e.g. +92 300 1234567" 
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Bride / Groom / Secondary Contact</label>
                                            <input 
                                                type="text" 
                                                value={otherName}
                                                onChange={(e) => setOtherName(e.target.value)}
                                                placeholder="e.g. Ayesha's Wedding Reception" 
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Permanent Home Address</label>
                                            <input 
                                                type="text" 
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="e.g. Phase 5 DHA, Lahore" 
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Event Details */}
                                <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                                    <h3 className="text-lg font-black text-on-surface border-b border-slate-100 pb-3 flex items-center gap-2 uppercase tracking-wide text-xs text-outline font-black">
                                        <span className="material-symbols-outlined text-primary text-lg">calendar_month</span> 
                                        2. Event Scheduling & Capacity
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Event Date *</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={eventDate}
                                                onChange={(e) => setEventDate(e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all"
                                            />
                                            {venueData?.blockedDates && venueData.blockedDates.includes(eventDate) && (
                                                <span className="text-[10px] text-error font-black uppercase px-1 flex items-center gap-1 mt-1">
                                                    <span className="material-symbols-outlined text-xs">block</span> Already Booked!
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Event Timing *</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEventTiming("Morning (1:00 PM - 4:00 PM)")}
                                                    className={`py-2 px-3 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all flex flex-col items-center justify-center gap-0.5 min-h-[46px]
                                                        ${eventTiming === "Morning (1:00 PM - 4:00 PM)"
                                                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                                                            : "bg-slate-50 border-transparent text-outline hover:bg-slate-100"}`}
                                                >
                                                    <span className="text-[9px] font-black">Morning</span>
                                                    <span className="text-[8px] opacity-75 font-bold whitespace-nowrap">1PM - 4PM</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEventTiming("Evening (7:00 PM - 10:00 PM)")}
                                                    className={`py-2 px-3 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all flex flex-col items-center justify-center gap-0.5 min-h-[46px]
                                                        ${eventTiming === "Evening (7:00 PM - 10:00 PM)"
                                                            ? "bg-secondary/10 border-secondary text-secondary shadow-sm"
                                                            : "bg-slate-50 border-transparent text-outline hover:bg-slate-100"}`}
                                                >
                                                    <span className="text-[9px] font-black">Evening</span>
                                                    <span className="text-[8px] opacity-75 font-bold whitespace-nowrap">7PM - 10PM</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Total Guests *</label>
                                            <input 
                                                type="number" 
                                                required
                                                min="50"
                                                max="1000"
                                                value={guestsCount}
                                                onChange={(e) => setGuestsCount(parseInt(e.target.value, 10) || 0)}
                                                placeholder="e.g. 250" 
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Event Category *</label>
                                            <select 
                                                value={eventCategory}
                                                onChange={(e) => setEventCategory(e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all"
                                            >
                                                <option value="Mehndi">Mehndi Feasts</option>
                                                <option value="Barat">Barat Reception</option>
                                                <option value="Walima">Walima Banquet</option>
                                                <option value="Party">Social Party</option>
                                                <option value="Bdy">Birthday Party</option>
                                                <option value="Corporate Event">Corporate Event</option>
                                                <option value="Other">Other / Custom</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Inline custom option input */}
                                    {eventCategory === "Other" && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2 pt-2"
                                        >
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Specify Event Type Name</label>
                                            <input 
                                                type="text"
                                                required
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value)}
                                                placeholder="e.g. Engagement Party" 
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-bold text-sm transition-all animate-pulse"
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Section 3: Catering Package Selection (Interactive Check Cards) */}
                                <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <h3 className="text-lg font-black text-on-surface flex items-center gap-2 uppercase tracking-wide text-xs text-outline font-black">
                                            <span className="material-symbols-outlined text-primary text-lg">restaurant_menu</span> 
                                            3. Catering Package Configuration
                                        </h3>
                                        <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                                            Directly Synced with Services Tab
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {cateringPackages.map((pkg) => {
                                            const isSelected = selectedPkgId === pkg.id;
                                            return (
                                                <div 
                                                    key={pkg.id}
                                                    onClick={() => setSelectedPkgId(pkg.id)}
                                                    className={`border-2 rounded-3xl p-6 cursor-pointer transition-all relative flex flex-col justify-between group
                                                        ${isSelected 
                                                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                                                            : 'border-outline-variant hover:border-slate-300 hover:bg-slate-50'}`}
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start gap-4 mb-2">
                                                            <h4 className="font-black text-on-surface text-base leading-tight group-hover:text-primary transition-colors">{pkg.name}</h4>
                                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-white shrink-0
                                                                ${isSelected ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
                                                                {isSelected && <span className="material-symbols-outlined text-xs font-black">done</span>}
                                                            </span>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-secondary/10 text-secondary border border-secondary/10 rounded-full tracking-widest">{pkg.type} Menu</span>
                                                        
                                                        {/* Dishes Array Preview */}
                                                        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                                                            <p className="text-[9px] font-black uppercase text-outline tracking-wider">Dishes List:</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {pkg.dishes && pkg.dishes.map((dish, i) => (
                                                                    <span key={i} className="text-[10px] font-bold bg-white border border-slate-100 text-on-surface-variant px-2 py-0.5 rounded-full">{dish}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-3 group/cost" onClick={(e) => e.stopPropagation()}>
                                                         <span className="text-[9px] font-bold text-outline uppercase tracking-wider flex items-center gap-1">
                                                             Per Plate Cost ($)
                                                             <span className="material-symbols-outlined text-[10px] text-outline opacity-40 group-hover/cost:opacity-100 transition-opacity">edit</span>
                                                         </span>
                                                         <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 focus-within:border-primary/50 focus-within:bg-white rounded-xl px-2.5 py-0.5 transition-all">
                                                             <input 
                                                                 type="number"
                                                                 min="0"
                                                                 value={customPlatePrices[pkg.id] !== undefined ? customPlatePrices[pkg.id] : pkg.perPlatePrice}
                                                                 onChange={(e) => {
                                                                     const val = parseFloat(e.target.value) || 0;
                                                                     setCustomPlatePrices(prev => ({
                                                                         ...prev,
                                                                         [pkg.id]: val
                                                                     }));
                                                                 }}
                                                                 className="w-14 text-right bg-transparent border-none p-0 focus:ring-0 text-sm font-black text-primary animate-pulse-once"
                                                             />
                                                         </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Section 4: Dynamic Logistics & Utility Add-ons */}
                                <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
                                    <h3 className="text-lg font-black text-on-surface border-b border-slate-100 pb-3 flex items-center gap-2 uppercase tracking-wide text-xs text-outline font-black">
                                        <span className="material-symbols-outlined text-primary text-lg">electric_bolt</span> 
                                        4. Operations & Optional Logistics
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {/* Air Conditioning */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group/ac">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-on-surface">Air Conditioning (AC)</p>
                                                <div className="flex items-center gap-1 text-[10px] font-black text-outline">
                                                    <span>AC Fee ($):</span>
                                                    <div className="flex items-center bg-white border border-slate-200/50 rounded-lg px-2 py-0.5 focus-within:border-primary/50 transition-all">
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            value={customAcCost}
                                                            onChange={(e) => setCustomAcCost(parseFloat(e.target.value) || 0)}
                                                            className="w-12 text-right bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black text-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={includeAC} 
                                                    onChange={(e) => setIncludeAC(e.target.checked)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                            </label>
                                        </div>

                                        {/* Generator Setup */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group/gen">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-on-surface">Backup Generator</p>
                                                <div className="flex items-center gap-1 text-[10px] font-black text-outline">
                                                    <span>Setup ($):</span>
                                                    <div className="flex items-center bg-white border border-slate-200/50 rounded-lg px-2 py-0.5 focus-within:border-primary/50 transition-all">
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            value={customGeneratorCost}
                                                            onChange={(e) => setCustomGeneratorCost(parseFloat(e.target.value) || 0)}
                                                            className="w-12 text-right bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black text-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={includeGenerator} 
                                                    onChange={(e) => setIncludeGenerator(e.target.checked)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                            </label>
                                        </div>

                                        {/* Decor System */}
                                        {pricing.decorAvailable && (
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group/decor animate-fade-in">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-on-surface">Decor Package</p>
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-outline">
                                                        <span>Price ($):</span>
                                                        <div className="flex items-center bg-white border border-slate-200/50 rounded-lg px-2 py-0.5 focus-within:border-primary/50 transition-all">
                                                            <input 
                                                                type="number"
                                                                min="0"
                                                                value={customDecorPrice}
                                                                onChange={(e) => setCustomDecorPrice(parseFloat(e.target.value) || 0)}
                                                                className="w-12 text-right bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black text-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox"
                                                        checked={includeDecor} 
                                                        onChange={(e) => setIncludeDecor(e.target.checked)}
                                                        className="sr-only peer" 
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                                </label>
                                            </div>
                                        )}

                                        {/* Sound / DJ */}
                                        {pricing.soundAvailable && (
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group/sound">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-on-surface">Sound & DJ setup</p>
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-outline">
                                                        <span>Price ($):</span>
                                                        <div className="flex items-center bg-white border border-slate-200/50 rounded-lg px-2 py-0.5 focus-within:border-primary/50 transition-all">
                                                            <input 
                                                                type="number"
                                                                min="0"
                                                                value={customSoundPrice}
                                                                onChange={(e) => setCustomSoundPrice(parseFloat(e.target.value) || 0)}
                                                                className="w-12 text-right bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black text-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox"
                                                        checked={includeSound} 
                                                        onChange={(e) => setIncludeSound(e.target.checked)}
                                                        className="sr-only peer" 
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                                </label>
                                            </div>
                                        )}

                                        {/* Valet / Security */}
                                        {pricing.securityAvailable && (
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group/sec">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-on-surface">Valet & Security</p>
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-outline">
                                                        <span>Price ($):</span>
                                                        <div className="flex items-center bg-white border border-slate-200/50 rounded-lg px-2 py-0.5 focus-within:border-primary/50 transition-all">
                                                            <input 
                                                                type="number"
                                                                min="0"
                                                                value={customSecurityPrice}
                                                                onChange={(e) => setCustomSecurityPrice(parseFloat(e.target.value) || 0)}
                                                                className="w-12 text-right bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black text-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        type="checkbox"
                                                        checked={includeSecurity} 
                                                        onChange={(e) => setIncludeSecurity(e.target.checked)}
                                                        className="sr-only peer" 
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Live Glassmorphic Invoice Preview & Receipt Panel */}
                            <div className="lg:col-span-4">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 shadow-xl space-y-6 sticky top-6">
                                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-xl">payments</span>
                                        <h3 className="text-sm font-black text-on-surface uppercase tracking-wider font-black">Live Invoice Calculator</h3>
                                    </div>

                                    {/* Cost Summary Ledger */}
                                    <div className="space-y-3.5 text-xs text-on-surface-variant font-medium">
                                        <div className="flex justify-between items-center group/rent">
                                            <span className="flex items-center gap-1">
                                                Base Seating Rent
                                                <span className="material-symbols-outlined text-[10px] text-outline opacity-40 group-hover/rent:opacity-100 transition-opacity">edit</span>
                                            </span>
                                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 focus-within:border-primary/50 focus-within:bg-white rounded-lg px-2 py-0.5 transition-all">
                                                <span className="text-[10px] font-bold text-outline">$</span>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={customHallRent}
                                                    onChange={(e) => setCustomHallRent(parseFloat(e.target.value) || 0)}
                                                    className="w-16 text-right bg-transparent border-none p-0 focus:ring-0 text-xs font-black text-on-surface"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-100/50">
                                            <span>Catering ({selectedPkg?.name || "None"})</span>
                                            <span className="font-bold text-on-surface">${cateringCost.toLocaleString()}</span>
                                        </div>
                                        <div className="text-[10px] pl-2 text-outline font-bold italic flex justify-between items-center gap-2 group/rate">
                                            <span className="flex items-center gap-1">
                                                — Plate Price × {guestsCount} PAX
                                                <span className="material-symbols-outlined text-[10px] text-outline opacity-40 group-hover/rate:opacity-100 transition-opacity">edit</span>
                                            </span>
                                            <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200/50 focus-within:border-primary/50 focus-within:bg-white rounded-lg px-1.5 py-0.5 transition-all">
                                                <span className="text-[9px] font-bold text-outline">$</span>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={selectedPkgPrice}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        setCustomPlatePrices(prev => ({
                                                            ...prev,
                                                            [selectedPkg?.id]: val
                                                        }));
                                                    }}
                                                    className="w-12 text-right bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black text-on-surface"
                                                />
                                            </div>
                                        </div>

                                        {utilitiesCost > 0 && (
                                            <div className="flex justify-between">
                                                <span>Operational Utilities (AC/Generator)</span>
                                                <span className="font-bold text-on-surface">${utilitiesCost.toLocaleString()}</span>
                                            </div>
                                        )}

                                        {addonsCost > 0 && (
                                            <div className="flex justify-between">
                                                <span>Optional Logistics (Add-ons)</span>
                                                <span className="font-bold text-on-surface">${addonsCost.toLocaleString()}</span>
                                            </div>
                                        )}

                                        {/* Tax Rate (0.00% default for now) */}
                                        <div className="flex justify-between pt-1 border-t border-slate-100">
                                            <span>GST Tax / Services (0.00%)</span>
                                            <span className="font-bold text-on-surface">$0.00</span>
                                        </div>
                                    </div>

                                    {/* Grand Total banner */}
                                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary-fixed-dim/20 space-y-1">
                                        <p className="text-[10px] font-black uppercase text-outline tracking-widest font-black">Total Invoice Amount</p>
                                        <h3 className="text-3xl font-black text-primary tracking-tight">${grandTotal.toLocaleString()}</h3>
                                    </div>

                                    {/* Advance Deposit Section */}
                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Advance Payment Received ($)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            max={grandTotal}
                                            value={advancePaid}
                                            onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                                            placeholder="e.g. 5000" 
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 focus:bg-white focus:border-primary focus:ring-0 text-on-surface font-black text-sm transition-all"
                                        />
                                    </div>

                                    <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs font-bold">
                                        <div className="flex justify-between text-on-surface-variant">
                                            <span>Advance Deposit Paid</span>
                                            <span className="text-emerald-600">${parseFloat(advancePaid || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-rose-500 font-black border-t border-slate-200/60 pt-1.5 uppercase font-black">
                                            <span>Remaining Due Balance</span>
                                            <span>${remainingBalance.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Submit action */}
                                    <motion.button 
                                        type="submit"
                                        disabled={isSaving}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all shadow-[0_8px_32px_rgba(224,64,160,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <>
                                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                                REGISTERTING BOOKING...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                                                Confirm & Lock Booking
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookingsPage;
