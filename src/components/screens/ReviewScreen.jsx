import React, { useRef, useEffect, useState } from 'react';
import { C } from '../../constants/colors';
import { LogoIcon, Spinner } from '../ui/Icons';
import Btn from '../ui/Button';
import { getRealtimeCoverage } from '../../utils/textMatcher';
import LoadingAnimation, { ThinkingAnimation } from '../ui/LoadingAnimation';

function ReviewScreen({ state, handlers }) {
  const {
    rawPrompt,
    v2Draft,
    phase,
    isLoading,
    errorMessage,
  } = state;

  const {
    setV2Draft,
    onBegin,
    onRetry,
    onNewSession,
    onViewFinal,
  } = handlers;

  const v2StreamRef = useRef(null);
  const [lineCoverage, setLineCoverage] = useState([]);

  const isTyping = phase === 'typing';
  const isLoadingPhase = phase === 'loading';
  const isDone = phase === 'done';
  const isError = phase === 'error';
  const showAsDiv = phase === 'typing' || phase === 'loading';

  const sessionTitle = rawPrompt.split('\n')[0].replace(/^#+\s*/, '') || 'Untitled Prompt';
  const lineCount = rawPrompt.split('\n').length;
  const v2LineCount = v2Draft.split('\n').length;

  // Auto-scroll v2 stream
  useEffect(() => {
    if (v2StreamRef.current) v2StreamRef.current.scrollTop = v2StreamRef.current.scrollHeight;
  }, [v2Draft]);

  // Update coverage in real-time as v2Draft changes
  useEffect(() => {
    if (v2Draft && v2Draft.length > 0) {
      const coverage = getRealtimeCoverage(rawPrompt, v2Draft);
      setLineCoverage(coverage);
    }
  }, [v2Draft, rawPrompt]);

  // Prompt rows with coverage highlighting
  const promptRows = rawPrompt.split('\n').map((t, i) => {
    const n = i + 1;
    const coverage = lineCoverage[i];
    const isCovered = coverage?.isCovered || false;
    const coverageScore = coverage?.coverageScore || 0;
    
    // Calculate background color based on coverage
    let backgroundColor = 'transparent';
    let textColor = C.text;
    
    if (isCovered && isDone) {
      // Fully covered - red background only (no strikethrough)
      backgroundColor = C.redBg;
      textColor = C.redT;
    } else if (coverageScore > 0.3 && (isTyping || isDone)) {
      // Partially covered - light red
      const opacity = Math.min(coverageScore, 0.8);
      backgroundColor = `rgba(255, 200, 200, ${opacity * 0.5})`;
      textColor = 'oklch(0.45 0.08 25)';
    }
    
    return (
      <div
        key={n}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '4px 0',
          marginBottom: 2,
          backgroundColor,
          transition: 'all 0.8s ease',
          borderRadius: 4,
        }}
      >
        <span
          style={{
            width: 32,
            minWidth: 32,
            textAlign: 'right',
            paddingRight: 12,
            fontSize: 11,
            color: isCovered ? 'oklch(0.72 0.06 25)' : 'oklch(0.80 0.01 85)',
            userSelect: 'none',
            lineHeight: '22px',
            flexShrink: 0,
            fontFamily: "'IBM Plex Mono', monospace",
            transition: 'color 0.8s ease',
          }}
        >
          {n}
        </span>
        <span
          style={{
            color: textColor,
            fontWeight: t.startsWith('#') ? 600 : 400,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '22px',
            paddingRight: 12,
            paddingLeft: 4,
            flex: 1,
            fontFamily: "'IBM Plex Mono', monospace",
            transition: 'all 0.8s ease',
          }}
        >
          {t || '\u00A0'}
        </span>
      </div>
    );
  });

  return (
    <>
      {/* Header */}
      <div
        style={{
          height: 52,
          minHeight: 52,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: 14,
          background: 'white',
          flexShrink: 0,
        }}
      >
        <div 
          onClick={onNewSession}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            flex: 1, 
            flexShrink: 0,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <LogoIcon size={26} radius={6} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>PromptCraft</span>
        </div>

        {/* Generating pill */}
        {(isLoadingPhase || isTyping) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: C.amberBg,
              padding: '4px 11px',
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                background: C.amber,
                borderRadius: '50%',
                animation: 'pulse 1s ease infinite',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: C.amberT,
                fontFamily: "'IBM Plex Mono', monospace",
                whiteSpace: 'nowrap',
              }}
            >
              {isLoadingPhase ? 'Calling AI...' : 'Generating…'}
            </span>
          </div>
        )}

        {/* Success pill */}
        {isDone && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: C.greenBg,
              padding: '4px 11px',
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                background: C.green,
                borderRadius: '50%',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: C.greenT,
                fontFamily: "'IBM Plex Mono', monospace",
                whiteSpace: 'nowrap',
              }}
            >
              Complete
            </span>
          </div>
        )}

        {/* Error pill */}
        {isError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: C.redBg,
              padding: '4px 11px',
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                background: C.red,
                borderRadius: '50%',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: C.redT,
                fontFamily: "'IBM Plex Mono', monospace",
                whiteSpace: 'nowrap',
              }}
            >
              Error
            </span>
          </div>
        )}
      </div>

      {/* Dual panels */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* LEFT: Original */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${C.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '9px 16px',
              borderBottom: `1px solid oklch(0.94 0.01 85)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'oklch(0.58 0.02 85)',
              }}
            >
              Original
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'oklch(0.72 0.02 85)',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {lineCount} lines
            </span>
          </div>
          <div id="prompt-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {promptRows}
          </div>
        </div>

        {/* RIGHT: Optimised v2 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'oklch(0.99 0.010 145)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '9px 16px',
              borderBottom: `1px solid oklch(0.91 0.05 145)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'oklch(0.42 0.12 145)',
                }}
              >
                Optimised v2
              </span>
              {(isLoadingPhase || isTyping) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: C.amberBg,
                    padding: '3px 9px',
                    borderRadius: 20,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      background: C.amber,
                      borderRadius: '50%',
                      animation: 'pulse 1s ease infinite',
                    }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 600, color: C.amberT }}>
                    {isLoadingPhase ? 'Loading' : 'Generating'}
                  </span>
                </div>
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'oklch(0.60 0.05 145)',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {v2LineCount} lines
            </span>
          </div>

          {/* During streaming: plain div (no React batching) */}
          {showAsDiv ? (
            <div
              ref={v2StreamRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 28px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                lineHeight: '24px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: C.text,
              }}
            >
              {/* Show loading animation when waiting for response */}
              {isLoadingPhase && <LoadingAnimation />}
              
              {/* Show thinking animation briefly before typing starts */}
              {isTyping && v2Draft.length === 0 && <ThinkingAnimation />}
              
              {/* Show actual content */}
              {v2Draft}
            </div>
          ) : (
            <textarea
              value={v2Draft}
              onChange={(e) => setV2Draft(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                padding: '20px 28px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                lineHeight: '24px',
                border: 'none',
                background: 'transparent',
                color: C.text,
              }}
              spellCheck={false}
            />
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          minHeight: 72,
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: 16,
          background: 'white',
          flexShrink: 0,
        }}
      >
        {/* Left info area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isLoadingPhase && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Spinner />
              <span style={{ fontSize: 13, color: C.muted }}>
                Calling AI agent to optimize your prompt...
              </span>
            </div>
          )}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Spinner />
              <span style={{ fontSize: 13, color: C.muted }}>
                AI is optimizing your prompt...
              </span>
            </div>
          )}
          {isError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: C.redBg,
                  color: C.red,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                ✕
              </div>
              <span style={{ fontSize: 13, color: C.redT }}>
                {errorMessage || 'An error occurred'}
              </span>
            </div>
          )}
          {isDone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: C.greenBg,
                  color: C.green,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: 13, color: C.text }}>
                Optimization complete! Review and copy your optimized prompt.
              </span>
            </div>
          )}
        </div>

        {/* Right action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {(isTyping || isLoadingPhase) && (
            <Btn onClick={onBegin} variant="outline">
              Restart
            </Btn>
          )}
          {isError && (
            <>
              <Btn onClick={onNewSession} variant="outline">
                Back to Setup
              </Btn>
              <Btn onClick={onRetry} variant="primary">
                Retry
              </Btn>
            </>
          )}
          {isDone && (
            <>
              <Btn onClick={onViewFinal} variant="primary">
                View Final v2 →
              </Btn>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ReviewScreen;
