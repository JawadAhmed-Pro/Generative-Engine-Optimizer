import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

// Prioritize environment variable, fallback to production URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.geo-tool.site';
const NETWORK_TIMEOUT = 30000; // Increased to 30s to handle backend cold-starts/Render spin-up

export function AuthProvider({ children }) {
    // UI AUDIT BYPASS: Constant mock user
    const mockUser = { id: 1, email: 'audit_user@example.com', name: 'Audit User' };
    const [user, setUser] = useState(mockUser);
    const [token, setToken] = useState('audit_token');
    const [loading, setLoading] = useState(false);

    // checkAuth disabled for UI Audit
    useEffect(() => {
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            localStorage.setItem('geo_token', data.access_token);
            setToken(data.access_token);
            setUser(data.user);

            return { success: true };
        } catch (error) {
            if (error.name === 'AbortError') {
                return { success: false, error: 'Login timed out. Please try again.' };
            }
            return { success: false, error: error.message };
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const register = async (email, password, name) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name }),
                signal: controller.signal
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Registration failed');
            }

            localStorage.setItem('geo_token', data.access_token);
            setToken(data.access_token);
            setUser(data.user);

            return { success: true };
        } catch (error) {
            if (error.name === 'AbortError') {
                return { success: false, error: 'Registration timed out. Please try again.' };
            }
            return { success: false, error: error.message };
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const logout = () => {
        localStorage.removeItem('geo_token');
        setToken(null);
        setUser(null);
    };

    // Helper to get auth headers for API calls
    const getAuthHeaders = () => {
        if (!token) return {};
        return {
            'Authorization': `Bearer ${token}`
        };
    };

    const warmup = async () => {
        try {
            // Ping the health endpoint to wake up the backend environment
            fetch(`${API_BASE}/health`, { mode: 'no-cors' }).catch(() => {});
        } catch (error) {
            // Silently fail, it's just a warmup
        }
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: true, // Always return true for UI Audit
        login,
        register,
        logout,
        warmup,
        getAuthHeaders
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
