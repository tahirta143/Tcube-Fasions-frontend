'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, ChevronLeft, ChevronRight, Star, Heart, ShoppingBag, Send } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    title: 'The Modern Linen Edit',
    subtitle: 'CAPSULE RELEASE 01',
    description: 'Clean shapes, warm beige tones, and relaxed silhouettes crafted from organic flax crops.',
    link: '/shop?category=women'
  },
  {
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1600&auto=format&fit=crop',
    title: 'Extra-Fine Merino Wool',
    subtitle: 'MEN\'S SIGNATURES',
    description: 'Spun from pure organic fibers, prioritizing lightweight warmth and breathable softness.',
    link: '/shop?category=men'
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    title: 'Artisanal Suede & Leather',
    subtitle: 'CAPSULE ACCESSORIES',
    description: 'Structured crescent bags and hand-stitched footwear designed for lifetime durability.',
    link: '/shop?category=accessories'
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products & banners
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        setProducts(res.data.slice(0, 4));
      } catch (err) {
        console.warn('Could not fetch products from backend, using default mock catalog:', err);
        setProducts([
          { id: 1, name: 'Classic Linen Trench Coat', price: 14500, discount_price: 11900, category: 'women', sizes: 'XS,S,M,L', colors: 'Beige,Warm Sand', images: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop', stock: 15 },
          { id: 2, name: 'Minimalist Silk Slip Dress', price: 9800, discount_price: null, category: 'women', sizes: 'S,M,L', colors: 'Charcoal,Pearl White', images: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop', stock: 10 },
          { id: 3, name: 'Merino Wool Mockneck Sweater', price: 7500, discount_price: 5900, category: 'men', sizes: 'M,L,XL', colors: 'Oatmeal,Heather Gray', images: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop', stock: 22 },
          { id: 4, name: 'Leather Crescent Shoulder Bag', price: 18500, discount_price: null, category: 'accessories', sizes: 'One Size', colors: 'Tan,Black', images: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop', stock: 8 }
        ]);
      }

      try {
        const bannerRes = await axios.get(`${API_URL}/api/banners`);
        const heroes = bannerRes.data.filter(b => b.type === 'hero');
        setHeroBanners(heroes);
      } catch (err) {
        console.warn('Could not fetch banners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slidesToUse = heroBanners.length > 0 
    ? heroBanners.map(b => ({
        image: b.image_url,
        title: b.title || 'TCUBE Capsule',
        subtitle: b.subtitle || 'EXCLUSIVE RELEASE',
        description: b.subtitle || 'Experience limited-edition minimalist tailoring.',
        link: b.link_url || '/shop'
      }))
    : HERO_SLIDES;

  // Auto-scroll hero slider
  useEffect(() => {
    if (slidesToUse.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesToUse.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slidesToUse]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slidesToUse.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length);

  return (
    <div className="space-y-24 pb-12 w-full">
      
      {/* 1. EDITORIAL HERO SLIDER - Full Screen Edge-to-Edge */}
      <div className="relative w-full h-[85vh] rounded-[24px] overflow-hidden shadow-[0_30px_70px_rgba(160,140,117,0.12)] border border-sand-200/20">
        <AnimatePresence mode="wait">
          {slidesToUse.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Dark Overlay */}
              <div className="absolute inset-0 bg-black/30 z-10" />
              <img
                src={slidesToUse[currentSlide].image}
                alt={slidesToUse[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Slider Content Column */}
              <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-20 text-white max-w-3xl space-y-6">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#A08C75] bg-white/90 px-4 py-1.5 rounded-full self-start shadow-sm">
                  {slidesToUse[currentSlide].subtitle}
                </span>
                
                <h1 className="font-serif text-4xl md:text-7xl font-bold tracking-tight leading-[1.15]">
                  {slidesToUse[currentSlide].title}
                </h1>
                
                <p className="text-sm md:text-base text-white/85 font-light leading-relaxed max-w-xl">
                  {slidesToUse[currentSlide].description}
                </p>

                <div className="pt-4 flex gap-4">
                  <Link
                    href={slidesToUse[currentSlide].link}
                    className="inline-flex items-center gap-2 bg-white text-primary hover:bg-[#A08C75] hover:text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md"
                  >
                    Explore Collection
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/30 text-white p-3.5 rounded-full backdrop-blur-md transition-all focus:outline-none"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/30 text-white p-3.5 rounded-full backdrop-blur-md transition-all focus:outline-none"
        >
          <ChevronRight size={22} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5">
          {slidesToUse.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/45 w-2.5'}`}
            />
          ))}
        </div>
      </div>

      {/* 2. CAPSULE CATEGORIES EDITORIAL ROW */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08C75] font-bold">Curated Wardrobe</span>
          <h2 className="font-serif text-3xl font-semibold text-primary">Shop by Capsule</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Women */}
          <Link href="/shop?category=women" className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-sand-200/10">
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors z-10" />
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop"
              alt="Women Capsule"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms]"
            />
            <div className="absolute bottom-8 left-8 z-20 text-white space-y-2">
              <h3 className="font-serif text-2xl font-bold tracking-wide">Women's Minimal</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80 flex items-center gap-1.5 group-hover:text-[#A08C75] transition-colors">
                Explore Edit <ArrowRight size={12} />
              </p>
            </div>
          </Link>

          {/* Men */}
          <Link href="/shop?category=men" className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-sand-200/10">
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors z-10" />
            <img
              src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=600&auto=format&fit=crop"
              alt="Men Capsule"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms]"
            />
            <div className="absolute bottom-8 left-8 z-20 text-white space-y-2">
              <h3 className="font-serif text-2xl font-bold tracking-wide">Men's Tailored</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80 flex items-center gap-1.5 group-hover:text-[#A08C75] transition-colors">
                Explore Edit <ArrowRight size={12} />
              </p>
            </div>
          </Link>

          {/* Accessories */}
          <Link href="/shop?category=accessories" className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-sand-200/10">
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors z-10" />
            <img
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop"
              alt="Accessories Capsule"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms]"
            />
            <div className="absolute bottom-8 left-8 z-20 text-white space-y-2">
              <h3 className="font-serif text-2xl font-bold tracking-wide">Signature Accessories</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80 flex items-center gap-1.5 group-hover:text-[#A08C75] transition-colors">
                Explore Edit <ArrowRight size={12} />
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. NEW RELEASES SECTION */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-200 pb-5 gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08C75] font-bold">New Release</span>
            <h2 className="font-serif text-3xl font-semibold text-primary mt-1">Curated Releases</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest font-semibold hover:text-[#A08C75] flex items-center gap-1.5 transition-colors pb-1">
            Browse All Collection <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] bg-sand-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. EDITORIAL STORY SECTION - Massimo Dutti Style (50/50 Split) */}
      <section className="grid grid-cols-1 md:grid-cols-2 rounded-[24px] overflow-hidden shadow-sm border border-sand-200/20 bg-white">
        {/* Left: Text Box */}
        <div className="p-8 md:p-16 flex flex-col justify-center space-y-6 bg-sand-50/50">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08C75] font-bold">The Heritage</span>
          
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-primary leading-tight">
            The Art of Small-Batch Tailoring
          </h2>
          
          <p className="text-sm text-primary/70 font-light leading-relaxed">
            Our capsule garments are created in limited quantities to focus on pristine stitch densities and reduce material excess. Each linen jacket and organic cotton set represents hours of meticulous work, utilizing exclusively natural flax and organic cotton crops sourced from ethical fields.
          </p>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#A08C75] text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md"
            >
              Discover the Craft
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right: Large Editorial Picture */}
        <div className="aspect-[4/3] md:aspect-auto min-h-[400px] w-full bg-sand-100 relative">
          <img
            src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop"
            alt="Artisanal craft"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* 5. MINIMALIST NEWSLETTER SIGNUP (Centered circle style) */}
      <section className="max-w-2xl mx-auto text-center space-y-6 py-12 px-6 rounded-[24px] bg-white border border-sand-200/20 shadow-sm relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-[#A08C75]/5 rounded-full blur-2xl" />
        
        <div className="space-y-2.5 z-10 relative">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08C75] font-bold">The Capsule Circle</span>
          <h2 className="font-serif text-3xl font-semibold text-primary">Stay Notified</h2>
          <p className="text-xs text-primary/60 max-w-sm mx-auto leading-relaxed">
            Join our mailing list to receive exclusive updates on limited seasonal collections and design previews.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }} className="max-w-md mx-auto z-10 relative">
          <div className="flex border-b border-primary/20 focus-within:border-[#A08C75] transition-colors py-2 items-center">
            <input
              type="email"
              required
              placeholder="Your email address"
              className="bg-transparent text-sm w-full focus:outline-none placeholder-primary/30 pr-4"
            />
            <button type="submit" className="text-xs uppercase tracking-widest font-bold text-primary hover:text-secondary transition-all">
              Join
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}
