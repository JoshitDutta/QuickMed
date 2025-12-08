import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../api/axios';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: newToken, user: newUser } = response.data;
            setTokenState(newToken);
            setUser(newUser);
            setAuthToken(newToken); 
            return true;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/register', userData);
            const { token: newToken, user: newUser } = response.data;
            setTokenState(newToken);
            setUser(newUser);
            setAuthToken(newToken);
            return true;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };
    const logout = () => {
        setTokenState(null);
        setUser(null);
        setAuthToken(null);
    };
    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);
