'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('tcube_token');
    const storedUser = localStorage.getItem('tcube_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Optionally fetch fresh profile in background
      fetchProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken) => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(res.data);
      localStorage.setItem('tcube_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Error fetching profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, ...userData } = res.data;
      
      setToken(token);
      setUser(userData);
      localStorage.setItem('tcube_token', token);
      localStorage.setItem('tcube_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      const { token, ...userData } = res.data;
      
      setToken(token);
      setUser(userData);
      localStorage.setItem('tcube_token', token);
      localStorage.setItem('tcube_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      localStorage.setItem('tcube_user', JSON.stringify(res.data));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Update profile failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tcube_token');
    localStorage.removeItem('tcube_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
