'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    coupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    discountAmount,
    cartTotal
  } = useCart();

  const { user } = useAuth();
  const router = useRouter();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponInput) return;

    const result = await applyCoupon(couponInput);
    if (result.success) {
      const discountText = result.type === 'percentage' ? `${result.value}%` : `Rs. ${result.value}`;
      setCouponSuccess(`Coupon applied! Saved ${discountText}`);
      setCouponInput('');
    } else {
      setCouponError(result.message);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
        <div className="bg-sand-100 p-6 rounded-full text-secondary animate-bounce">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-primary">Your Shopping Cart is Empty</h1>
          <p className="text-xs text-primary/40 uppercase tracking-widest font-semibold max-w-sm">
            You haven't added any luxury pieces to your cart yet. Explore our latest capsule releases.
          </p>
        </div>
        <Link href="/shop" className="bg-primary hover:bg-secondary text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-lg transition-colors">
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-sand-200 pb-4">
        <h1 className="font-serif text-3xl font-bold text-primary">Shopping Cart</h1>
        <p className="text-xs text-primary/40 uppercase tracking-wider font-semibold mt-1">Review your selections before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Item Rows */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => {
            const itemPrice = item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price);
            return (
              <div key={`${item.productId}-${item.size}-${item.color}-${idx}`} className="glass-card p-5 flex items-center gap-4 hover:translate-y-0 hover:shadow-md">
                {/* Product Thumbnail */}
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-sand-100 flex-shrink-0 border border-sand-200/50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <Link href={`/product/${item.productId}`} className="hover:text-secondary text-sm font-semibold text-primary truncate block font-serif">
                    {item.name}
                  </Link>
                  
                  {/* Selected Variants */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-primary/50 uppercase tracking-wider font-semibold">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="p-1 border border-sand-200 rounded hover:bg-sand-100 transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-xs font-semibold px-2 w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="p-1 border border-sand-200 rounded hover:bg-sand-100 transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Pricing & Removal */}
                <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="text-primary/40 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">Rs. {Math.round(itemPrice * item.quantity)}</span>
                    {item.quantity > 1 && (
                      <span className="block text-[10px] text-primary/40">Rs. {Math.round(itemPrice)} each</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Calculations Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/60 border border-sand-200/50 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-sand-200 pb-3">Order Summary</h3>

            {/* Price Calculations */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-primary/70">
                <span>Subtotal</span>
                <span>Rs. {Math.round(cartSubtotal)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-secondary">
                  <div className="flex items-center gap-1">
                    <span>Coupon ({coupon.code})</span>
                    <button onClick={removeCoupon} className="text-[10px] text-red-500 underline uppercase tracking-widest font-bold">Remove</button>
                  </div>
                  <span>-Rs. {Math.round(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-primary/70">
                <span>Shipping</span>
                <span className="text-secondary font-medium">Free</span>
              </div>

              <div className="flex justify-between text-base font-bold text-primary pt-3 border-t border-sand-200">
                <span>Total</span>
                <span>Rs. {Math.round(cartTotal)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-primary/60 mb-2">Have a promo code?</span>
              <div className="flex border border-sand-200 rounded-lg overflow-hidden focus-within:border-secondary transition-colors">
                <input
                  type="text"
                  placeholder="e.g. WELCOME20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="bg-white text-xs w-full px-3 py-2.5 focus:outline-none"
                />
                <button type="submit" className="bg-sand-200 hover:bg-secondary hover:text-white px-4 text-xs font-bold uppercase tracking-wider transition-colors">
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-500 text-[10px] mt-1.5 font-semibold">{couponError}</p>}
              {couponSuccess && <p className="text-secondary text-[10px] mt-1.5 font-semibold">{couponSuccess}</p>}
            </form>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-primary hover:bg-secondary text-white font-semibold uppercase tracking-wider text-xs rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
            >
              Proceed to Checkout
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2 justify-center text-[10px] text-primary/40 uppercase tracking-widest font-bold">
            <ShieldCheck size={14} className="text-secondary" />
            <span>Guaranteed Safe Checkouts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
