import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Navigation, 
  FileText, 
  Activity, 
  ArrowRight, 
  Car, 
  Clock, 
  Award,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { BACKEND_URL } from '../utils/apiConfig';
import StatsCard from '../components/StatsCard';

function Dashboard() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();

  const [scores, setScores] = useState([]);
  const [trips, setTrips] = useState([]);
  const [docs, setDocs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setDataLoading(true);
      try {
        const [scoresRes, tripsRes, docsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/score/${user.email}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null),
          fetch(`${BACKEND_URL}/trip/${user.email}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null),
          fetch(`${BACKEND_URL}/docs/${user.email}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null),
        ]);

        if (scoresRes?.ok) {
          const sData = await scoresRes.json();
          if (sData.success) setScores(sData.scores || []);
        }

        if (tripsRes?.ok) {
          const tData = await tripsRes.json();
          if (tData.success) setTrips(tData.trips || []);
        }

        if (docsRes?.ok) {
          const dData = await docsRes.json();
          if (dData.success) setDocs(dData.documents || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token, loading, navigate]);

  const latestScore = scores.length > 0 ? Number(scores[0].score) : null;
  const totalDistance = trips.reduce((sum, trip) => {
    if (!trip.distance) return sum;
    const cleaned = String(trip.distance).replace(/,/g, '');
    const val = parseFloat(cleaned);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Driver Command Center
              </h1>
              {user?.carModel && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <Car className="w-3.5 h-3.5 text-zinc-400" />
                  {user.carModel}
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              Active profile overview for {user?.fullName || 'Driver'} • Telematics & vehicle readiness
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/safety">
              <button className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-md flex items-center gap-2 cursor-pointer">
                <Shield className="w-4 h-4" />
                <span>Start Safety Session</span>
              </button>
            </NavLink>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Latest Safety Score" 
            info={latestScore !== null ? `${latestScore.toFixed(1)}%` : '--'} 
            subtitle={latestScore !== null ? (latestScore >= 90 ? 'Optimal Attentiveness' : 'Improvement Recommended') : 'No trips monitored yet'}
            icon={Award}
          />
          <StatsCard 
            title="Total Routes" 
            info={trips.length} 
            subtitle="Logged Google Maps routes"
            icon={Compass}
          />
          <StatsCard 
            title="Accumulated Traversed" 
            info={`${totalDistance.toFixed(1)} km`} 
            subtitle="Across recorded journeys"
            icon={Navigation}
          />
          <StatsCard 
            title="Glovebox Documents" 
            info={docs.length} 
            subtitle="Encrypted vehicle papers"
            icon={FileText}
          />
        </div>

        {/* Dual Column Telemetry Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Recent Safety Scores */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">Recent Safety Audits</h3>
                </div>
                <NavLink to="/safety" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium">
                  <span>Monitor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>

              {dataLoading ? (
                <div className="py-12 text-center text-xs text-zinc-500">Loading audit history...</div>
              ) : scores.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  No safety sessions recorded. Start your camera monitor to track attentiveness.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {scores.slice(0, 4).map((sc, idx) => (
                    <div
                      key={sc._id || idx}
                      className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 block">{sc.date}</span>
                        <span className="text-base font-bold font-mono text-zinc-100">{Number(sc.score).toFixed(1)}%</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        Number(sc.score) >= 90 ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' :
                        Number(sc.score) >= 75 ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                        'bg-rose-950/60 text-rose-300 border-rose-800'
                      }`}>
                        {Number(sc.score) >= 90 ? 'Optimal' : Number(sc.score) >= 75 ? 'Moderate' : 'Risk'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800 text-right">
              <NavLink to="/safety" className="text-xs font-semibold text-zinc-300 hover:text-white">
                Open Safety Console →
              </NavLink>
            </div>
          </div>

          {/* Recent Recorded Journeys */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <Navigation className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-semibold text-white">Recent Journeys</h3>
                </div>
                <NavLink to="/trips" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium">
                  <span>All Trips</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>

              {dataLoading ? (
                <div className="py-12 text-center text-xs text-zinc-500">Loading trips...</div>
              ) : trips.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  No journeys logged. Use Navigate to plan a route.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {trips.slice(0, 4).map((tr, idx) => (
                    <div
                      key={tr._id || idx}
                      className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-[240px]">
                        <span className="text-[10px] font-mono text-zinc-500 block">{tr.date}</span>
                        <p className="font-medium text-white truncate">{tr.destination}</p>
                        <p className="text-[11px] text-zinc-500 truncate">From: {tr.source}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-semibold text-zinc-200 block">{tr.distance}</span>
                        <span className="text-[11px] text-zinc-500">{tr.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800 text-right">
              <NavLink to="/trips" className="text-xs font-semibold text-zinc-300 hover:text-white">
                View All Trips →
              </NavLink>
            </div>
          </div>

        </div>

        {/* Glovebox Quick Status */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Digital Glovebox Readiness</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {docs.length > 0 
                  ? `${docs.length} vehicle documents secured in encrypted cloud storage`
                  : 'No vehicle papers uploaded. Secure your RC and Insurance now'}
              </p>
            </div>
          </div>

          <NavLink to="/docs">
            <button className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all cursor-pointer">
              Manage Documents
            </button>
          </NavLink>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;