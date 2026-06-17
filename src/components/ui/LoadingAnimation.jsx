import React from 'react';

/**
 * Beautiful loading animation similar to Gemini
 * Shows animated gradient bars while waiting for response
 */
function LoadingAnimation() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px',
        animation: 'fadeSlideIn 0.4s ease',
      }}
    >
      {/* Line 1 - Long */}
      <div
        style={{
          height: 16,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite ease-in-out',
          width: '90%',
        }}
      />

      {/* Line 2 - Medium */}
      <div
        style={{
          height: 16,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite ease-in-out 0.2s',
          width: '75%',
        }}
      />

      {/* Line 3 - Long */}
      <div
        style={{
          height: 16,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite ease-in-out 0.4s',
          width: '85%',
        }}
      />

      {/* Line 4 - Short */}
      <div
        style={{
          height: 16,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite ease-in-out 0.6s',
          width: '60%',
        }}
      />

      {/* Line 5 - Medium */}
      <div
        style={{
          height: 16,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite ease-in-out 0.8s',
          width: '70%',
        }}
      />

      {/* Line 6 - Long */}
      <div
        style={{
          height: 16,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite ease-in-out 1s',
          width: '80%',
        }}
      />

      {/* Line 7 - Short */}
      <div
        style={{
          height: 16,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite ease-in-out 1.2s',
          width: '55%',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact loading animation for smaller spaces
 */
export function CompactLoadingAnimation() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 16px',
      }}
    >
      {[90, 70, 85, 60].map((width, i) => (
        <div
          key={i}
          style={{
            height: 14,
            borderRadius: 7,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 2s infinite ease-in-out ${i * 0.2}s`,
            width: `${width}%`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Gemini-style thinking animation with dots
 */
export function ThinkingAnimation() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '16px',
        color: 'oklch(0.55 0.02 85)',
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'oklch(0.75 0.14 75)',
            animation: 'bounce 1.4s infinite ease-in-out',
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'oklch(0.75 0.14 75)',
            animation: 'bounce 1.4s infinite ease-in-out 0.2s',
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'oklch(0.75 0.14 75)',
            animation: 'bounce 1.4s infinite ease-in-out 0.4s',
          }}
        />
      </div>
      <span>Crafting your optimized prompt...</span>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingAnimation;
