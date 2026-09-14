import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import InfoCard from '../components/InfoCard';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation, Clock, Search, ArrowLeft, Route } from 'lucide-react';

function Trips() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [webloading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/trip/${user.email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrips(data.trips || []);
        }
      })
      .catch(error => {
        console.error('Error fetching trips:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, loading, navigate, token]);

  const totalTrips = trips.length;

  const totalDistance = trips.reduce((sum, trip) => {
    if (!trip.distance) return sum;
    const cleanedDistance = String(trip.distance).replace(/,/g, '');
    const distanceValue = parseFloat(cleanedDistance);
    return sum + (isNaN(distanceValue) ? 0 : distanceValue);
  }, 0);

  const totalDurationMins = trips.reduce((sum, trip) => {
    if (!trip.duration) return sum;
    const durationStr = trip.duration.toLowerCase();
    let minutes = 0;

    const dayMatch = durationStr.match(/(\d+)\s*day/);
    const hourMatch = durationStr.match(/(\d+)\s*(?:hour|hr|h)s?/);
    const minMatch = durationStr.match(/(\d+)\s*(?:min|m)s?/);

    if (dayMatch) minutes += parseInt(dayMatch[1], 10) * 24 * 60;
    if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
    if (minMatch) minutes += parseInt(minMatch[1], 10);

    return sum + minutes;
  }, 0);

  const days = Math.floor(totalDurationMins / (24 * 60));
  const hours = Math.floor((totalDurationMins % (24 * 60)) / 60);
  const mins = totalDurationMins % 60;

  let formattedDuration = '';
  if (days > 0) formattedDuration += `${days}d `;
  if (hours > 0) formattedDuration += `${hours}h `;
  if (mins > 0 || formattedDuration === '') formattedDuration += `${mins}m`;
  formattedDuration = formattedDuration.trim();

  const filteredTrips = trips.filter(trip => 
    trip.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-800/80">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Trip History & Telematics
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Archived Google Maps journeys and distance telemetry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/nav-maps">
              <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-sm cursor-pointer flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5" />
                <span>New Navigation</span>
              </button>
            </NavLink>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatsCard 
            title="Total Journeys" 
            info={totalTrips} 
            subtitle="Logged from Google Directions" 
            icon={Route} 
          />
          <StatsCard 
            title="Accumulated Distance" 
            info={`${totalDistance.toFixed(1)} km`} 
            subtitle="Total kilometers traversed" 
            icon={Navigation} 
          />
          <StatsCard 
            title="Monitored Duration" 
            info={formattedDuration} 
            subtitle="Total wheel time logged" 
            icon={Clock} 
          />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by city, origin, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans"
            />
          </div>
        </div>

        {/* Trips Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Recorded Routes ({filteredTrips.length})
            </h2>
          </div>

          {webloading ? (
            <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-400 text-sm">
              Loading trip telemetry...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-400 max-w-md mx-auto">
              <Route className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
              <h3 className="text-base font-semibold text-zinc-200">No trips recorded yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto mb-6">
                Calculate routes using the navigation map to automatically record trip logs.
              </p>
              <NavLink to="/nav-maps">
                <button className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all cursor-pointer">
                  Open Maps
                </button>
              </NavLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip, index) => (
                <InfoCard
                  key={trip._id || index}
                  source={trip.source}
                  destination={trip.destination}
                  distance={trip.distance}
                  duration={trip.duration}
                  date={trip.date}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Trips;