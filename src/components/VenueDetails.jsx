import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Users, DollarSign, CheckCircle, Phone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
import hallsData from '../data/halls.json';
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const VenueDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [rating, setRating] = useState('4.5');

  useEffect(() => {
    // Find venue by ID or slugified Name
    const foundVenue = hallsData.find(h => 
      h.hall_id?.toString() === id || 
      (h.hall_name && h.hall_name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase())
    );
    setVenue(foundVenue);
  }, [id]);

  useEffect(() => {
    if (venue) {
      setRating(venue.rating || (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1));
    }
  }, [venue]);

  const [dbVenue, setDbVenue] = useState(null);
  const [loadingDb, setLoadingDb] = useState(true);

  // Dynamic Cost Estimation Engine states
  const [guestsCount, setGuestsCount] = useState(150);
  const [selectedPkgId, setSelectedPkgId] = useState("");
  const [includeAC, setIncludeAC] = useState(true);
  const [includeGenerator, setIncludeGenerator] = useState(true);
  
  const [includeDecor, setIncludeDecor] = useState(false);
  const [includeSound, setIncludeSound] = useState(false);
  const [includeSecurity, setIncludeSecurity] = useState(false);

  useEffect(() => {
    const fetchDbVenue = async () => {
      try {
        const docRef = doc(db, "venues", "grand-azure-ballroom");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDbVenue(data);
          if (data.cateringPackages && data.cateringPackages.length > 0) {
            setSelectedPkgId(data.cateringPackages[0].id);
          }
        }
      } catch (err) {
        console.error("Error reading Firestore in client: ", err);
      } finally {
        setLoadingDb(false);
      }
    };
    fetchDbVenue();
  }, []);

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue not found</h2>
          <button onClick={() => router.back()} className="text-[#D6336C] font-semibold hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Operational Pricing and Catering Tiers (from Firestore DB or default fallback templates)
  const activePricing = dbVenue?.pricing || {
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

  const activePackages = dbVenue?.cateringPackages || [
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

  // Derived calculation variables for estimation engine
  const selectedPkg = activePackages.find(p => p.id === selectedPkgId) || activePackages[0];
  const baseRent = activePricing.hallRent || 0;
  const cateringCost = selectedPkg ? (selectedPkg.perPlatePrice * guestsCount) : 0;
  const utilitiesCost = (includeAC ? activePricing.acCost : 0) + (includeGenerator ? activePricing.generatorCost : 0);
  const addonsCost = (includeDecor && activePricing.decorAvailable ? activePricing.decorPrice : 0) + 
                     (includeSound && activePricing.soundAvailable ? activePricing.soundPrice : 0) + 
                     (includeSecurity && activePricing.securityAvailable ? activePricing.securityPrice : 0);
  const totalEstimation = baseRent + cateringCost + utilitiesCost + addonsCost;

  // Pre-process images to fix pathing (load from Firestore if custom reordering was saved)
  const images = dbVenue?.images && dbVenue.images.length > 0 
    ? dbVenue.images.map(img => img.url)
    : (venue.images && venue.images.length > 0 
        ? venue.images.map(img => img.replace('/Marriage Hall/', '/Marriage_hall/'))
        : ['/images/placeholder-hall.jpg']);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header / Title */}
            <div>
              <div className="flex justify-between items-start mb-2 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{venue.hall_name}</h1>
                <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm px-3 py-1 rounded-lg font-bold text-gray-700 shrink-0">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  {rating}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{venue.full_address || venue.area || 'Lahore'}</span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <motion.div 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-gray-200 shadow-sm border border-gray-100"
              >
                <img 
                  src={images[activeImage]} 
                  alt={venue.hall_name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2698&auto=format&fit=crop'; }}
                />
              </motion.div>
              
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
                  {images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-24 h-24 rounded-xl overflow-hidden shrink-0 snap-start border-2 transition-all ${
                        activeImage === idx ? 'border-[#D6336C] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#D6336C]" /> About This Venue
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {venue.description || 'Experience the perfect blend of elegance and exceptional service at our venue. Designed to host your memorable events, we offer state-of-the-art facilities, beautiful decor, and a dedicated team to make your special day truly unforgettable.'}
              </p>
            </div>

            {/* Facilities Grid */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                {[
                  { key: 'is_air_conditioned', label: 'Air Conditioned' },
                  { key: 'generator_backup', label: 'Generator Backup' },
                  { key: 'decoration_in_house', label: 'In-House Decor' },
                  { key: 'bridal_room', label: 'Bridal Room' },
                  { key: 'parking_capacity', label: `Parking: ${venue.parking_capacity || 'Yes'}` }
                ].map((facility, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700 font-medium">
                    <CheckCircle className={`w-5 h-5 ${venue[facility.key] === 'yes' || facility.key === 'parking_capacity' ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>{facility.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Automated Cost Estimation Engine */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Cost Estimator</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Automated Quote Engine</h3>
                  <p className="text-xs text-gray-400">Configure logistics for an instant, error-free total breakdown.</p>
                </div>

                {/* Input 1: Guest count */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>Number of Guests</span>
                    <span className="text-[#D6336C] bg-[#D6336C]/10 px-2 py-0.5 rounded-md font-black">{guestsCount} Guests</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="10"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(parseInt(e.target.value) || 50)}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#D6336C]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>Min: 50</span>
                    <span>Max: 1000</span>
                  </div>
                </div>

                {/* Input 2: Catering Tier Packages */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Select Catering Package</label>
                  <select 
                    value={selectedPkgId}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-[#D6336C] cursor-pointer"
                  >
                    <option value="">No Food / Venue Hire Only</option>
                    {activePackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.type}) — ${pkg.perPlatePrice}/head
                      </option>
                    ))}
                  </select>

                  {/* Dishes Preview */}
                  {selectedPkg && (
                    <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-1">
                      <span className="text-[9px] font-black text-[#D6336C] uppercase tracking-wider block">Included Menu Dishes:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedPkg.dishes.map((dish, i) => (
                          <span key={i} className="text-[9px] bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-100 font-medium">
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input 3: Utility Charges */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Utility Configuration</label>
                  
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeAC}
                        onChange={(e) => setIncludeAC(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-[#D6336C] focus:ring-[#D6336C]"
                      />
                      <span>Air Conditioning (AC)</span>
                    </label>
                    <span className="text-slate-500 font-extrabold">+${activePricing.acCost}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeGenerator}
                        onChange={(e) => setIncludeGenerator(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-[#D6336C] focus:ring-[#D6336C]"
                      />
                      <span>Generator / Backup setup</span>
                    </label>
                    <span className="text-slate-500 font-extrabold">+${activePricing.generatorCost}</span>
                  </div>
                </div>

                {/* Input 4: Optional Add-ons */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Optional Add-ons & Services</label>

                  {activePricing.decorAvailable && (
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={includeDecor}
                          onChange={(e) => setIncludeDecor(e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-[#D6336C] focus:ring-[#D6336C]"
                        />
                        <span>Premium Décor Packages</span>
                      </label>
                      <span className="text-slate-500 font-extrabold">+${activePricing.decorPrice}</span>
                    </div>
                  )}

                  {activePricing.soundAvailable && (
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={includeSound}
                          onChange={(e) => setIncludeSound(e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-[#D6336C] focus:ring-[#D6336C]"
                        />
                        <span>Sound & DJ Systems</span>
                      </label>
                      <span className="text-slate-500 font-extrabold">+${activePricing.soundPrice}</span>
                    </div>
                  )}

                  {activePricing.securityAvailable && (
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={includeSecurity}
                          onChange={(e) => setIncludeSecurity(e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-[#D6336C] focus:ring-[#D6336C]"
                        />
                        <span>Valet & Event Security</span>
                      </label>
                      <span className="text-slate-500 font-extrabold">+${activePricing.securityPrice}</span>
                    </div>
                  )}
                </div>

                {/* Calculations Summary Breakdown */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cost Breakdown</span>
                  
                  <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                    <span>Base Hall Rent:</span>
                    <span className="font-bold text-slate-800">${baseRent}</span>
                  </div>

                  {cateringCost > 0 && (
                    <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                      <span>Catering Subtotal ({guestsCount} × ${selectedPkg?.perPlatePrice}):</span>
                      <span className="font-bold text-slate-800">${cateringCost}</span>
                    </div>
                  )}

                  {utilitiesCost > 0 && (
                    <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                      <span>Utility Setup Fees:</span>
                      <span className="font-bold text-slate-800">${utilitiesCost}</span>
                    </div>
                  )}

                  {addonsCost > 0 && (
                    <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                      <span>Optional Services:</span>
                      <span className="font-bold text-slate-800">${addonsCost}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200/60 pt-2.5 flex justify-between items-center">
                    <span className="text-sm font-black text-slate-800">Total Estimation:</span>
                    <span className="text-xl font-black text-[#D6336C]">${totalEstimation}</span>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Perfect! Dynamic estimation request submitted successfully with total estimated value of $${totalEstimation} for ${guestsCount} guests.`)}
                  className="w-full bg-gradient-to-r from-[#D6336C] to-[#B02A58] text-white py-4 rounded-xl font-bold shadow-md shadow-[#D6336C]/20 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer text-center text-sm"
                >
                  Book Dynamic Quote Request
                </button>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Contact Venue</h3>
                <div className="space-y-3">
                  {venue.phone_1 && (
                    <a href={`tel:${venue.phone_1}`} className="flex items-center gap-3 text-gray-600 hover:text-[#D6336C] transition-colors p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">{venue.phone_1}</span>
                    </a>
                  )}
                  {venue.phone_2 && (
                    <a href={`tel:${venue.phone_2}`} className="flex items-center gap-3 text-gray-600 hover:text-[#D6336C] transition-colors p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">{venue.phone_2}</span>
                    </a>
                  )}
                  {!venue.phone_1 && !venue.phone_2 && (
                    <p className="text-sm text-gray-500 italic">No contact numbers available.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VenueDetails;
