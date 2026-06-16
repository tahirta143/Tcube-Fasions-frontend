'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Heart, ShoppingBag, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [hovered, setHovered] = useState(false);
  const isWishlisted = isFavorite(product.id);

  const imageUrl = product.images ? product.images.split(',')[0] : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop';
  
  const hasDiscount = product.discount_price !== null && parseFloat(product.discount_price) > 0;
  const displayPrice = hasDiscount ? product.discount_price : product.price;

  const defaultSize = product.sizes ? product.sizes.split(',')[0] : '';
  const defaultColor = product.colors ? product.colors.split(',')[0] : '';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1, defaultSize, defaultColor);
    alert(`Added "${product.name}" to cart.`);
  };

  return (
    <div 
      className="group flex flex-col w-full bg-transparent overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image Frame */}
      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-sand-50 block shadow-sm border border-sand-200/20">
        
        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 z-10 bg-black/35 flex items-center justify-center">
            <span className="bg-white/95 text-primary text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Sale / Discount Badge */}
        {hasDiscount && product.stock > 0 && (
          <span className="absolute top-3.5 left-3.5 z-10 bg-secondary text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            Sale
          </span>
        )}

        {/* Wishlist Heart Icon (always visible on top right, turns red on active) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className={`absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center transition-all shadow-sm ${isWishlisted ? 'text-red-500' : 'text-primary/70 md:opacity-0 md:group-hover:opacity-100'}`}
        >
          <Heart size={12} className={isWishlisted ? 'fill-red-500' : ''} />
        </button>

        {/* Main Product Image (zoom on hover) */}
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[800ms] ease-out"
          loading="lazy"
        />

        {/* Luxury slide-up Quick Add button */}
        {product.stock > 0 && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex justify-center z-10">
            <button
              onClick={handleQuickAdd}
              className="w-full py-3 bg-white/95 hover:bg-primary hover:text-white text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all duration-300"
            >
              <ShoppingBag size={11} />
              Quick Add
            </button>
          </div>
        )}
      </Link>

      {/* Details Area Below Image */}
      <div className="pt-3.5 flex flex-col text-left space-y-1">
        
        {/* Category & Star Rating */}
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.15em] text-secondary font-bold">
          <span>{product.category}</span>
          <div className="flex items-center space-x-0.5 text-secondary">
            <Star size={10} className="fill-[#A08C75] text-[#A08C75]" />
            <span className="font-bold text-primary">4.9</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.id}`} className="hover:text-secondary transition-colors block">
          <h3 className="font-serif text-sm font-semibold text-primary truncate">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div>
            {hasDiscount ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-sm font-bold text-[#A08C75]">Rs. {parseFloat(product.discount_price).toFixed(0)}</span>
                <span className="text-xs text-primary/30 line-through">Rs. {parseFloat(product.price).toFixed(0)}</span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-primary">Rs. {parseFloat(product.price).toFixed(0)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
