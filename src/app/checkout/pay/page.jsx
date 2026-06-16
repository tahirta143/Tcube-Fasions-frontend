'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Shield, Smartphone, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PaymentGatewaySimulator() {
  const router = useRouter();
  
  const [gateway, setGateway] = useState('paymob');
  const [intentId, setIntentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('0');
  const [wallet, setWallet] = useState('');
  const [status, setStatus] = useState('idle'); // idle, processing, success, failed
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setGateway(searchParams.get('gateway') || 'paymob');
    setIntentId(searchParams.get('intent_id') || '');
    setOrderId(searchParams.get('order_id') || '');
    setAmount(searchParams.get('amount') || '0');
    setWallet(searchParams.get('wallet') || '');
  }, []);

  const triggerPaymentStatus = async (outcome) => {
    setStatus('processing');
    setErrorMsg('');

    const payload = {
      payment_intent_id: intentId,
      status: outcome,
      signature: 'tcube_secure_webhook_hash_secret_key',
      gateway_response: {
        transaction_id: 'tx_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        wallet_number: wallet,
        auth_time: new Date().toISOString(),
        gateway_ref: gateway,
        simulated: true
      }
    };

    try {
      // Call backend webhook to confirm status update
      await axios.post(`${API_URL}/api/payments/webhook`, payload);
      
      if (outcome === 'success') {
        setStatus('success');
        setTimeout(() => {
          router.push(`/checkout?success=true&order_id=${orderId}`);
        }, 2000);
      } else {
        setStatus('failed');
        setTimeout(() => {
          router.push('/checkout?error=Payment+declined+by+user');
        }, 2000);
      }
    } catch (err) {
      console.error('Webhook trigger error:', err);
      setErrorMsg('Failed to sync payment state with backend. Check connection.');
      setStatus('idle');
    }
  };

  const handlePINSubmit = (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      setErrorMsg('Please enter a valid 4 to 6 digit Wallet PIN');
      return;
    }
    triggerPaymentStatus('success');
  };

  return (
    <div className="min-h-screen bg-sand-50/30 flex items-center justify-center p-6 text-xs text-primary font-sans leading-relaxed">
      <div className="max-w-md w-full bg-white border border-sand-200 rounded-[28px] shadow-lg overflow-hidden flex flex-col justify-between">
        
        {/* Gateway Header */}
        <div className="bg-primary p-6 text-white text-center space-y-2 relative">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/60">
            <span>Secure Checkout</span>
            <span className="flex items-center gap-1"><Shield size={10} /> Sandboxed</span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-wide">
            {gateway === 'paymob' ? 'Paymob Gateway' : 'Safepay Checkout'}
          </h2>
          <p className="text-[10px] font-mono opacity-85">{intentId || 'pi_reference'}</p>
        </div>

        {/* Transaction Content */}
        {status === 'idle' && (
          <div className="p-8 space-y-6">
            
            {/* Amount details */}
            <div className="text-center bg-sand-50 border border-sand-200/50 p-4 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary/40">Amount to authorize</span>
              <h3 className="text-2xl font-serif font-bold text-secondary">Rs. {Math.round(parseFloat(amount)).toLocaleString()}</h3>
            </div>

            {/* Simulated Push Notification description */}
            <div className="flex gap-3 items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-blue-800 text-[11px]">
              <Smartphone size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Simulating Wallet USSD Push</span>
                <p className="text-blue-900/70 font-light">
                  A verification request has been dispatched to EasyPaisa/JazzCash number <span className="font-bold font-mono text-blue-900">{wallet || '03xxxxxxxxx'}</span>. Please input your secure wallet PIN below to complete payment.
                </p>
              </div>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 text-red-600 font-semibold border border-red-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* PIN Form */}
            <form onSubmit={handlePINSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-primary/50">Enter Wallet PIN (Simulated)</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-lg tracking-[1.5em] bg-white border border-sand-200 p-3.5 rounded-xl focus:outline-none focus:border-secondary font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-grow py-3.5 bg-secondary hover:bg-primary text-white font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all shadow-md"
                >
                  Authorize Payment
                </button>
                <button
                  type="button"
                  onClick={() => triggerPaymentStatus('failed')}
                  className="px-6 py-3.5 border border-red-200 text-red-500 hover:bg-red-50 font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all"
                >
                  Decline
                </button>
              </div>
            </form>
          </div>
        )}

        {status === 'processing' && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <RefreshCw size={40} className="animate-spin text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary/50">Processing transaction authorization...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <CheckCircle2 size={48} className="text-green-600 animate-bounce" />
            <span className="text-sm font-serif font-bold text-primary">Payment Authorized Successfully</span>
            <p className="text-[10px] text-primary/40 uppercase tracking-widest">Returning to TCUBE Fashions...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <XCircle size={48} className="text-red-500 animate-pulse" />
            <span className="text-sm font-serif font-bold text-primary">Transaction Declined</span>
            <p className="text-[10px] text-primary/40 uppercase tracking-widest">Returning to store checkout...</p>
          </div>
        )}

        {/* Footer info */}
        <div className="border-t border-sand-100 bg-sand-50/50 p-4 text-center text-[9px] uppercase tracking-wider text-primary/30 font-semibold flex justify-center items-center gap-1">
          <span>PCI-DSS Compliant Encryption Standard</span>
        </div>
      </div>
    </div>
  );
}
