import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

// Prioritize environment variable, fallback to production URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.geo-tool.site';
const NETWORK_TIMEOUT = 30000; // Increased to 30s to handle backend cold-starts/Render spin-up

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('geo_token'));
    const [loading, setLoading] = useState(true);

    // Check token on mount
    useEffect(() => {
        const checkAuth = async () => {
            // BACKEND BYPASS FOR UI AUDITING - REMOVE FOR PRODUCTION
            setUser({
                id: 'mock-id-123',
                email: 'admin@geo-tool.site',
                name: 'GEO Auditor',
                is_active: true
            });
            setLoading(false);
            return;
            
            const savedToken = localStorage.getItem('geo_token');

            // Implement a timeout for the auth check so the UI doesn't hang
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);

            try {
                const response = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${savedToken}`
                    },
                    signal: controller.signal
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setToken(savedToken);
                } else {
                    // Token invalid, clear it
                    localStorage.removeItem('geo_token');
                    setToken(null);
                    setUser(null);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn('Auth check timed out');
                } else {
                    console.error('Auth check failed:', error);
                }
                // Don't clear token on network failure, just let them stay logged out for now
                // but we DO need to stop loading
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };

        checkAuth();
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
        isAuthenticated: !!user,
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
