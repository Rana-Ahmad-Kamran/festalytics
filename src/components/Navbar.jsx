'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    // Initial check
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav 
      className="sticky top-0 z-50 w-full transition-all duration-300 transform animate-[slideDown_0.5s_ease]"
      style={{ 
        height: '68px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(214, 51, 108, 0.1)',
        boxShadow: scrolled ? '0 4px 30px rgba(214, 51, 108, 0.15)' : '0 2px 20px rgba(214, 51, 108, 0.08)'
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background-color: #D6336C;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after, .nav-link.active::after {
          width: 100%;
        }
      `}</style>
      
      <div className="max-w-[1200px] mx-auto h-full flex justify-between items-center px-6 md:px-8">
        
        {/* LOGO */}
        <Link 
          href="/" 
          className="flex items-center gap-2 no-underline transition-transform duration-300 hover:scale-[1.02] group" 
          onClick={closeMenu}
        >
          <span className="font-bold text-[20px] bg-gradient-to-br from-[#D6336C] to-[#ff6eb4] text-transparent bg-clip-text">
            Festalytics
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-2">
          <ul className="flex list-none m-0 p-0 gap-2 items-center">
            {navLinks.map((link) => {
              // Active state considers precise match, or if home page then matches exact '/'
              const isActive = pathname === link.href || (pathname === null && link.href === '/');
              return (
                <li key={link.name} className="m-0">
                  <Link
                    href={link.href}
                    className={`nav-link block px-4 py-2 text-[15px] transition-colors duration-300 ${
                      isActive ? 'text-[#D6336C] font-semibold active' : 'text-[#374151] font-medium hover:text-[#D6336C]'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              )
            })}
          </ul>
          
          {/* CTA BUTTON */}
          <button 
            onClick={() => router.push('/signup')}
            className="ml-4 bg-gradient-to-r from-[#D6336C] to-[#ff6eb4] text-white px-5 py-2 rounded-full font-semibold text-[14px] shadow-[0_4px_15px_rgba(214,51,108,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(214,51,108,0.4)]"
          >
            Get Started
          </button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="md:hidden flex items-center justify-center bg-transparent border-none p-2 cursor-pointer text-[#D6336C]"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div 
        className={`md:hidden absolute top-[68px] left-0 w-full bg-white overflow-hidden transition-all duration-300 ease-in-out shadow-lg ${
          isMenuOpen ? 'max-h-[300px] opacity-100 border-b border-gray-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col list-none m-0 p-4 gap-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname === null && link.href === '/');
            return (
              <li key={link.name} className="m-0 border-b border-[#f0f0f0] last:border-none">
                <Link
                  href={link.href}
                  className={`block px-4 py-3 text-[15px] transition-colors duration-300 ${
                    isActive ? 'text-[#D6336C] font-semibold' : 'text-[#374151] font-medium'
                  }`}
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              </li>
            )
          })}
          <li className="mt-4 px-4 pb-2">
            <button 
              onClick={() => {
                closeMenu();
                router.push('/signup');
              }}
              className="w-full bg-gradient-to-r from-[#D6336C] to-[#ff6eb4] text-white px-5 py-3 rounded-full font-semibold text-[14px] shadow-[0_4px_15px_rgba(214,51,108,0.3)] transition-transform hover:scale-105"
            >
              Get Started
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar