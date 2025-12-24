import React from 'react';
import {
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from 'react-icons/fa6';

const primary = '#D6336C';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="w-full space-y-6 md:w-2/5">
            <div className="text-3xl font-bold">Festalytics</div>

            <div className="space-y-3">
              <p className="text-lg font-semibold">Stay Updated</p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pr-32 text-sm text-gray-700 shadow-sm focus:border-[#D6336C] focus:outline-none focus:ring-2 focus:ring-[#D6336C]"
                />
                <button
                  style={{ backgroundColor: primary }}
                  className="absolute right-1 top-1 rounded-full px-4 py-2 text-sm font-semibold text-white hover:brightness-110 active:translate-y-px"
                >
                  Stay Updated
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-lg font-semibold">Got any suggestions for us?</p>
              <textarea
                rows={4}
                placeholder="Share your feedback"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-[#D6336C] focus:outline-none focus:ring-2 focus:ring-[#D6336C]"
              />
              <button
                style={{ backgroundColor: primary }}
                className="rounded-full px-5 py-2 text-sm font-semibold text-white hover:brightness-110 active:translate-y-px"
              >
                Submit
              </button>
            </div>
          </div>

          <div className="w-full md:w-3/5">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-800">Company</p>
                {['About Us', 'Contact Us', 'Careers', 'Press & Coverage', 'Vendors', 'Blog'].map(
                  (item) => (
                    <a
                      key={item}
                      href="#"
                      className="block text-sm text-gray-500 hover:text-gray-700"
                    >
                      {item}
                    </a>
                  )
                )}
              </div>
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-800">Services</p>
                {[
                  'Venue Browsing & Listing',
                  'Event Creation & Management',
                  'Vendor Browsing & Booking',
                  'AI Décor Similarity Matching',
                  'Food Quantity Calculator (AI Based)',
                  'Smart Vendor Recommendations (AI)',
                  'Real-time Chat with Vendors',
                  'Secure User, Vendor & Admin System',
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-sm text-gray-500 hover:text-gray-700"
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-800">Legal</p>
                {['Terms and Conditions', 'Privacy Policy'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-sm text-gray-500 hover:text-gray-700"
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-800">Download</p>
                <a href="#" className="block text-sm text-gray-500 hover:text-gray-700">
                  Festalytics App
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-gray-100 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© Festalytics 2025. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4 text-gray-500">
            <a href="#" className="hover:text-gray-700" aria-label="X">
              <FaXTwitter />
            </a>
            <a href="#" className="hover:text-gray-700" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-gray-700" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href="#" className="hover:text-gray-700" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-gray-700" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <button
        style={{ backgroundColor: primary }}
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg hover:brightness-110 active:translate-y-px"
        aria-label="WhatsApp"
      >
        <FaWhatsapp size={22} />
      </button>
    </footer>
  );
};

export default Footer;
