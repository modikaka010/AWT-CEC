// Turns "/uploads/consultations/x.jpg" into a full URL.
// VITE_API_BASE_URL e.g. "http://localhost:5000/api" → origin "http://localhost:5000".
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
const origin = /^https?:\/\//i.test(apiBase) ? apiBase.replace(/\/api\/?$/, '') : '';

export const assetUrl = (p) => (!p ? '' : /^https?:\/\//i.test(p) ? p : `${origin}${p}`);