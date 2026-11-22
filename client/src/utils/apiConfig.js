/**
 * Global API and Service Endpoints configuration
 * Provides production Render/Vercel fallback URLs so the app never fails on undefined env vars.
 */
const rawBackend = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 'https://roadsense-powered-by-carplay.onrender.com';
export const BACKEND_URL = rawBackend.replace(/\/+$/, '');

const rawDetection = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DETECTION_API_URL) || 'http://localhost:8800';
export const DETECTION_URL = rawDetection.replace(/\/+$/, '');
