'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Truck, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, coupon } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  // Shipping Form State
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingEmail: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingPhone: ''
  });

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, stripe, easypaisa, jazzcash, bank
  const [transactionId, setTransactionId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  
  // Card Input state (simulated)
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });

  // Page States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  // Authenticate user & sync info
  useEffect(() => {
    if (!user) {
      router.push('/auth?redirect=checkout');
    } else {
      setFormData((prev) => ({
        ...prev,
        shippingName: user.name || '',
        shippingEmail: user.email || '',
        shippingPhone: user.phone || '',
        shippingAddress: user.address || ''
      }));
    }
  }, [user]);

  // Check for success redirects from payment gateway
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get('success');
    const orderId = searchParams.get('order_id');
    const err = searchParams.get('error');
    if (success === 'true' && orderId) {
      setCreatedOrderId(orderId);
      setOrderPlaced(true);
      clearCart();
    } else if (err) {
      setError(err);
    }
  }, []);

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="font-serif text-2xl font-bold">Your cart is empty</h2>
        <button onClick={() => router.push('/shop')} className="text-xs uppercase tracking-widest text-secondary font-bold hover:underline">
          Go Shop Items
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.shippingName || !formData.shippingEmail || !formData.shippingAddress || !formData.shippingCity || !formData.shippingPostalCode || !formData.shippingPhone) {
      setError('Please fill in all shipping fields');
      return false;
    }
    
    // Payment specific validation
    if (paymentMethod === 'bank') {
      if (!transactionId || !senderAccount) {
        setError('Please enter the bank Transfer Reference ID and Sender Account details');
        return false;
      }
    }
    if (['easypaisa', 'jazzcash'].includes(paymentMethod)) {
      if (!senderAccount || senderAccount.length !== 11 || !/^\d+$/.test(senderAccount)) {
        setError('Please enter your 11-digit mobile number that you sent payment from');
        return false;
      }
    }
    if (paymentMethod === 'stripe') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        setError('Please fill in credit card details');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);

    // Map cart items to backend format
    const items = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price),
      size: item.size,
      color: item.color
    }));

    const orderData = {
      items,
      totalAmount: cartTotal,
      ...formData,
      paymentMethod,
      transactionId: paymentMethod === 'bank' ? transactionId : null,
      senderAccount: paymentMethod === 'bank' ? senderAccount : null,
      couponCode: coupon ? coupon.code : null
    };

    if (['easypaisa', 'jazzcash'].includes(paymentMethod)) {
      try {
        const res = await axios.post(`${API_URL}/api/payments/create-intent`, {
          items,
          totalAmount: cartTotal,
          ...formData,
          paymentMethod,
          walletNumber: senderAccount,
          couponCode: coupon ? coupon.code : null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Redirect the user to the gateway checkout simulation page
        router.push(res.data.redirectUrl);
      } catch (err) {
        console.error('Payment intent generation failed:', err);
        setError(err.response?.data?.message || 'Failed to initialize payment gateway.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCreatedOrderId(res.data.orderId);
      clearCart();
      setOrderPlaced(true);
    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please check stock availability.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center max-w-md mx-auto animate-fade-in">
        <div className="text-secondary">
          <CheckCircle2 size={64} className="animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-primary">Order Placed Successfully</h1>
          <p className="text-xs uppercase tracking-widest text-secondary font-bold">Order ID: #{createdOrderId}</p>
          <p className="text-sm text-primary/60 leading-relaxed font-light pt-2">
            Thank you for shopping with TCUBE Fashions. Your receipt has been logged. You can monitor delivery status in your dashboard.
          </p>
        </div>
        <div className="flex gap-4 w-full pt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-grow py-3.5 bg-primary hover:bg-secondary text-white font-semibold uppercase tracking-wider text-xs rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/shop')}
            className="flex-grow py-3.5 bg-sand-200 hover:bg-secondary hover:text-white text-primary font-semibold uppercase tracking-wider text-xs rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-sand-200 pb-4">
        <h1 className="font-serif text-3xl font-bold text-primary">Secure Checkout</h1>
        <p className="text-xs text-primary/40 uppercase tracking-wider font-semibold mt-1">Review items and finalize delivery instructions</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Shipping Form & Payments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping details */}
          <div className="bg-white/60 border border-sand-200/50 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-sand-200 pb-3 flex items-center gap-2">
              <Truck size={16} /> Delivery Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Full Name</label>
                <input
                  type="text"
                  name="shippingName"
                  required
                  value={formData.shippingName}
                  onChange={handleInputChange}
                  className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Email Address</label>
                <input
                  type="email"
                  name="shippingEmail"
                  required
                  value={formData.shippingEmail}
                  onChange={handleInputChange}
                  className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Street Address</label>
              <input
                type="text"
                name="shippingAddress"
                required
                value={formData.shippingAddress}
                onChange={handleInputChange}
                className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">City</label>
                <input
                  type="text"
                  name="shippingCity"
                  required
                  value={formData.shippingCity}
                  onChange={handleInputChange}
                  className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Postal Code</label>
                <input
                  type="text"
                  name="shippingPostalCode"
                  required
                  value={formData.shippingPostalCode}
                  onChange={handleInputChange}
                  className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Contact Phone</label>
                <input
                  type="text"
                  name="shippingPhone"
                  required
                  value={formData.shippingPhone}
                  onChange={handleInputChange}
                  className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="bg-white/60 border border-sand-200/50 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-sand-200 pb-3 flex items-center gap-2">
              <CreditCard size={16} /> Payment Method
            </h3>

            {/* Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'cod', label: 'Cash on Delivery' },
                { id: 'stripe', label: 'Stripe / Card' },
                { id: 'easypaisa', label: 'EasyPaisa' },
                { id: 'jazzcash', label: 'JazzCash' },
                { id: 'bank', label: 'Bank Transfer' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(p.id);
                    setError('');
                  }}
                  className={`text-[10px] font-bold p-3 border rounded-lg text-center transition-all ${paymentMethod === p.id ? 'bg-primary text-white border-primary' : 'bg-transparent border-sand-200 text-primary/70 hover:border-secondary'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Conditional Payment Information Box */}
            {paymentMethod === 'stripe' && (
              <div className="bg-sand-50 p-4 rounded-xl border border-sand-200 space-y-3 animate-fade-in">
                <span className="block text-xs font-semibold text-primary">Card details (Stripe sandbox mode)</span>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    name="number"
                    placeholder="Card Number (XXXX-XXXX-XXXX-XXXX)"
                    value={cardDetails.number}
                    onChange={handleCardChange}
                    className="text-xs bg-white border border-sand-200 p-2.5 rounded-lg w-full focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      className="text-xs bg-white border border-sand-200 p-2.5 rounded-lg w-1/2 focus:outline-none"
                    />
                    <input
                      type="text"
                      name="cvc"
                      placeholder="CVC"
                      value={cardDetails.cvc}
                      onChange={handleCardChange}
                      className="text-xs bg-white border border-sand-200 p-2.5 rounded-lg w-1/2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'easypaisa' && (
              <div className="bg-secondary/15 p-5 rounded-2xl border border-secondary/20 space-y-3 animate-fade-in text-xs">
                <span className="block text-xs font-bold text-secondary uppercase tracking-widest">EasyPaisa Manual Transfer</span>
                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200 font-semibold text-[10px] uppercase tracking-wider">
                  ⚠️ Automated checkout is currently under maintenance. We will fix it soon.
                </div>
                <p className="text-[11px] text-primary/70 leading-relaxed font-light">
                  To place your order, please manually transfer <span className="font-bold text-primary">Rs. {Math.round(cartTotal)}</span> to our EasyPaisa Mobile Wallet Account:
                  <span className="block text-sm font-bold text-secondary mt-1 font-mono">03254828492</span>
                  <span className="block text-[10px] text-primary/60 font-semibold">(Account Title: Muhammad Tahir / TCUBE Fashions)</span>
                </p>
                <div className="flex flex-col space-y-1 pt-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-primary/50">Your EasyPaisa Account Number (Paid From)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="e.g. 03254828492"
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    className="text-xs bg-white border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary w-full font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'jazzcash' && (
              <div className="bg-secondary/15 p-5 rounded-2xl border border-secondary/20 space-y-3 animate-fade-in text-xs">
                <span className="block text-xs font-bold text-secondary uppercase tracking-widest">JazzCash Manual Transfer</span>
                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200 font-semibold text-[10px] uppercase tracking-wider">
                  ⚠️ Automated checkout is currently under maintenance. We will fix it soon.
                </div>
                <p className="text-[11px] text-primary/70 leading-relaxed font-light">
                  To place your order, please manually transfer <span className="font-bold text-primary">Rs. {Math.round(cartTotal)}</span> to our EasyPaisa Mobile Wallet Account:
                  <span className="block text-sm font-bold text-secondary mt-1 font-mono">03254828492</span>
                  <span className="block text-[10px] text-primary/60 font-semibold">(Account Title: Muhammad Tahir / TCUBE Fashions)</span>
                </p>
                <div className="flex flex-col space-y-1 pt-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-primary/50">Your JazzCash Account Number (Paid From)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="e.g. 03007654321"
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    className="text-xs bg-white border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary w-full font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/25 space-y-3 animate-fade-in">
                <span className="block text-xs font-bold text-secondary uppercase tracking-wider">Bank Transfer Instruction</span>
                <p className="text-xs text-primary/70 leading-relaxed font-light">
                  Please transfer the sum of <span className="font-bold">Rs. {Math.round(cartTotal)}</span> to our Bank Account: 
                  <span className="font-bold text-primary block mt-1">Allied Bank Limited</span>
                  <span className="font-bold text-primary block">Account No: 123456789012 (Title: TCUBE Fashions)</span>
                  Enter Bank Reference Code / Transfer Receipt details below.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <input
                    type="text"
                    placeholder="Transfer Reference ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="text-xs bg-white border border-sand-200 p-2.5 rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Sender Account No / Name"
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    className="text-xs bg-white border border-sand-200 p-2.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/60 border border-sand-200/50 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-sand-200 pb-3">Review Items</h3>

            {/* Products List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <img src={item.image} alt={item.name} className="w-10 h-12 rounded object-cover border border-sand-200" />
                  <div className="flex-grow min-w-0">
                    <span className="font-serif font-bold text-primary truncate block">{item.name}</span>
                    <span className="text-[9px] text-primary/50 block font-semibold">Qty: {item.quantity} | {item.size} / {item.color}</span>
                  </div>
                  <span className="font-semibold text-primary flex-shrink-0">Rs. {Math.round((item.discount_price || item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-sand-200 pt-4 flex justify-between items-center">
              <span className="text-sm font-bold text-primary">Final Order Total</span>
              <span className="text-lg font-bold text-secondary">Rs. {Math.round(cartTotal)}</span>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Submission Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-secondary text-white font-semibold uppercase tracking-wider text-xs rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
