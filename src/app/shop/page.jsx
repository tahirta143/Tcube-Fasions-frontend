'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State (2 rows = 6 items per page on 3-col desktop layout)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Static options
  const categories = ['all', 'women', 'men', 'kids', 'accessories', 'shoes'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '39', '40', '41', '42', '43', '44', 'One Size'];
  const colors = ['Beige', 'Off-White', 'Warm Sand', 'Charcoal', 'Pearl White', 'Taupe', 'Oatmeal', 'Heather Gray', 'Soft Cream', 'Sage', 'Pink', 'Olive', 'Tan', 'Black', 'Chocolate'];

  // Sync category state with query params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat);
    }
  }, [searchParams]);

  // Fetch products
  const fetchProducts = async () => {
    setCurrentPage(1);
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'all') params.category = category;
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;
      if (selectedSize) params.size = selectedSize;
      if (selectedColor) params.color = selectedColor;
      if (sortBy) params.sort = sortBy;
      if (searchTerm) params.search = searchTerm;

      const res = await axios.get(`${API_URL}/api/products`, { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching filtered products, falling back to mock catalog:', err);
      // Fallback Mock Catalog
      const mockCatalog = [
        { id: 1, name: 'Classic Linen Trench Coat', price: 14500.00, discount_price: 11900.00, category: 'women', sizes: 'XS,S,M,L', colors: 'Beige,Warm Sand', images: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop', stock: 15 },
        { id: 2, name: 'Minimalist Silk Slip Dress', price: 9800.00, discount_price: null, category: 'women', sizes: 'S,M,L', colors: 'Charcoal,Pearl White,Taupe', images: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop', stock: 10 },
        { id: 3, name: 'Merino Wool Mockneck Sweater', price: 7500.00, discount_price: 5900.00, category: 'men', sizes: 'M,L,XL,XXL', colors: 'Oatmeal,Heather Gray,Soft Cream', images: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop', stock: 22 },
        { id: 4, name: 'Tailored Linen Trousers', price: 6400.00, discount_price: null, category: 'women', sizes: 'S,M,L', colors: 'Sage,Off-White,Beige', images: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop', stock: 18 },
        { id: 5, name: 'Organic Cotton Kid Overalls', price: 3200.00, discount_price: 2500.00, category: 'kids', sizes: '2Y,3Y,4Y,5Y', colors: 'Dusty Pink,Clay,Olive', images: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop', stock: 30 },
        { id: 6, name: 'Leather Crescent Shoulder Bag', price: 18500.00, discount_price: null, category: 'accessories', sizes: 'One Size', colors: 'Tan,Black,Cream', images: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop', stock: 8 },
        { id: 7, name: 'Minimalist Suede Loafers', price: 11500.00, discount_price: 8900.00, category: 'shoes', sizes: '39,40,41,42,43,44', colors: 'Sand,Chocolate,Charcoal', images: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600&auto=format&fit=crop', stock: 12 }
      ];

      // Manual client-side mock filtering to maintain functionality in mock mode!
      let filtered = [...mockCatalog];
      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (priceRange.min) {
        filtered = filtered.filter(p => (p.discount_price || p.price) >= parseFloat(priceRange.min));
      }
      if (priceRange.max) {
        filtered = filtered.filter(p => (p.discount_price || p.price) <= parseFloat(priceRange.max));
      }
      if (selectedSize) {
        filtered = filtered.filter(p => p.sizes.includes(selectedSize));
      }
      if (selectedColor) {
        filtered = filtered.filter(p => p.colors.includes(selectedColor));
      }
      if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      if (sortBy === 'price-asc') {
        filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      }

      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, selectedSize, selectedColor, sortBy]);

  const handleReset = () => {
    setCategory('all');
    setPriceRange({ min: '', max: '' });
    setSelectedSize('');
    setSelectedColor('');
    setSortBy('featured');
    setSearchTerm('');
    router.push('/shop');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-200 pb-4 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-primary capitalize">
            {category === 'all' ? 'All Collections' : `${category} clothing`}
          </h1>
          <p className="text-xs text-primary/40 mt-1 uppercase tracking-wider font-semibold">
            Showing {products.length} garments
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            className="text-xs bg-white border border-sand-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-secondary w-48 shadow-sm"
          />
          <button
            onClick={fetchProducts}
            className="p-2.5 bg-white border border-sand-200 hover:text-secondary rounded-lg text-primary transition-colors shadow-sm"
            title="Apply text search"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <div className="flex items-center space-x-2 bg-white border border-sand-200 px-3 py-2 rounded-lg shadow-sm">
            <ArrowUpDown size={14} className="text-primary/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs text-primary bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="featured">Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6 bg-white/60 p-6 rounded-2xl border border-sand-200/50 shadow-sm self-start">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
              <SlidersHorizontal size={16} /> Filters
            </h3>
            <button onClick={handleReset} className="text-[10px] uppercase font-bold tracking-widest text-secondary hover:underline">
              Clear All
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/60">Category</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    router.push(`/shop?category=${cat}`);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all uppercase tracking-wider ${category === cat ? 'bg-primary text-white border-primary' : 'bg-transparent border-sand-200 text-primary/70 hover:border-secondary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/60">Price (Rs.)</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full text-xs border border-sand-200 p-2 rounded focus:outline-none focus:border-secondary"
              />
              <span className="text-primary/30">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full text-xs border border-sand-200 p-2 rounded focus:outline-none focus:border-secondary"
              />
            </div>
            <button
              onClick={fetchProducts}
              className="w-full py-2 bg-sand-200 hover:bg-secondary hover:text-white text-primary text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              Filter Price
            </button>
          </div>

          {/* Sizes Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/60">Size</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`text-[10px] font-bold p-2 border rounded text-center transition-all ${selectedSize === sz ? 'bg-primary text-white border-primary' : 'bg-transparent border-sand-200 text-primary/70 hover:border-secondary'}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/60">Color</h4>
            <div className="flex flex-wrap gap-2">
              {colors.map((clr) => (
                <button
                  key={clr}
                  onClick={() => setSelectedColor(selectedColor === clr ? '' : clr)}
                  className={`text-[10px] px-2.5 py-1.5 border rounded-full transition-all uppercase tracking-wider font-semibold ${selectedColor === clr ? 'bg-primary text-white border-primary' : 'bg-transparent border-sand-200 text-primary/70 hover:border-secondary'}`}
                >
                  {clr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full min-h-[500px]">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-3/4 bg-sand-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white/40 border border-dashed border-sand-200 rounded-2xl flex-grow">
              <p className="text-sm text-primary/40 uppercase tracking-widest font-bold">No garments found matching criteria</p>
              <button onClick={handleReset} className="mt-4 text-xs font-bold text-secondary uppercase tracking-widest hover:underline">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-10 flex-grow">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                {currentItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-8 border-t border-sand-200/40">
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${currentPage === page ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-sand-200 text-primary hover:text-secondary'}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
