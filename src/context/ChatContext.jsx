'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

const ChatContext = createContext();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const WELCOME_CUSTOMER =
  "Hello! I'm Aria, your TCUBE Fashions style assistant. I can help you find women's, men's, and kids pieces, sizing advice, shipping info, and order tracking. How can I help you shop today?";

const WELCOME_ADMIN =
  "Hello! I'm Nova, your admin operations assistant. I can help with products, orders, coupons, banners, reviews, reports, and anything on your admin dashboard. What would you like to manage?";

const WELCOME_GUEST =
  "Welcome to TCUBE Fashions! I'm Aria, your shopping assistant. Ask me about our collections, sizing, shipping, or finding the perfect outfit. How can I help?";

function getStorageKey(role) {
  if (role === 'admin') return 'tcube_chat_admin';
  return 'tcube_chat_customer';
}

function loadMessages(role) {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(getStorageKey(role));
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return [{ role: 'assistant', content: role === 'admin' ? WELCOME_ADMIN : role === 'user' ? WELCOME_CUSTOMER : WELCOME_GUEST }];
}

export function ChatProvider({ children }) {
  const { user, token } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const chatMode = user?.role === 'admin' ? 'admin' : 'customer';

  useEffect(() => {
    setMessages(loadMessages(chatMode));
    setError(null);
  }, [chatMode, user?.id]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(getStorageKey(chatMode), JSON.stringify(messages));
    }
  }, [messages, chatMode]);

  const sendMessage = useCallback(
    async (content) => {
      const trimmed = content.trim();
      if (!trimmed || isTyping) return;

      const userMessage = { role: 'user', content: trimmed };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsTyping(true);
      setError(null);

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: nextMessages,
            page: pathname
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to get a response');
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping, token, pathname]
  );

  const clearChat = useCallback(() => {
    const welcome =
      chatMode === 'admin' ? WELCOME_ADMIN : user ? WELCOME_CUSTOMER : WELCOME_GUEST;
    setMessages([{ role: 'assistant', content: welcome }]);
    setError(null);
  }, [chatMode, user]);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        messages,
        sendMessage,
        clearChat,
        isTyping,
        error,
        chatMode,
        isAdmin: chatMode === 'admin'
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
