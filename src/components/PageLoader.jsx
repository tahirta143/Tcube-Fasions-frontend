'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function PageLoader() {
  const [count, setCount] = useState(0);
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const spinnerRef = useRef(null);
  const brandRef = useRef(null);

  useEffect(() => {
    // 1. Lock scrolling on body
    document.body.style.overflow = 'hidden';

    // 2. Object to animate count value
    const countObj = { value: 0 };
    
    const ctx = gsap.context(() => {
      // 3. Timeline for loader entrance and counter animation
      const tl = gsap.timeline({
        onComplete: () => {
          // 4. Loader exit animation
          gsap.timeline({
            onComplete: () => {
              // Restore body overflow and notify layout to reveal content
              document.body.style.overflow = '';
              
              if (typeof window !== 'undefined') {
                window.__website_loaded = true;
                window.dispatchEvent(new CustomEvent('website-loaded'));
              }
            }
          })
          .to(spinnerRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: 'power2.in'
          })
          .to(counterRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: 'power2.in'
          }, '-=0.3')
          .to(brandRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: 'power2.in'
          }, '-=0.3')
          .to(containerRef.current, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', // Premium shutter slide-up effect
            duration: 0.8,
            ease: 'power4.inOut'
          }, '-=0.2')
          .to(containerRef.current, {
            display: 'none',
            duration: 0
          });
        }
      });

      // Animate the numeric value count
      tl.to(countObj, {
        value: 100,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate: () => {
          setCount(Math.floor(countObj.value));
        }
      });

      // Subtle pulse and float on spinner
      gsap.to(spinnerRef.current, {
        y: -10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

    }, containerRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="loader-wrapper"
      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
    >
      {/* 1. Kinetic Spinner (from user CSS structure) */}
      <div ref={spinnerRef} className="loader-main-container">
        {/* Static background tracks */}
        <div className="loaders" style={{ position: 'absolute' }}>
          <div className="loader"></div>
          <div className="loader"></div>
          <div className="loader"></div>
          <div className="loader"></div>
          <div className="loader"></div>
          <div className="loader"></div>
          <div className="loader"></div>
          <div className="loader"></div>
          <div className="loader"></div>
        </div>
        {/* Animated gliding balls */}
        <div className="loadersB" style={{ position: 'absolute' }}>
          <div className="loaderA"><div className="ball0"></div></div>
          <div className="loaderA"><div className="ball1"></div></div>
          <div className="loaderA"><div className="ball2"></div></div>
          <div className="loaderA"><div className="ball3"></div></div>
          <div className="loaderA"><div className="ball4"></div></div>
          <div className="loaderA"><div className="ball5"></div></div>
          <div className="loaderA"><div className="ball6"></div></div>
          <div className="loaderA"><div className="ball7"></div></div>
          <div className="loaderA"><div className="ball8"></div></div>
          <div className="loaderA"><div className="ball9"></div></div>
        </div>
      </div>

      {/* 2. Brand Name Header */}
      <div ref={brandRef} className="text-center mt-4 select-none">
        <h2 className="text-xs uppercase tracking-[0.4em] font-bold text-primary/60">
          TCUBE FASHIONS
        </h2>
        <p className="text-[9px] uppercase tracking-[0.2em] text-[#A08C75] mt-1.5 font-light">
          Minimalist Luxury Capsule
        </p>
      </div>

      {/* 3. Numeric 1-100 counter display */}
      <div ref={counterRef} className="absolute bottom-12 right-12 text-right select-none font-serif">
        <span className="text-6xl md:text-8xl font-semibold tracking-tight text-[#A08C75]">
          {count}
        </span>
        <span className="text-sm font-sans font-bold tracking-widest text-[#A08C75]/80 ml-1">
          %
        </span>
      </div>
    </div>
  );
}
