import React from 'react';
import { C } from '../../constants/colors';

export function LogoIcon({ size = 26, radius = 6 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#E5A555',
        borderRadius: radius * 2, // More rounded like the original
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* P Letter - Two horizontal bars forming P shape */}
      <svg width={size * 0.85} height={size * 0.85} viewBox="0 0 100 100" fill="none">
        {/* Top bar of P (curved end) */}
        <rect
          x="25"
          y="25"
          width="40"
          height="12"
          rx="6"
          fill="white"
        />
        {/* Middle connecting part */}
        <rect
          x="55"
          y="25"
          width="12"
          height="20"
          fill="#E5A555"
        />
        {/* Right side of top P */}
        <rect
          x="55"
          y="25"
          width="20"
          height="12"
          rx="6"
          fill="white"
        />
        
        {/* Bottom bar of P */}
        <rect
          x="25"
          y="50"
          width="30"
          height="12"
          rx="6"
          fill="white"
        />
        
        {/* Sparkle star */}
        <g transform="translate(68, 65)">
          {/* Star shape */}
          <path
            d="M 0,-8 L 2,-2 L 8,0 L 2,2 L 0,8 L -2,2 L -8,0 L -2,-2 Z"
            fill="white"
          />
        </g>
      </svg>
    </div>
  );
}

export function ArrowRight({ color = 'white' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M5 3l4 4-4 4"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ color = 'white' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 7l3 3 5-5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Spinner({ color = C.amber }) {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: `2px solid oklch(0.90 0.02 85)`,
        borderTopColor: color,
        animation: 'spin 0.75s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}
