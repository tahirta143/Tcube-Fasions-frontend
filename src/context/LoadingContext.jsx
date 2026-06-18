'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LoaderSpinner from '@/components/LoaderSpinner';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const activeRequests = useRef(0);
  const delayTimeout = useRef(null);

  // Show loader with a 250ms debounce to prevent flashing on fast requests
  const showLoader = () => {
    activeRequests.current++;
    if (activeRequests.current === 1) {
      if (delayTimeout.current) clearTimeout(delayTimeout.current);
      delayTimeout.current = setTimeout(() => {
        setIsLoading(true);
      }, 250);
    }
  };

  // Hide loader when requests are complete
  const hideLoader = () => {
    activeRequests.current = Math.max(0, activeRequests.current - 1);
    if (activeRequests.current === 0) {
      if (delayTimeout.current) clearTimeout(delayTimeout.current);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Axios global request interceptor
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        showLoader();
        return config;
      },
      (error) => {
        hideLoader();
        return Promise.reject(error);
      }
    );

    // Axios global response interceptor
    const resInterceptor = axios.interceptors.response.use(
      (response) => {
        hideLoader();
        return response;
      },
      (error) => {
        hideLoader();
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount to prevent duplicates
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
      if (delayTimeout.current) clearTimeout(delayTimeout.current);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
      
      {/* Dynamic API Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[99998] bg-white/70 dark:bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-fade-in pointer-events-auto">
          <LoaderSpinner message="Syncing with Catalog..." className="scale-75 md:scale-90" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
