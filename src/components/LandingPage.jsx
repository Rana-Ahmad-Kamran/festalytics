'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaBolt, FaRocket, FaStar, FaLightbulb, FaCalendarCheck, FaChartLine, FaUserCog, FaArrowRight } from 'react-icons/fa'
import image1 from '../assets/image1.jpg'
import image2 from '../assets/image2.jpg'

function LandingPage({ onLoginClick }) {
  const [isImage1, setIsImage1] = useState(true)
  const router = useRouter()

  const handleImageToggle = () => {
    setIsImage1(prev => !prev)
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section
        className="min-h-[90vh] flex items-center justify-center relative overflow-visible cursor-pointer before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/50 before:to-black/60 before:z-[1] after:content-[''] after:absolute after:inset-0 after:bg-[url('data:image/svg+xml,<svg_width=%22100%22_height=%22100%22_xmlns=%22http://www.w3.org/2000/svg%22><defs><pattern_id=%22grid%22_width=%22100%22_height=%22100%22_patternUnits=%22userSpaceOnUse%22><path_d=%22M_100_0_L_0_0_0_100%22_fill=%22none%22_stroke=%22rgba(255,255,255,0.1)%22_stroke-width=%221%22/></pattern></defs><rect_width=%22100%%22_height=%22100%%22_fill=%22url(%23grid)%22/></svg>')] after:opacity-20 after:animate-[gridMove_20s_linear_infinite] after:z-[1]"
        onClick={handleImageToggle}
      >
        {/* Background image layers for smooth fade transition */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[800ms] ease-in-out z-0 ${isImage1 ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${image1.src})` }}
        ></div>
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[800ms] ease-in-out z-0 ${!isImage1 ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${image2.src})` }}
        ></div>
        <div className="max-w-[1200px] my-[50px] mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-24 items-center relative z-[2] max-lg:grid-cols-1 max-lg:text-center max-lg:gap-12">
          <div className="text-white">
            <h1 className="text-[4rem] font-extrabold leading-[1.2] mb-6 flex flex-col max-md:text-[3rem] max-sm:text-[2.5rem]">
              <span className="block opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards]" style={{ animationDelay: '0.1s' }}>
                Festalytics
              </span>
              <span className="block opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards] bg-gradient-to-tr from-[#f093fb] to-[#D6336C] bg-clip-text text-transparent" style={{ animationDelay: '0.3s' }}>
                AI-Powered Event Manager
              </span>
            </h1>
            <p className="text-xl leading-[1.6] mb-12 opacity-90 w-full max-w-[500px] break-words ml-auto mr-auto lg:ml-0 opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards] max-sm:text-lg" style={{ animationDelay: '0.5s' }}>
              Create unforgettable events with smart planning, AI-powered recommendations, and seamless vendor management
            </p>
            <div className="flex gap-4 flex-wrap opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards] max-sm:flex-row max-sm:w-full max-sm:justify-center" style={{ animationDelay: '0.7s' }}>
              <button
                className="py-3.5 px-8 border-none rounded-[50px] text-base font-semibold cursor-pointer transition-all duration-300 no-underline inline-block bg-white text-[#667eea] shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[#C2255C] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(214,51,108,0.4)] active:bg-[#C2255C] active:text-white active:shadow-[0_6px_20px_rgba(214,51,108,0.4)] active:-translate-y-0.5 max-sm:w-1/2 max-sm:flex-none"
                onClick={(e) => {
                  e.stopPropagation()
                  onLoginClick()
                }}
              >
                Login
              </button>
              <button
                className="py-3.5 px-8 rounded-[50px] text-base font-semibold cursor-pointer transition-all duration-300 no-underline inline-block bg-transparent text-white border-2 border-white md:hover:bg-[#C2255C] md:hover:text-white md:hover:border-[#C2255C] md:hover:-translate-y-0.5 active:bg-[#C2255C] active:text-white active:border-[#C2255C] active:-translate-y-0.5 max-sm:w-1/2 max-sm:flex-none"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/signup')
                }}
              >
                Signup
              </button>
            </div>
          </div>
          <div className="relative min-h-[300px] flex items-center justify-center gap-6 flex-wrap w-full opacity-0 animate-[fadeIn_1s_ease_forwards] max-md:h-[300px] max-md:mt-8" style={{ animationDelay: '0.9s' }}>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/20 rounded-[20px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-center animate-[float_6s_ease-in-out_infinite] transition-all duration-300 cursor-pointer md:hover:bg-gradient-to-tr md:hover:from-[#f093fb] md:hover:to-[#D6336C] md:hover:shadow-[0_15px_50px_rgba(214,51,108,0.4)] md:hover:scale-105 active:bg-gradient-to-tr active:from-[#f093fb] active:to-[#D6336C] active:shadow-[0_15px_50px_rgba(214,51,108,0.4)] active:scale-105 group w-[130px] [animation-delay:0s] max-md:p-6">
              <div className="text-[2rem] mb-2 flex items-center justify-center text-white transition-colors duration-300 md:group-hover:text-white group-active:text-white max-md:text-[2rem]">
                <FaBolt />
              </div>
              <h3 className="m-0 text-white text-base font-semibold transition-colors duration-300 shadow-sm md:group-hover:text-white group-active:text-white">Fast</h3>
            </div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/20 rounded-[20px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-center animate-[float_6s_ease-in-out_infinite] transition-all duration-300 cursor-pointer md:hover:bg-gradient-to-tr md:hover:from-[#f093fb] md:hover:to-[#D6336C] md:hover:shadow-[0_15px_50px_rgba(214,51,108,0.4)] md:hover:scale-105 active:bg-gradient-to-tr active:from-[#f093fb] active:to-[#D6336C] active:shadow-[0_15px_50px_rgba(214,51,108,0.4)] active:scale-105 group w-[130px] [animation-delay:2s] max-md:p-6">
              <div className="text-[2rem] mb-2 flex items-center justify-center text-white transition-colors duration-300 md:group-hover:text-white group-active:text-white max-md:text-[2rem]">
                <FaRocket />
              </div>
              <h3 className="m-0 text-white text-base font-semibold transition-colors duration-300 shadow-sm md:group-hover:text-white group-active:text-white">Powerful</h3>
            </div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/20 rounded-[20px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-center animate-[float_6s_ease-in-out_infinite] transition-all duration-300 cursor-pointer md:hover:bg-gradient-to-tr md:hover:from-[#f093fb] md:hover:to-[#D6336C] md:hover:shadow-[0_15px_50px_rgba(214,51,108,0.4)] md:hover:scale-105 active:bg-gradient-to-tr active:from-[#f093fb] active:to-[#D6336C] active:shadow-[0_15px_50px_rgba(214,51,108,0.4)] active:scale-105 group w-[130px] [animation-delay:4s] max-md:p-6">
              <div className="text-[2rem] mb-2 flex items-center justify-center text-white transition-colors duration-300 md:group-hover:text-white group-active:text-white max-md:text-[2rem]">
                <FaStar />
              </div>
              <h3 className="m-0 text-white text-base font-semibold transition-colors duration-300 shadow-sm md:group-hover:text-white group-active:text-white">Modern</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 bg-[#f8f9fa]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-center text-[3rem] font-bold mb-12 text-[#1a202c] opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards] max-md:text-[2.5rem] max-sm:text-[2rem]">Why Choose Us</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-16 max-sm:grid-cols-1">
            <div className="bg-white p-10 rounded-[20px] text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 md:hover:-translate-y-2.5 md:hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:-translate-y-2.5 active:shadow-[0_10px_30px_rgba(0,0,0,0.15)] opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards]" style={{ animationDelay: '0.1s' }}>
              <div className="text-[3.5rem] mb-4 flex items-center justify-center text-[#D6336C]">
                <FaLightbulb />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#1a202c]">Smart Recommendations</h3>
              <p className="text-[#718096] leading-relaxed">Get AI-powered suggestions for venues, décor, and services that perfectly match your event style.</p>
            </div>
            <div className="bg-white p-10 rounded-[20px] text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 md:hover:-translate-y-2.5 md:hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:-translate-y-2.5 active:shadow-[0_10px_30px_rgba(0,0,0,0.15)] opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards]" style={{ animationDelay: '0.2s' }}>
              <div className="text-[3.5rem] mb-4 flex items-center justify-center text-[#D6336C]">
                <FaCalendarCheck />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#1a202c]">Seamless Booking</h3>
              <p className="text-[#718096] leading-relaxed">Manage vendors, confirm bookings, and track your event plan all in one place.</p>
            </div>
            <div className="bg-white p-10 rounded-[20px] text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 md:hover:-translate-y-2.5 md:hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:-translate-y-2.5 active:shadow-[0_10px_30px_rgba(0,0,0,0.15)] opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards]" style={{ animationDelay: '0.3s' }}>
              <div className="text-[3.5rem] mb-4 flex items-center justify-center text-[#D6336C]">
                <FaChartLine />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#1a202c]">Cost Efficiency</h3>
              <p className="text-[#718096] leading-relaxed">Automatically calculate costs and optimize your budget with our intelligent tools.</p>
            </div>
            <div className="bg-white p-10 rounded-[20px] text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 md:hover:-translate-y-2.5 md:hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:-translate-y-2.5 active:shadow-[0_10px_30px_rgba(0,0,0,0.15)] opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards]" style={{ animationDelay: '0.4s' }}>
              <div className="text-[3.5rem] mb-4 flex items-center justify-center text-[#D6336C]">
                <FaUserCog />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#1a202c]">Personalized Experience</h3>
              <p className="text-[#718096] leading-relaxed">Create events tailored to your preferences with AI insights and interactive planning features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 bg-gradient-to-br from-[#581c87] to-[#4c1d95] relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-black/40 before:z-[1]">
        <div className="max-w-[800px] mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl py-16 px-12 text-center relative z-[2] opacity-0 translate-y-[30px] animate-[fadeInUp_0.8s_ease_forwards] max-md:p-8 max-sm:p-6">
          <h2 className="text-[3.5rem] font-extrabold mb-4 text-white leading-[1.2] max-md:text-[2.5rem] max-sm:text-[2rem]">Ready to Get Started?</h2>
          <p className="text-xl mb-10 text-gray-200/90 leading-relaxed max-md:text-lg max-sm:text-base">Join thousands of satisfied customers today</p>
          <button className="py-4.5 px-10 bg-[#D6336C] text-white border-none rounded-[50px] text-lg font-semibold cursor-pointer transition-all duration-300 inline-flex items-center gap-3 shadow-[0_4px_15px_rgba(214,51,108,0.4)] group md:hover:bg-[#C2255C] md:hover:-translate-y-0.5 md:hover:shadow-[0_6px_20px_rgba(214,51,108,0.6)] active:bg-[#C2255C] active:-translate-y-0.5 active:shadow-[0_6px_20px_rgba(214,51,108,0.6)] max-sm:py-4 max-sm:px-8 max-sm:text-base">
            Start Your Journey
            <FaArrowRight className="transition-transform duration-300 md:group-hover:translate-x-1 group-active:translate-x-1" />
          </button>
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="flex gap-1 text-[#fbbf24] text-xl">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </div>
            <p className="text-gray-200/80 text-sm m-0 font-medium">Trusted by 500+ Event Planners</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage

