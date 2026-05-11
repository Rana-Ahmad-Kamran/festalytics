import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Users, DollarSign, CheckCircle, Phone, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
import hallsData from '../data/halls.json';

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

  // Pre-process images to fix pathing
  const images = venue.images && venue.images.length > 0 
    ? venue.images.map(img => img.replace('/Marriage Hall/', '/Marriage_hall/'))
    : ['/images/placeholder-hall.jpg'];

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
              
              {/* Booking/Price Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <p className="text-sm text-gray-500 font-medium mb-1">Starting from</p>
                  <h3 className="text-3xl font-bold text-[#D6336C]">
                    {venue.price_range ? venue.price_range.split(' ')[1] || venue.price_range : 'Contact'}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">per head (approx)</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Capacity</p>
                      <p className="font-bold">{venue.capacity_sitting || 'Not specified'} Guests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Menu Packages</p>
                      <p className="font-bold text-sm">Chicken: {venue.one_dish_chicken || '-'} | Beef: {venue.one_dish_beef || '-'}</p>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-[#D6336C] to-[#B02A58] text-white py-4 rounded-xl font-bold shadow-md shadow-[#D6336C]/20 hover:shadow-lg transition-all hover:-translate-y-0.5">
                  Request Booking
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
