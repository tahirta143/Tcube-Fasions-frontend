'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-sand-50 border-t border-sand-200 mt-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold tracking-widest text-primary">TCUBE FASHIONS</h3>
          <p className="text-sm text-primary/60 leading-relaxed max-w-xs">
            An ultra-minimalist luxury fashion label designed for comfortable sophistication and modern silhouettes.
          </p>
          <p className="text-xs text-primary/40">
            © {new Date().getFullYear()} TCUBE Fashions. All Rights Reserved.
          </p>
        </div>

        {/* Collections */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">Collections</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/shop?category=women" className="text-primary/70 hover:text-secondary transition-colors">Women's Minimalist</Link>
            </li>
            <li>
              <Link href="/shop?category=men" className="text-primary/70 hover:text-secondary transition-colors">Men's Tailored</Link>
            </li>
            <li>
              <Link href="/shop?category=kids" className="text-primary/70 hover:text-secondary transition-colors">Kids Organic</Link>
            </li>
            <li>
              <Link href="/shop?category=accessories" className="text-primary/70 hover:text-secondary transition-colors">Luxury Accessories</Link>
            </li>
            <li>
              <Link href="/shop?category=shoes" className="text-primary/70 hover:text-secondary transition-colors">Suede & Leather Shoes</Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">Customer Care</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/shop" className="text-primary/70 hover:text-secondary transition-colors">Shipping & Returns</Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-primary/70 hover:text-secondary transition-colors">Track Your Order</Link>
            </li>
            <li>
              <Link href="/auth" className="text-primary/70 hover:text-secondary transition-colors">Account Login</Link>
            </li>
            <li>
              <span className="text-primary/70">Support: support@tcube.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">Newsletter</h4>
          <p className="text-sm text-primary/60 leading-relaxed">
            Subscribe for exclusive access to capsule collections, promotions, and design concepts.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <div className="flex border-b border-primary/20 focus-within:border-secondary transition-colors py-1">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-sm w-full focus:outline-none placeholder-primary/40 pr-2"
              />
              <button type="submit" className="text-xs uppercase tracking-widest font-semibold text-primary hover:text-secondary transition-colors">
                Subscribe
              </button>
            </div>
            {subscribed && (
              <span className="text-xs text-secondary font-medium animate-pulse">
                Thank you for subscribing!
              </span>
            )}
          </form>

          {/* Payments Badge Grid */}
          <div className="pt-4 space-y-2">
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-primary/40">Accepted Payments</h5>
            <div className="flex flex-wrap gap-2 text-[10px] text-primary/60">
              <span className="bg-sand-200/50 px-2 py-1 rounded font-semibold border border-sand-300/30">COD</span>
              <span className="bg-sand-200/50 px-2 py-1 rounded font-semibold border border-sand-300/30">Card / Stripe</span>
              <span className="bg-sand-200/50 px-2 py-1 rounded font-semibold border border-sand-300/30">EasyPaisa</span>
              <span className="bg-sand-200/50 px-2 py-1 rounded font-semibold border border-sand-300/30">JazzCash</span>
              <span className="bg-sand-200/50 px-2 py-1 rounded font-semibold border border-sand-300/30">Bank Transfer</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
