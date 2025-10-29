import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://127.0.0.1:8000';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const getUserFromToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return {
            email: decoded.sub,
            userId: decoded.user_id,
            fullName: decoded.full_name,
        };
    } catch (e) { return null; }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('appToken'));
    const [user, setUser] = useState(() => getUserFromToken(localStorage.getItem('appToken')));

    const handleAuthSuccess = (newToken) => {
        setToken(newToken);
        localStorage.setItem('appToken', newToken);
        setUser(getUserFromToken(newToken));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('appToken');
    };

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Login failed.');
        handleAuthSuccess(data.access_token);
    };

    const register = async (fullName, email, password) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Registration failed.');
        handleAuthSuccess(data.access_token);
    };

    const googleLogin = async (idToken) => {
        const response = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Google login failed.');
        handleAuthSuccess(data.access_token);
    };
    
    const value = { isAuthenticated: !!user, user, token, logout, login, register, googleLogin };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
