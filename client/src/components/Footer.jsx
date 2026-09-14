import React from 'react';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/80 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-950 font-black text-xs font-mono flex items-center justify-center">
                RS
              </div>
              <span className="font-semibold text-base tracking-tight text-white">
                ROADSENSE
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Real-time driver fatigue monitoring, automated trip telematics, and encrypted vehicle document organization.
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">
              Designed & Developed at IIIT Lucknow
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <NavLink to="/" className="hover:text-white transition-colors">
                  Home Overview
                </NavLink>
              </li>
              <li>
                <NavLink to="/safety" className="hover:text-white transition-colors">
                  Driver Safety Console
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="hover:text-white transition-colors">
                  Driver Command Center
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="hover:text-white transition-colors">
                  About the Platform
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Services & Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3 font-mono">
              Capabilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <NavLink to="/safety" className="hover:text-white transition-colors">
                  Active Vision Fatigue Tracking
                </NavLink>
              </li>
              <li>
                <NavLink to="/nav-maps" className="hover:text-white transition-colors">
                  Google Maps Routing
                </NavLink>
              </li>
              <li>
                <NavLink to="/trips" className="hover:text-white transition-colors">
                  Archived Journey Telematics
                </NavLink>
              </li>
              <li>
                <NavLink to="/docs" className="hover:text-white transition-colors">
                  Encrypted Digital Glovebox
                </NavLink>
              </li>
              <li>
                <a
                  href="https://echallan.parivahan.gov.in/index/accused-challan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Parivahan E-Challan Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3 font-mono">
              Campus Headquarters
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                <span>IIIT Lucknow, Ahmamau, Uttar Pradesh 226002</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="font-mono">+91 7989168219</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="font-mono">lit2024002@iiitl.ac.in</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} RoadSense Telematics. Open for Academic & Road Safety Research.</p>
          <div className="flex space-x-6 mt-3 sm:mt-0 font-mono">
            <span>Safety First</span>
            <span>•</span>
            <span>Zero Driver Fatigue</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;