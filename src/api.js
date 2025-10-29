import { jwtDecode } from 'jwt-decode';

// --- THIS IS THE FIX ---
// We add the 'export' keyword so other files can import this constant.
export const API_URL = 'https://patient-dashboard-dphd.onrender.com'; // Use your Patient API URL

const getAuthToken = () => localStorage.getItem('appToken');

export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
    
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('appToken');
        window.location.reload();
        throw new Error('Session expired.');
    }
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An API error occurred.');
    }
    if (response.status === 204) { return; }
    return response.json();
};

