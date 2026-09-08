// Vite exposes any env var prefixed VITE_ on import.meta.env at build time.
// Falls back to the backend's default local dev port so this works with
// zero config as long as mag-be is running on http://localhost:3000.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
