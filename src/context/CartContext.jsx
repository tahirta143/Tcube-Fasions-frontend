'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code: 'WELCOME20', discount: 0.2 }
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('tcube_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (err) {
        console.error('Error parsing cart data:', err);
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tcube_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (product, quantity = 1, size = '', color = '') => {
    setCart((prevCart) => {
      // Look for identical product, size, and color combination
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      // Add as new item
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          discount_price: product.discount_price,
          image: product.images ? product.images.split(',')[0] : '/images/placeholder.jpg',
          quantity,
          size,
          color,
          maxStock: product.stock
        }
      ];
    });
  };

  const removeFromCart = (productId, size = '', color = '') => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
    );
  };

  const updateQuantity = (productId, size = '', color = '', quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          // Clamp quantity to maximum stock if available
          const finalQty = item.maxStock !== undefined ? Math.min(quantity, item.maxStock) : quantity;
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      const res = await axios.post(`${API_URL}/api/coupons/validate`, { code });
      const couponData = res.data;

      setCoupon({
        code: couponData.code,
        type: couponData.discount_type,
        value: parseFloat(couponData.discount_value)
      });

      return { 
        success: true, 
        type: couponData.discount_type,
        value: parseFloat(couponData.discount_value)
      };
    } catch (err) {
      console.error('Validate coupon error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Invalid coupon code' 
      };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Subtotal (using discount price if available)
  const cartSubtotal = cart.reduce((total, item) => {
    const itemPrice = item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price);
    return total + itemPrice * item.quantity;
  }, 0);

  // Discount value
  const discountAmount = coupon 
    ? (coupon.type === 'percentage' ? cartSubtotal * (coupon.value / 100) : coupon.value)
    : 0;

  // Final Total
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Items counter
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        discountAmount,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
