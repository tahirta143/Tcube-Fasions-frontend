'use client';

import React from 'react';
import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, toggleFavorite, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  const handleQuickAdd = (product) => {
    const defaultSize = product.sizes ? product.sizes.split(',')[0] : 'S';
    const defaultColor = product.colors ? product.colors.split(',')[0] : 'Beige';
    addToCart(product, 1, defaultSize, defaultColor);
    alert(`Added "${product.name}" to cart.`);
  };

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center animate-fade-in">
        <div className="bg-sand-100 p-6 rounded-full text-secondary animate-pulse">
          <Heart size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-primary">Your Wishlist is Empty</h1>
          <p className="text-xs text-primary/40 uppercase tracking-widest font-semibold max-w-sm">
            Save pieces you love to keep track of their availability and styles.
          </p>
        </div>
        <Link href="/shop" className="bg-primary hover:bg-secondary text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-lg transition-colors">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-sand-200 pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Favorites List</h1>
          <p className="text-xs text-primary/40 uppercase tracking-wider font-semibold mt-1">Saved capsule pieces and styles</p>
        </div>
        <button
          onClick={clearFavorites}
          className="text-[10px] text-red-500 font-bold uppercase tracking-wider border border-red-100 bg-red-50/50 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
        >
          Clear All
        </button>
      </div>

      {/* Grid of Liked Products */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {favorites.map((product) => {
          const imageUrl = product.images ? product.images.split(',')[0] : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop';
          const hasDiscount = product.discount_price !== null && parseFloat(product.discount_price) > 0;
          
          return (
            <div key={product.id} className="group flex flex-col w-full bg-transparent overflow-hidden relative">
              {/* Product Image Frame */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-sand-50 border border-sand-200/20 shadow-sm">
                
                {/* Remove button */}
                <button
                  onClick={() => toggleFavorite(product)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-red-50 text-red-500 shadow-md transition-all hover:scale-105"
                  title="Remove from favorites"
                >
                  <Trash2 size={13} />
                </button>

                {/* Main Product Image */}
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[800ms]"
                  />
                </Link>

                {/* Quick Add overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center z-10">
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="w-full py-3 bg-white/95 hover:bg-primary hover:text-white text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all duration-300"
                  >
                    <ShoppingBag size={11} />
                    Quick Add
                  </button>
                </div>
              </div>

              {/* Details Area */}
              <div className="pt-3.5 flex flex-col space-y-1">
                <span className="text-[9px] uppercase tracking-[0.15em] text-secondary font-bold">{product.category}</span>
                <Link href={`/product/${product.id}`} className="hover:text-secondary transition-colors block">
                  <h3 className="font-serif text-sm font-semibold text-primary truncate">{product.name}</h3>
                </Link>
                <div className="flex items-center space-x-2 pt-1">
                  {hasDiscount ? (
                    <>
                      <span className="text-sm font-bold text-[#A08C75]">Rs. {Math.round(parseFloat(product.discount_price))}</span>
                      <span className="text-xs text-primary/30 line-through">Rs. {Math.round(parseFloat(product.price))}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-[#1E1E1E]">Rs. {Math.round(parseFloat(product.price))}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
