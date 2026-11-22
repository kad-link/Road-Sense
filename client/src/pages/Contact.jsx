import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from '../utils/apiConfig';

export default function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitStatus('');

    const payload = {
      name: user?.fullName || formData.name,
      email: user?.email || formData.email,
      subject: formData.subject,
      message: formData.message
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/send-email`, {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('Thank you for reaching out. Our safety team will respond shortly.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitStatus(''), 6000);
      } else {
        setError(data.message || 'Failed to dispatch email. Please try again.');
      }
    } catch (err) {
      setError('Network communication failed. Please check your backend connection.');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2">
            Support & Inquiries
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            Get in Touch
          </h1>
          <p className="text-zinc-400 text-sm mt-3">
            Have questions about RoadSense vision integration, vehicle telematics, or academic collaboration?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Contact Channels</h2>

              <div className="space-y-6 text-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Location</h3>
                    <p className="text-zinc-400 mt-1 leading-relaxed">
                      Indian Institute of Information Technology (IIIT Lucknow)<br />
                      Ahmamau, Lucknow, Uttar Pradesh 226002
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Phone</h3>
                    <p className="text-zinc-400 mt-1 font-mono">+91 7989168219</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Direct Email</h3>
                    <p className="text-zinc-400 mt-1 font-mono">lit2024002@iiitl.ac.in</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono">
              RoadSense Core Engineering • Lucknow, India
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Send an Inquiry</h2>

            {submitStatus && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{submitStatus}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={user?.fullName || formData.name}
                    onChange={handleInputChange}
                    disabled={Boolean(user?.fullName)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={user?.email || formData.email}
                    onChange={handleInputChange}
                    disabled={Boolean(user?.email)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Inquiry topic"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Message Content *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your inquiry, bug report, or telemetry feedback..."
                  rows="4"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Transmitting...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}