'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Shield, Trash2, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useTheme } from '@/context/ThemeContext';

export default function ChatWidget() {
  const { isOpen, setIsOpen, messages, sendMessage, clearChat, isTyping, error, isAdmin } = useChat();
  const { mounted } = useTheme();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  if (!mounted) return null;

  const accentGradient = isAdmin
    ? 'from-amber-600 via-secondary to-amber-700 dark:from-amber-500 dark:via-secondary dark:to-amber-600'
    : 'from-secondary via-[#C4A882] to-secondary dark:from-secondary dark:via-[#D4C3B3] dark:to-[#A08C75]';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/20 dark:bg-black/50 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none md:pointer-events-none"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed z-[80] flex flex-col overflow-hidden
              inset-x-4 bottom-24 top-auto max-h-[min(560px,calc(100vh-7rem))]
              md:inset-x-auto md:bottom-24 md:right-6 md:w-[400px] md:max-h-[min(620px,calc(100vh-8rem))]
              rounded-2xl border shadow-[var(--shadow-lux)]
              bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl
              dark:bg-[rgba(8,8,8,0.92)] dark:border-white/10"
          >
            {/* Header */}
            <div
              className={`relative px-5 py-4 border-b border-sand-200/50 dark:border-white/10 bg-gradient-to-r ${accentGradient}`}
            >
              <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    {isAdmin ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-white font-semibold text-base tracking-wide">
                      {isAdmin ? 'Nova · Admin AI' : 'Aria · Style Assistant'}
                    </h3>
                    <p className="text-white/80 text-xs font-sans">
                      {isAdmin ? 'Store operations & dashboard help' : 'Women · Men · Kids · Shopping help'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={clearChat}
                    title="Clear chat"
                    className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px] chat-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-background rounded-br-md dark:bg-white dark:text-black'
                        : 'bg-sand-100 text-primary rounded-bl-md dark:bg-white/8 dark:text-foreground dark:border dark:border-white/10'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-sand-100 dark:bg-white/8 dark:border dark:border-white/10 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                    <span className="text-xs text-primary/60 dark:text-foreground/60">Thinking...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center text-xs text-red-500 dark:text-red-400 px-2">{error}</div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-sand-200/50 dark:border-white/10 bg-sand-50/50 dark:bg-black/40"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={isAdmin ? 'Ask about orders, products, reports...' : 'Ask about styles, sizes, shipping...'}
                  rows={1}
                  className="flex-1 resize-none rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#121212] border border-sand-200 dark:border-white/15 text-primary dark:text-foreground placeholder:text-primary/40 dark:placeholder:text-foreground/40 focus:outline-none focus:border-secondary dark:focus:border-secondary max-h-24"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all
                    bg-gradient-to-br ${accentGradient} text-white shadow-md
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:scale-105 active:scale-95`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-primary/40 dark:text-foreground/40 mt-2 text-center">
                Powered by Grok AI · {isAdmin ? 'Admin mode' : 'Customer support'}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={isOpen ? 'Close chat' : 'Open AI assistant'}
        className={`fixed z-[80] bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-full
          flex items-center justify-center shadow-[var(--shadow-lux)]
          bg-gradient-to-br ${accentGradient}
          border-2 border-white/30 dark:border-white/20
          transition-shadow hover:shadow-2xl
          ${isOpen ? 'ring-2 ring-secondary/50 ring-offset-2 ring-offset-background dark:ring-offset-black' : ''}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative">
              <MessageCircle className="w-6 h-6 text-white" />
              <Sparkles className="w-3 h-3 text-white/90 absolute -top-1 -right-1" />
            </motion.span>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background dark:border-black animate-pulse" />
        )}
      </motion.button>
    </>
  );
}
