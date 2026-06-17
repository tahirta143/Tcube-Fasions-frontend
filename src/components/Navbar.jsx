'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, User, LogOut, Menu, X, ShieldAlert, Heart, Sun, Moon } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { theme, toggleTheme, mounted } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentSearch(window.location.search || '');
    }
  }, [pathname]);

  const navLinks = [
    { name: 'Women', href: '/shop?category=women' },
    { name: 'Men', href: '/shop?category=men' },
    { name: 'Kids', href: '/shop?category=kids' },
    { name: 'Accessories', href: '/shop?category=accessories' },
    { name: 'Shoes', href: '/shop?category=shoes' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href) => {
    return pathname + currentSearch === href;
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-sand-200/50 py-4 px-6 md:px-12 flex items-center justify-between transition-all duration-300">
      {/* Brand Logo */}
      <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest text-primary font-bold hover:opacity-80 transition-opacity">
        TCUBE <span className="font-sans font-light text-sm text-secondary tracking-normal ml-1">FASHIONS</span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-8">
        <Link href="/shop" className={`text-sm tracking-wider uppercase font-medium hover:text-secondary transition-colors ${pathname === '/shop' ? 'text-secondary border-b border-secondary/50' : 'text-primary'}`}>
          Shop All
        </Link>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`text-sm tracking-wider uppercase font-medium hover:text-secondary transition-colors ${isActive(link.href) ? 'text-secondary border-b border-secondary/50' : 'text-primary/80'}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Navigation Icons */}
      <div className="hidden md:flex items-center space-x-6">
        {user?.role === 'admin' && (
          <Link href="/admin" title="Admin Dashboard" className="text-primary hover:text-secondary transition-colors flex items-center gap-1 text-xs uppercase tracking-wider font-semibold border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 rounded-full">
            <ShieldAlert size={14} />
            Admin
          </Link>
        )}

        {user ? (
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-primary hover:text-secondary transition-colors flex items-center gap-1.5 text-sm font-medium">
              <User size={18} />
              <span>Hi, {user.name.split(' ')[0]}</span>
            </Link>
            <button onClick={handleLogout} title="Log Out" className="text-primary/70 hover:text-red-600 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link href="/auth" className="text-primary hover:text-secondary transition-colors flex items-center gap-1.5 text-sm font-medium">
            <User size={18} />
            <span>Sign In</span>
          </Link>
        )}

        <button
          onClick={toggleTheme}
          className="text-primary hover:text-secondary transition-all p-1 focus:outline-none cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {!mounted || theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <Link href="/favorites" className="relative text-primary hover:text-secondary transition-colors" title="My Favorites">
          <Heart size={20} />
          {favoritesCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-secondary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
              {favoritesCount}
            </span>
          )}
        </Link>

        <Link href="/cart" className="relative text-primary hover:text-secondary transition-colors">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-secondary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm animate-pulse">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile Actions & Hamburger */}
      <div className="flex items-center space-x-4 md:hidden">
        <button
          onClick={toggleTheme}
          className="text-primary hover:text-secondary transition-all p-1 focus:outline-none cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {!mounted || theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <Link href="/favorites" className="relative text-primary" title="My Favorites">
          <Heart size={20} />
          {favoritesCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold">
              {favoritesCount}
            </span>
          )}
        </Link>
        <Link href="/cart" className="relative text-primary">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-primary focus:outline-none">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-sand-200 py-6 px-6 flex flex-col space-y-4 md:hidden shadow-lg animate-fade-in z-50">
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base tracking-wider uppercase font-medium border-b border-sand-100 pb-2 text-primary"
          >
            Shop All
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base tracking-wider uppercase font-medium border-b border-sand-100 pb-2 text-primary/80"
            >
              {link.name}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-red-700 font-semibold tracking-wider uppercase text-sm flex items-center gap-2 border-b border-sand-100 pb-2"
            >
              <ShieldAlert size={16} />
              Admin Portal
            </Link>
          )}

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-primary flex items-center gap-2"
              >
                <User size={18} />
                My Account ({user.name})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-left text-base text-red-600 font-medium flex items-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-primary flex items-center gap-2"
            >
              <User size={18} />
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
