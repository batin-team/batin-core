"use client";

import React from "react";

export function InteractiveHeroIllustration() {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }
        @keyframes pulse-glowing {
          0%, 100% { transform: scale(1); opacity: 0.85; filter: drop-shadow(0 0 4px #1D4ED8); }
          50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 12px #60A5FA); }
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.1); }
          28% { transform: scale(1); }
          42% { transform: scale(1.1); }
          70% { transform: scale(1); }
        }
        @keyframes draw-path {
          to { stroke-dashoffset: 0; }
        }
      `}} />

      <svg viewBox="0 0 400 400" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background glowing gradients */}
        <circle cx="200" cy="200" r="120" fill="url(#bg-glow)" opacity="0.25" style={{ animation: 'float-slow 6s ease-in-out infinite', transformOrigin: '200px 200px' }} />
        <circle cx="240" cy="160" r="100" fill="url(#bg-glow-2)" opacity="0.2" style={{ animation: 'float-reverse 8s ease-in-out infinite', transformOrigin: '240px 160px' }} />

        {/* Floating abstract decorative elements */}
        <circle cx="80" cy="100" r="10" fill="#2563EB" opacity="0.3" style={{ animation: 'float-slow 5s ease-in-out infinite', transformOrigin: '80px 100px' }} />
        <circle cx="320" cy="300" r="14" fill="#60A5FA" opacity="0.2" style={{ animation: 'float-reverse 7s ease-in-out infinite', transformOrigin: '320px 300px' }} />
        
        {/* Animated connecting nodes */}
        <g style={{ animation: 'float-medium 6s ease-in-out infinite', transformOrigin: '200px 200px' }}>
          {/* Connection lines */}
          <path d="M100 220 Q200 130 300 220" stroke="url(#line-grad-1)" strokeWidth="4" strokeLinecap="round" strokeDasharray="400" strokeDashoffset="400" style={{ animation: 'draw-path 3s cubic-bezier(0.4, 0, 0.2, 1) forwards' }} />
          <path d="M130 180 Q200 280 270 180" stroke="url(#line-grad-2)" strokeWidth="3" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300" style={{ animation: 'draw-path 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards', animationDelay: '0.5s' }} />
          <path d="M200 120 V280" stroke="url(#line-grad-3)" strokeWidth="2" strokeDasharray="8 8" opacity="0.4" />

          {/* Central glowing heart-pulse element */}
          <circle cx="200" cy="200" r="36" fill="url(#circle-grad)" style={{ animation: 'pulse-glowing 4s ease-in-out infinite', transformOrigin: '200px 200px' }} />
          <path d="M200 211C200 211 169 193 169 173C169 163 177 155 187 155C193 155 197 158 200 160.5C203 158 207 155 213 155C223 155 231 163 231 173C231 193 200 211 200 211Z" fill="white" style={{ animation: 'heartbeat 2.5s ease-in-out infinite', transformOrigin: '200px 183px' }} />

          {/* Outer orbital nodes */}
          <circle cx="100" cy="220" r="8" fill="#1D4ED8" style={{ animation: 'float-slow 3s ease-in-out infinite', transformOrigin: '100px 220px' }} />
          <circle cx="300" cy="220" r="8" fill="#60A5FA" style={{ animation: 'float-reverse 4s ease-in-out infinite', transformOrigin: '300px 220px' }} />
          <circle cx="130" cy="180" r="6" fill="#3B82F6" />
          <circle cx="270" cy="180" r="6" fill="#1D4ED8" />
        </g>

        <defs>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="bg-glow-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="circle-grad" x1="164" y1="164" x2="236" y2="236" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="line-grad-1" x1="100" y1="130" x2="300" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="line-grad-2" x1="130" y1="180" x2="270" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="line-grad-3" x1="200" y1="120" x2="200" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
