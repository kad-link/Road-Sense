import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Settings as SettingsIcon, Bell, Volume2, Shield, Eye, Sliders, CheckCircle2 } from 'lucide-react';

function Settings() {
  const [sensitivity, setSensitivity] = useState(() => {
    return localStorage.getItem('roadsense_sensitivity') || 'standard';
  });
  const [audioAlerts, setAudioAlerts] = useState(() => {
    const saved = localStorage.getItem('roadsense_audio_alerts');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [units, setUnits] = useState(() => {
    return localStorage.getItem('roadsense_units') || 'metric';
  });
  const [autoLog, setAutoLog] = useState(() => {
    const saved = localStorage.getItem('roadsense_autolog');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('roadsense_sensitivity', sensitivity);
    localStorage.setItem('roadsense_audio_alerts', JSON.stringify(audioAlerts));
    localStorage.setItem('roadsense_units', units);
    localStorage.setItem('roadsense_autolog', JSON.stringify(autoLog));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="pb-6 mb-8 border-b border-zinc-800/80">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            System Preferences
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Configure optical sensor sensitivity, audible warnings, and telemetry logging
          </p>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Preferences updated successfully.</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Fatigue Sensor Sensitivity */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-semibold text-white">Vision Sensor Calibration</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Threshold duration before triggering sustained fatigue alarms
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'high', label: 'High Vigilance', desc: 'Alert after 1.5s eye closure' },
                { id: 'standard', label: 'Standard (Recommended)', desc: 'Alert after 2.0s eye closure' },
                { id: 'low', label: 'Highway Relaxed', desc: 'Alert after 3.0s eye closure' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSensitivity(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    sensitivity === opt.id
                      ? 'bg-zinc-100 text-zinc-950 border-white'
                      : 'bg-zinc-950/60 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className={`text-[11px] mt-1 ${sensitivity === opt.id ? 'text-zinc-700' : 'text-zinc-500'}`}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Alarm Configuration */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-semibold text-white">Audible Fatigue Alarm</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Play high-frequency auditory pulse when micro-sleep threshold is exceeded
                </p>
              </div>
            </div>

            <button
              onClick={() => setAudioAlerts(!audioAlerts)}
              className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative p-1 ${
                audioAlerts ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  audioAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Telemetry Unit System */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-zinc-300" />
              <div>
                <h3 className="text-base font-semibold text-white">Distance Unit Standard</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Metric (kilometers) or Imperial (miles) calculation
                </p>
              </div>
            </div>

            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setUnits('metric')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  units === 'metric' ? 'bg-zinc-100 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Kilometers (km)
              </button>
              <button
                onClick={() => setUnits('imperial')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  units === 'imperial' ? 'bg-zinc-100 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Miles (mi)
              </button>
            </div>
          </div>

          {/* Automatic Route Archiving */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-semibold text-white">Automatic Trip Archiving</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Automatically save Google Maps route computations to journey history
                </p>
              </div>
            </div>

            <button
              onClick={() => setAutoLog(!autoLog)}
              className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative p-1 ${
                autoLog ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoLog ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-md cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;