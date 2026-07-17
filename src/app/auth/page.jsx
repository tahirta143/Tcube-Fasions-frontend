'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);

  // Already logged in? Redirect
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return <div className="min-h-screen bg-[#FDFBF7] dark:bg-black" />;
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-[#FDFBF7] dark:bg-black w-screen h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left: Background Image (75% width on desktop, hidden on mobile) */}
      <div className="hidden lg:block lg:w-3/4 relative h-full min-h-[500px] bg-sand-100 overflow-hidden">
        <img
          src="/auth-bg.png"
          alt="Luxury Fashion Circle"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25 z-10" />

        {/* Brand Logo at the top left of the image */}
        <div className="absolute top-8 left-12 z-20">
          <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest text-white font-bold hover:opacity-80 transition-opacity">
            TCUBE <span className="font-sans font-light text-sm text-[#A08C75] tracking-normal ml-1">FASHIONS</span>
          </Link>
        </div>

        <div className="absolute bottom-12 left-12 z-20 text-white max-w-lg space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#A08C75] bg-white/95 px-4 py-1.5 rounded-full inline-block">
            TCUBE Capsule Circle
          </span>
          <h1 className="font-serif text-5xl font-bold leading-tight">
            Designed for Lifetime Durability
          </h1>
          <p className="text-sm font-light text-white/90 leading-relaxed">
            Experience movement, texture, and pristine stitch densities in our latest runway-inspired collections. Join us to unlock exclusive curation.
          </p>
        </div>
      </div>

      {/* Right: Form (25% width on desktop, full width on mobile) */}
      <div className="w-full lg:w-1/4 h-full flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-8 bg-sand-50 dark:bg-zinc-950 overflow-y-auto">
        {/* Mobile Header / Home Link */}
        <div className="flex justify-between items-center lg:justify-end w-full mb-6">
          <div className="lg:hidden">
            <Link href="/" className="text-xl font-serif tracking-widest text-primary font-bold hover:opacity-80 transition-opacity">
              TCUBE <span className="font-sans font-light text-xs text-secondary tracking-normal ml-1">FASHIONS</span>
            </Link>
          </div>
          <Link href="/" className="text-xs font-semibold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1">
            <span>←</span> Back to Store
          </Link>
        </div>

        {/* Center Container to Hold Card */}
        <div className="w-full max-w-md mx-auto my-auto py-8 px-2">
          {/* Outer Form Card similar to the second image */}
          <div className="bg-white dark:bg-zinc-900 border border-sand-200/60 dark:border-zinc-800 p-8 rounded-2xl shadow-xl space-y-6">

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
                    name="confirmPassword"
                    required={!isLoginTab}
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

        {/* Footer/Spacing spacer for alignment */}
        <div className="hidden lg:block text-center pt-8 text-[10px] text-primary/30 uppercase tracking-widest">
          © {new Date().getFullYear()} TCUBE Fashions
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
