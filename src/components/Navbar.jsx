import { useState } from 'react'
import festalyticsLogo from '../assets/festalytics-logo.png'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] sticky top-0 z-[1000] p-0" role="navigation" aria-label="Main navigation">
      {/* UPDATE: py-4 ko py-2 kar diya hai height kam karne ke liye */}
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-8 py-1 relative md:px-6">
        <div className="flex items-center">
          <a href="/" className="flex items-center no-underline transition-opacity duration-300 hover:opacity-80" aria-label="Home">
            <img
              src={festalyticsLogo.src}
              alt="Festalytics"
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>

        <button
          className={`flex md:hidden flex-col justify-around w-[30px] h-[30px] bg-transparent border-none cursor-pointer p-0 z-[1001] transition-transform duration-300 focus:outline focus:outline-2 focus:outline-[#D6336C] focus:outline-offset-2 ${isMenuOpen ? '' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="navbar-menu"
        >
          <span className={`w-full h-[3px] bg-gray-700 rounded-[3px] transition-all duration-300 origin-center ${isMenuOpen ? 'rotate-45 translate-x-[8px] translate-y-[8px]' : ''}`}></span>
          <span className={`w-full h-[3px] bg-gray-700 rounded-[3px] transition-all duration-300 origin-center ${isMenuOpen ? 'opacity-0 -translate-x-5' : ''}`}></span>
          <span className={`w-full h-[3px] bg-gray-700 rounded-[3px] transition-all duration-300 origin-center ${isMenuOpen ? '-rotate-45 translate-x-[7px] -translate-y-[7px]' : ''}`}></span>
        </button>

        <ul
          className={`flex list-none m-0 p-0 gap-8 items-center transition-all duration-300 md:flex-row md:static md:w-auto md:h-auto md:bg-transparent md:shadow-none md:visible md:opacity-100 md:translate-x-0
            ${isMenuOpen
              ? 'translate-x-0 opacity-100 visible fixed top-[56px] left-0 right-0 flex-col bg-white shadow-md py-6 gap-0 max-h-[calc(100vh-56px)] overflow-y-auto w-full'
              : 'fixed top-[56px] left-0 right-0 flex-col bg-white shadow-md py-6 gap-0 -translate-x-full opacity-0 invisible max-h-[calc(100vh-56px)] overflow-y-auto w-full md:flex'
            }`}
          id="navbar-menu"
        >
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <li key={item} className="m-0 w-full md:w-auto border-b border-gray-200 md:border-none last:border-none">
              <a
                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="text-gray-700 no-underline font-medium transition-colors duration-300 px-6 py-4 md:px-4 md:py-2 block rounded text-lg md:text-base leading-relaxed hover:text-[#D6336C] hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#D6336C] focus:outline focus:outline-2 focus:outline-[#D6336C] focus:outline-offset-2 w-full text-left md:w-auto"
                onClick={closeMenu}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar