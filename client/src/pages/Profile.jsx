import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Car, Shield, Calendar, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="pb-6 mb-8 border-b border-zinc-800/80">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Driver Profile
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Personal identity, vehicle registrations, and account security
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-zinc-800">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 text-white font-bold text-3xl flex items-center justify-center shadow-xl font-mono">
              {user?.fullName?.charAt(0).toUpperCase() || 'D'}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {user?.fullName || 'Verified Driver'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Account
                </span>
              </div>
              <p className="text-zinc-400 text-sm mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-b border-zinc-800">
            <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">
                Full Legal Name
              </span>
              <p className="text-base font-semibold text-white">
                {user?.fullName || 'Not specified'}
              </p>
            </div>

            <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">
                Registered Email
              </span>
              <p className="text-base font-semibold text-white">
                {user?.email || 'Not specified'}
              </p>
            </div>

            <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">
                Primary Vehicle Model
              </span>
              <p className="text-base font-semibold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-zinc-400" />
                {user?.carModel || 'Standard Vehicle'}
              </p>
            </div>

            <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">
                Auth Provider
              </span>
              <p className="text-base font-semibold text-white capitalize">
                {user?.authProvider || 'Email / Credentials'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex justify-between items-center">
            <span className="text-xs text-zinc-500 font-mono">
              RoadSense Driver Identity Module
            </span>

            <button
              onClick={handleSignOut}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of RoadSense</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;