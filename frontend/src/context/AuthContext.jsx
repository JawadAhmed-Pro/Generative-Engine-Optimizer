import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

// Using explicit URL since environment variables might be failing on Render static site
const API_BASE = 'https://api.geo-tool.site';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('geo_token'));
    const [loading, setLoading] = useState(true);

    // Check token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('geo_token');
            if (!savedToken) {
                setLoading(false);
                return;
            }

            // Implement a timeout for the auth check so the UI doesn't hang
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
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
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password, name) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
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
            return { success: false, error: error.message };
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

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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
