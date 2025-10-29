import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Logo, SunIcon, MoonIcon, LogoutIcon } from './Icons';

function Navbar({ navigate, currentView }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'doctors', label: 'Book Appointment' },
    { id: 'my-appointments', label: 'My Appointments' },
    { id: 'my-records', label: 'My Records' },
    { id: 'profile', label: 'My Profile' },
  ];

  return (
    /* --- THIS IS THE FIX ---
      1. Removed the old 'bg-white dark:bg-slate-800' and 'shadow-md'.
      2. Added our new 'card-glassmorphism' class.
    */
    <nav className="card-glassmorphism sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
            <Logo />
            <span className="font-bold text-xl text-slate-800 dark:text-white">OPD Nexus</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => navigate(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item.id 
                  ? 'bg-black/10 dark:bg-white/10 text-indigo-700 dark:text-white' // Adapted for glass UI
                  : 'text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={logout} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400" title="Logout">
              <LogoutIcon />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md text-slate-500 dark:text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        // --- UI FIX: Added glassmorphism to mobile menu ---
        <div className="md:hidden w-full card-glassmorphism shadow-lg z-10 absolute">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => { navigate(item.id); setMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  currentView === item.id 
                  ? 'bg-black/10 dark:bg-white/10 text-indigo-700 dark:text-white' 
                  : 'text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => { logout(); setMenuOpen(false); }} 
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
export default Navbar;

