import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Compass, 
  FileText, 
  Map, 
  User, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const baseNavLinks = [
    { name: 'Safety', path: '/safety' },
    { name: 'Trips', path: '/trips' },
    { name: 'Documents', path: '/docs' },
    { name: 'Navigate', path: '/nav-maps' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const navLinks = isAuthenticated
    ? [{ name: 'Dashboard', path: '/dashboard' }, ...baseNavLinks]
    : baseNavLinks;

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-16 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 font-black text-sm font-mono flex items-center justify-center shadow group-hover:bg-white transition-colors">
              RS
            </div>
            <span className="font-semibold text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              ROADSENSE
            </span>
          </NavLink>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-400">
            {location.pathname === '/' && (
              <a
                href="#services"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-900/60 transition-colors"
              >
                Services
              </a>
            )}
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-white bg-zinc-900 font-semibold border border-zinc-800'
                      : 'hover:text-white hover:bg-zinc-900/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NavLink to="/login">
                  <button className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer">
                    Sign In
                  </button>
                </NavLink>
                <NavLink to="/register">
                  <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-sm cursor-pointer">
                    Get Started
                  </button>
                </NavLink>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 font-bold text-xs flex items-center justify-center font-mono">
                      {user?.fullName?.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-zinc-100 leading-none">
                      {user?.fullName || 'Driver'}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate max-w-[120px] mt-0.5 font-mono">
                      {user?.carModel || user?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-zinc-800">
                      <p className="font-semibold text-white truncate">{user?.fullName}</p>
                      <p className="text-zinc-500 text-[11px] truncate">{user?.email}</p>
                      {user?.carModel && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                          {user?.carModel}
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/dashboard');
                        }}
                        className="w-full px-4 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/profile');
                        }}
                        className="w-full px-4 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        <span>Driver Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/settings');
                        }}
                        className="w-full px-4 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <SettingsIcon className="w-4 h-4 text-zinc-400" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-zinc-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-900"
              >
                {link.name}
              </NavLink>
            ))}
            {!isAuthenticated ? (
              <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
                <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900">
                    Sign In
                  </button>
                </NavLink>
                <NavLink to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 rounded-lg text-xs font-semibold bg-white text-zinc-950">
                    Get Started
                  </button>
                </NavLink>
              </div>
            ) : (
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-zinc-300"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-zinc-300"
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-zinc-300"
                >
                  Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-rose-400"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Spacer for sticky header */}
      <div className="h-16" />
    </>
  );
}

export default Navbar;
