'use client';

import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, Heart, Star, ChevronRight, Plus, Minus, ShieldCheck, RefreshCw, Play } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProductDetailPage({ params }) {
  // Resolve params promise for compatibility with React 19 / Next.js 15+
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Variant States
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const { user, token } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isWishlisted = product ? isFavorite(product.id) : false;

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitMsg, setReviewSubmitMsg] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!productId || productId === 'undefined') return;
    setActiveImageIndex(0);
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Fetch details
        const res = await axios.get(`${API_URL}/api/products/${productId}`);
        setProduct(res.data);
        
        // Auto-select first variant
        if (res.data.sizes) setSelectedSize(res.data.sizes.split(',')[0]);
        if (res.data.colors) setSelectedColor(res.data.colors.split(',')[0]);

        // Fetch related products (same category)
        const relatedRes = await axios.get(`${API_URL}/api/products`, {
          params: { category: res.data.category }
        });
        setRelatedProducts(relatedRes.data.filter(p => p.id !== res.data.id).slice(0, 4));
      } catch (err) {
        console.warn('Error fetching product from API, using fallback mock:', err);
        // Fallback Product Details
        const mockCatalog = [
          { id: 1, name: 'Classic Linen Trench Coat', price: 14500.00, discount_price: 11900.00, category: 'women', sizes: 'XS,S,M,L,XL', colors: 'Beige,Off-White,Warm Sand', description: 'A timeless trench coat crafted from a blend of premium organic linen and cotton. Relaxed silhouette with double-breasted closure and adjustable belt.', stock: 15 },
          { id: 2, name: 'Minimalist Silk Slip Dress', price: 9800.00, discount_price: null, category: 'women', sizes: 'S,M,L', colors: 'Charcoal,Pearl White,Taupe', description: 'Cut from fluid silk-satin, this slip dress features thin adjustable straps and a cowl neck. Perfect for elegant summer evenings or layering.', stock: 10 },
          { id: 3, name: 'Merino Wool Mockneck Sweater', price: 7500.00, discount_price: 5900.00, category: 'men', sizes: 'M,L,XL,XXL', colors: 'Oatmeal,Heather Gray,Soft Cream', description: 'Spun from extra-fine Merino wool, this sweater features a clean mock neckline and rib-knit cuffs. Breathable, warm, and ultra-soft.', stock: 22 },
          { id: 4, name: 'Tailored Linen Trousers', price: 6400.00, discount_price: null, category: 'women', sizes: 'S,M,L', colors: 'Sage,Off-White,Beige', description: 'Sophisticated relaxed trousers made of high-quality linen. Featuring a high-rise waist, pleated front, and subtle side pockets.', stock: 18 },
          { id: 5, name: 'Organic Cotton Kid Overalls', price: 3200.00, discount_price: 2500.00, category: 'kids', sizes: '2Y,3Y,4Y,5Y', colors: 'Dusty Pink,Clay,Olive', description: 'Super soft and breathable organic cotton overalls with wooden button details. Designed for all-day comfort and play.', stock: 30 },
          { id: 6, name: 'Leather Crescent Shoulder Bag', price: 18500.00, discount_price: null, category: 'accessories', sizes: 'One Size', colors: 'Tan,Black,Cream', description: 'A modern, crescent-shaped shoulder bag crafted in premium full-grain leather. Finished with polished brass hardware and an adjustable strap.', stock: 8 },
          { id: 7, name: 'Minimalist Suede Loafers', price: 11500.00, discount_price: 8900.00, category: 'shoes', sizes: '39,40,41,42,43,44', colors: 'Sand,Chocolate,Charcoal', description: 'Timeless suede loafers featuring a cushioned footbed and premium leather lining. Finished with lightweight soles for maximum walking comfort.', stock: 12 }
        ];

        const item = mockCatalog.find(p => p.id === parseInt(productId)) || mockCatalog[0];
        setProduct(item);
        setSelectedSize(item.sizes.split(',')[0]);
        setSelectedColor(item.colors.split(',')[0]);
        
        // Related fallback
        setRelatedProducts(mockCatalog.filter(p => p.category === item.category && p.id !== item.id).slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/reviews/product/${productId}`);
        setReviews(res.data);
      } catch (err) {
        console.warn('Error fetching reviews:', err);
        setReviews([
          { id: 1, user_name: 'Amina R.', rating: 5, created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(), comment: 'The linen fabric is incredibly premium and heavy. Fits beautifully and flows nicely. Ideal for warm weather.' },
          { id: 2, user_name: 'Zain B.', rating: 4, created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), comment: 'Excellent minimal design. The color is exactly as pictured. Delivery took 3 days to Lahore.' }
        ]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProductData();
    fetchReviews();
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setReviewSubmitMsg('');
    setSubmittingReview(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/reviews`,
        {
          product_id: parseInt(productId),
          rating: newRating,
          comment: newComment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setReviewSubmitMsg(res.data.message || 'Review submitted successfully.');
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewSubmitMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <RefreshCw size={36} className="animate-spin text-secondary" />
        <span className="text-xs uppercase tracking-widest font-semibold text-primary/40">Loading Garment Details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-40">
        <h2 className="font-serif text-2xl font-bold">Product Not Found</h2>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please choose a size');
      return;
    }
    if (!selectedColor) {
      alert('Please choose a color');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    alert(`Added ${quantity}x ${product.name} (${selectedSize} / ${selectedColor}) to your cart.`);
  };

  // Assemble media list: video first if present, then images
  const mediaList = [];
  if (product.video_url) {
    mediaList.push({ type: 'video', url: product.video_url });
  }
  const imagesList = product.images ? product.images.split(',') : [];
  imagesList.forEach(img => {
    if (img) mediaList.push({ type: 'image', url: img });
  });

  const activeMedia = mediaList[activeImageIndex] || mediaList[0] || { type: 'image', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop' };

  const hasDiscount = product.discount_price !== null && parseFloat(product.discount_price) > 0;

  return (
    <div className="space-y-16">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-primary/40 font-semibold">
        <span>Home</span>
        <ChevronRight size={10} />
        <span>Shop</span>
        <ChevronRight size={10} />
        <span className="text-secondary">{product.category}</span>
        <ChevronRight size={10} />
        <span className="text-primary truncate max-w-[150px]">{product.name}</span>
      </div>

      {/* Main product card detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-3/4 rounded-2xl overflow-hidden bg-sand-100 border border-sand-200/50 relative shadow-sm">
            {activeMedia.type === 'video' ? (
              <video
                src={activeMedia.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            )}
            {hasDiscount && (
              <span className="absolute top-6 left-6 bg-secondary text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                Sale
              </span>
            )}
          </div>
          
          {/* Thumbnails if multiple exist */}
          {mediaList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2">
              {mediaList.map((media, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border cursor-pointer flex-shrink-0 transition-all relative ${
                    activeImageIndex === idx ? 'border-secondary ring-2 ring-secondary/20 scale-95' : 'border-sand-200 hover:border-secondary'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="w-full h-full bg-black relative flex items-center justify-center">
                      <video src={media.url} className="w-full h-full object-cover opacity-60" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="w-6 h-6 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-sm">
                          <Play size={8} className="fill-primary text-primary ml-0.5" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img src={media.url} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details and selectors */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-secondary font-bold">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary leading-tight">
              {product.name}
            </h1>
            
            {/* Rating – dynamic from reviews */}
            {(() => {
              const avgRating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;
              const roundedAvg = Math.round(avgRating);
              return (
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      className={idx < roundedAvg ? 'fill-secondary text-secondary' : 'text-sand-300'}
                    />
                  ))}
                  <span className="text-xs text-primary/40 font-semibold ml-2">
                    {reviews.length > 0
                      ? `${avgRating.toFixed(1)} — ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                      : 'No reviews yet'}
                  </span>
                </div>
              );
            })()}

            {/* Pricing */}
            <div className="flex items-center space-x-3 pt-2">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-bold text-secondary">Rs. {parseFloat(product.discount_price).toFixed(0)}</span>
                  <span className="text-sm text-primary/30 line-through">Rs. {parseFloat(product.price).toFixed(0)}</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">Rs. {parseFloat(product.price).toFixed(0)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-primary/70 leading-relaxed font-light">
              {product.description || 'Crafted with premium organic materials. An expression of minimalist elegance designed to elevate your daily style.'}
            </p>
          </div>

          <div className="space-y-6 pt-4 border-t border-sand-200">
            {/* Size Selector */}
            {product.sizes && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary/60">Choose Size</span>
                <div className="flex gap-2">
                  {product.sizes.split(',').map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-10 h-10 border rounded text-xs font-bold uppercase transition-all ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-transparent border-sand-200 hover:border-secondary'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary/60">Choose Color</span>
                <div className="flex gap-2">
                  {product.colors.split(',').map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 border rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedColor === color ? 'bg-primary text-white border-primary' : 'bg-transparent border-sand-200 hover:border-secondary'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-sand-200 rounded-lg overflow-hidden h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-sand-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-sand-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-grow h-12 bg-primary hover:bg-secondary text-white font-semibold uppercase tracking-wider text-xs rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ShoppingBag size={14} />
                {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
              </button>

              <button
                onClick={() => toggleFavorite(product)}
                className={`w-12 h-12 border border-sand-200 hover:border-secondary rounded-lg flex items-center justify-center transition-all ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-primary'}`}
              >
                <Heart size={18} className={isWishlisted ? 'fill-red-500' : ''} />
              </button>
            </div>
          </div>

          {/* Brand Promise Details */}
          <div className="grid grid-cols-2 gap-4 bg-sand-50 p-4 rounded-xl border border-sand-200/50 text-xs">
            <span className="flex items-center gap-1.5 text-primary/70">
              <ShieldCheck size={16} className="text-secondary" />
              100% Organic Materials
            </span>
            <span className="flex items-center gap-1.5 text-primary/70">
              <ShieldCheck size={16} className="text-secondary" />
              Complimentary Returns
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="space-y-6 pt-10 border-t border-sand-200 text-xs">
        <h2 className="font-serif text-2xl font-bold text-primary">Customer Reviews</h2>
        
        {reviewsLoading ? (
          <div className="flex items-center gap-2 py-4">
            <RefreshCw size={14} className="animate-spin text-secondary" />
            <span className="text-primary/40 font-semibold uppercase tracking-wider">Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm font-light text-primary/60 italic">No reviews yet for this garment.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white/40 border border-sand-200/50 p-6 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{rev.user_name}</span>
                  <span className="text-[10px] text-primary/40 font-semibold">{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex text-secondary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < rev.rating ? 'fill-secondary text-secondary' : 'text-sand-300'} />
                  ))}
                </div>
                <p className="text-sm text-primary/80 font-light leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submit Review form */}
        <div className="bg-sand-50/50 border border-sand-200 p-6 rounded-2xl max-w-xl space-y-4 mt-8">
          <h3 className="font-serif text-lg font-bold text-primary">Write a Review</h3>
          
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {reviewSubmitMsg && (
                <div className="p-3 bg-secondary/15 border border-secondary/20 rounded-lg text-xs font-semibold text-secondary">
                  {reviewSubmitMsg}
                </div>
              )}
              
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="text-secondary hover:scale-110 transition-transform"
                    >
                      <Star size={20} className={star <= newRating ? 'fill-secondary' : 'text-sand-300'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Review Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your thoughts on fabric quality, fit, and elegance..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-white border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="bg-primary hover:bg-secondary text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                {submittingReview ? <RefreshCw size={12} className="animate-spin" /> : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="text-xs font-medium text-primary/50">
              Please <Link href="/auth" className="text-secondary underline font-bold uppercase">Sign In</Link> to share your experience with this luxury piece.
            </p>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-sand-200">
          <div className="text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-secondary font-bold">Similar Styles</span>
            <h2 className="font-serif text-2xl font-bold text-primary mt-1">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
