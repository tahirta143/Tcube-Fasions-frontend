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
  const [editorialBanners, setEditorialBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State (2 rows = 10 items per page on 5-col desktop layout)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getDisplayTitle = (slug) => {
    switch (slug) {
      case 'women': return "Women's Minimal";
      case 'men': return "Men's Tailored";
      case 'kids': return "Kids Organic";
      case 'accessories': return "Signature Accessories";
      case 'shoes': return "Minimalist Shoes";
      default: return slug.charAt(0).toUpperCase() + slug.slice(1);
    }
  };

  // Fetch products, banners & categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        setProducts(res.data.slice(0, 30));
      } catch (err) {
        console.warn('Could not fetch products from backend, using default mock catalog:', err);
        setProducts([
          { id: 1, name: 'Classic Linen Trench Coat', price: 14500, discount_price: 11900, category: 'women', sizes: 'XS,S,M,L', colors: 'Beige,Warm Sand', images: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop', stock: 15 },
          { id: 2, name: 'Minimalist Silk Slip Dress', price: 9800, discount_price: null, category: 'women', sizes: 'S,M,L', colors: 'Charcoal,Pearl White', images: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop', stock: 10 },
          { id: 3, name: 'Merino Wool Mockneck Sweater', price: 7500, discount_price: 5900, category: 'men', sizes: 'M,L,XL', colors: 'Oatmeal,Heather Gray', images: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop', stock: 22 },
          { id: 4, name: 'Leather Crescent Shoulder Bag', price: 18500, discount_price: null, category: 'accessories', sizes: 'One Size', colors: 'Tan,Black', images: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop', stock: 8 },
          { id: 5, name: 'Minimalist Suede Loafers', price: 12500, discount_price: null, category: 'shoes', sizes: '40,41,42,43', colors: 'Suede Brown,Tan', images: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600&auto=format&fit=crop', stock: 12 },
          { id: 6, name: 'Tailored Linen Trousers', price: 6400, discount_price: null, category: 'women', sizes: 'S,M,L', colors: 'Sage,Off-White', images: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop', stock: 18 },
          { id: 7, name: 'Organic Cotton Kid Overalls', price: 3200, discount_price: 2500, category: 'kids', sizes: '2Y,3Y,4Y,5Y', colors: 'Dusty Pink,Clay', images: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop', stock: 30 },
          { id: 8, name: 'Fine Knit Cardigan', price: 8900, discount_price: 6900, category: 'women', sizes: 'S,M,L', colors: 'Oatmeal,Soft Grey', images: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop', stock: 14 },
          { id: 9, name: 'Minimalist Leather Belt', price: 4500, discount_price: null, category: 'accessories', sizes: 'M,L', colors: 'Black,Dark Brown', images: 'https://images.unsplash.com/photo-1624222247586-540c795ba5c3?q=80&w=600&auto=format&fit=crop', stock: 25 },
          { id: 10, name: 'Relaxed Fit Cotton T-Shirt', price: 3500, discount_price: 2900, category: 'men', sizes: 'S,M,L,XL', colors: 'Off-White,Olive', images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop', stock: 40 },
          { id: 11, name: 'Casual Linen Shirt', price: 5800, discount_price: null, category: 'men', sizes: 'M,L,XL', colors: 'White,Light Blue', images: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop', stock: 15 },
          { id: 12, name: 'Cashmere Beanie', price: 5200, discount_price: 3900, category: 'accessories', sizes: 'One Size', colors: 'Grey,Beige', images: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?q=80&w=600&auto=format&fit=crop', stock: 20 }
        ]);
      }

      try {
        const catRes = await axios.get(`${API_URL}/api/categories`);
        setCategories(catRes.data);
      } catch (err) {
        console.warn('Could not fetch categories from backend, using defaults:', err);
        setCategories([
          { id: 1, name: 'Women', slug: 'women', banner_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop' },
          { id: 2, name: 'Men', slug: 'men', banner_url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=600&auto=format&fit=crop' },
          { id: 3, name: 'Kids', slug: 'kids', banner_url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop' },
          { id: 4, name: 'Accessories', slug: 'accessories', banner_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop' },
          { id: 5, name: 'Shoes', slug: 'shoes', banner_url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600&auto=format&fit=crop' }
        ]);
      }

      try {
        const bannerRes = await axios.get(`${API_URL}/api/banners`);
        const heroes = bannerRes.data.filter(b => b.type === 'hero');
        setHeroBanners(heroes);
        const editorials = bannerRes.data.filter(b => b.type === 'editorial');
        setEditorialBanners(editorials);
      } catch (err) {
        console.warn('Could not fetch banners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const activeHero = heroBanners.length > 0 ? heroBanners[0] : null;
  const heroVideoSrc = activeHero?.video_url || activeHero?.image_url || '/hero1.mp4';
  const heroTitle = activeHero?.title || 'The Motion Editorial';
  const heroSubtitle = activeHero?.subtitle || 'CAPSULE RUNWAY 2026';
  const heroDescription = activeHero?.description || activeHero?.subtitle || 'Experience movement, form, and texture in our latest runway-inspired luxury knitwear and tailoring.';
  const heroLink = activeHero?.link_url || '/shop';

  return (
    <div className="space-y-24 pb-12 w-full">

      {/* 1. EDITORIAL HERO - Full Screen Edge-to-Edge with single background video */}
      <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 -mt-8 h-[85vh] md:h-[90vh] overflow-hidden">
        <video
          src={heroVideoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Background Dark Overlay */}
        <div className="absolute inset-0 bg-black/35 z-10" />

        {/* Hero Content Column */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center text-white w-full h-full">
          <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 space-y-6 flex flex-col">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#A08C75] bg-white/95 px-4 py-1.5 rounded-full self-start shadow-sm text-primary">
              {heroSubtitle}
            </span>

            <h1 className="font-serif text-4xl md:text-7xl font-bold tracking-tight leading-[1.15] max-w-4xl">
              {heroTitle}
            </h1>

            <p className="text-sm md:text-base text-white/85 font-light leading-relaxed max-w-xl">
              {heroDescription}
            </p>

            <div className="pt-4 flex gap-4">
              <Link
                href={heroLink}
                className="inline-flex items-center gap-2 bg-white text-primary hover:bg-[#A08C75] hover:text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md"
              >
                Explore Collection
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CAPSULE CATEGORIES EDITORIAL ROW */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08C75] font-bold">Curated Wardrobe</span>
          <h2 className="font-serif text-3xl font-semibold text-primary">Shop by Capsule</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6 w-full">
          {categories.map((cat) => (
            <div key={cat.id || cat.slug} className="w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-20px)] flex-shrink-0 animate-fade-in">
              <Link href={`/shop?category=${cat.slug}`} className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-sand-200/10 block">
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors z-10" />
                <img
                  src={cat.banner_url || '/images/placeholder.jpg'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms]"
                />
                <div className="absolute bottom-6 left-6 z-20 text-white space-y-1.5 font-sans">
                  <h3 className="font-serif text-base md:text-lg font-bold tracking-wide">{getDisplayTitle(cat.slug)}</h3>
                  <p className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold text-white/80 flex items-center gap-1.5 group-hover:text-[#A08C75] transition-colors">
                    Explore Edit <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NEW RELEASES SECTION */}
      <section id="curated-releases" className="scroll-mt-24 space-y-10">
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
          <div className="flex flex-wrap justify-center gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="w-[calc(50%-16px)] sm:w-[calc(33.333%-22px)] lg:w-[calc(20%-26px)] aspect-[3/4] bg-sand-100 rounded-2xl animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="space-y-10 w-full">
            <div className="flex flex-wrap justify-center gap-8">
              {currentItems.map((product) => (
                <div key={product.id} className="w-[calc(50%-16px)] sm:w-[calc(33.333%-22px)] lg:w-[calc(20%-26px)] flex-shrink-0 animate-fade-in">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-8 border-t border-sand-200/40 mt-6">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    document.getElementById('curated-releases')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-lg border border-sand-200 bg-white text-primary hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      document.getElementById('curated-releases')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${currentPage === page ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-sand-200 text-primary hover:text-secondary'}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    document.getElementById('curated-releases')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-lg border border-sand-200 bg-white text-primary hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. EDITORIAL STORY SECTION - Massimo Dutti Style (50/50 Split) */}
      <section className="grid grid-cols-1 md:grid-cols-2 rounded-[24px] overflow-hidden shadow-sm border border-sand-200/20 bg-white">
        {/* Left: Text Box */}
        <div className="p-8 md:p-16 flex flex-col justify-center space-y-6 bg-sand-50/50">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08C75] font-bold">
            {editorialBanners.length > 0 ? editorialBanners[0].subtitle || "The Heritage" : "The Heritage"}
          </span>

          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-primary leading-tight">
            {editorialBanners.length > 0 ? editorialBanners[0].title || "The Art of Small-Batch Tailoring" : "The Art of Small-Batch Tailoring"}
          </h2>

          <p className="text-sm text-primary/70 font-light leading-relaxed">
            {editorialBanners.length > 0 ? editorialBanners[0].description || "Our capsule garments are created in limited quantities to focus on pristine stitch densities and reduce material excess. Each linen jacket and organic cotton set represents hours of meticulous work, utilizing exclusively natural flax and organic cotton crops sourced from ethical fields." : "Our capsule garments are created in limited quantities to focus on pristine stitch densities and reduce material excess. Each linen jacket and organic cotton set represents hours of meticulous work, utilizing exclusively natural flax and organic cotton crops sourced from ethical fields."}
          </p>

          <div className="pt-2">
            <Link
              href={editorialBanners.length > 0 ? editorialBanners[0].link_url || "/shop" : "/shop"}
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#A08C75] text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md"
            >
              Discover the Craft
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right: Large Editorial Picture or Video */}
        <div className="aspect-[4/3] md:aspect-auto min-h-[400px] w-full bg-sand-100 relative">
          {editorialBanners.length > 0 && (editorialBanners[0].video_url || (editorialBanners[0].image_url && (editorialBanners[0].image_url.endsWith('.mp4') || editorialBanners[0].image_url.includes('video') || editorialBanners[0].image_url.includes('mixkit.co/videos')))) ? (
            <video
              src={editorialBanners[0].video_url || editorialBanners[0].image_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={editorialBanners.length > 0 ? editorialBanners[0].image_url : "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop"}
              alt="Artisanal craft"
              className="w-full h-full object-cover object-center"
            />
          )}
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
