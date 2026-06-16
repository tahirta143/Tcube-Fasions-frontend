'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, RefreshCw, AlertTriangle } from 'lucide-react';

function AuthContent() {
  const { user, login, register, loading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/';

  // Tab State
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Input States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [validationError, setValidationError] = useState('');

  // Already logged in? Redirect
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.email || !formData.password) {
      setValidationError('Please fill in all credentials');
      return;
    }

    if (isLoginTab) {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        router.push(redirectUrl);
      }
    } else {
      if (!formData.name) {
        setValidationError('Name is required for registration');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setValidationError('Password must be at least 6 characters');
        return;
      }

      const res = await register(formData.name, formData.email, formData.password);
      if (res.success) {
        router.push(redirectUrl);
      }
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md glass-card p-8 space-y-6">
        
        {/* Tab Selection */}
        <div className="flex border-b border-sand-200">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setValidationError('');
            }}
            className={`flex-grow pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${isLoginTab ? 'text-primary border-b-2 border-primary' : 'text-primary/40 hover:text-secondary'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setValidationError('');
            }}
            className={`flex-grow pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${!isLoginTab ? 'text-primary border-b-2 border-primary' : 'text-primary/40 hover:text-secondary'}`}
          >
            Register
          </button>
        </div>

        {/* Tab Header */}
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-primary">
            {isLoginTab ? 'Welcome Back' : 'Create Luxury Account'}
          </h2>
          <p className="text-[10px] text-primary/40 uppercase tracking-widest font-semibold mt-1">
            {isLoginTab ? 'Sign in to access your profile & orders' : 'Join our capsule fashion circle'}
          </p>
        </div>

        {/* Error Banners */}
        {(validationError || error) && (
          <div className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
              />
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
            />
          </div>

          {!isLoginTab && (
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Confirm Password</label>
              <input
                type="password"
                name="password"
                required={!isLoginTab}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
              />
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-secondary text-white font-semibold uppercase tracking-wider text-xs rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md mt-6"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : isLoginTab ? (
              <>
                <LogIn size={14} />
                Sign In
              </>
            ) : (
              <>
                <UserPlus size={14} />
                Create Account
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
