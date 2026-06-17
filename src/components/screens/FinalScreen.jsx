import React, { useState } from 'react';
import { C } from '../../constants/colors';
import { LogoIcon } from '../ui/Icons';
import Btn from '../ui/Button';

function FinalScreen({ rawPrompt, v2Draft, setV2Draft, onNewSession }) {
  const [copied, setCopied] = useState(false);
  const lineCount = rawPrompt.split('\n').length;
  const v2LineCount = v2Draft.split('\n').length;

  const copyV2 = () => { 
    try {
      navigator.clipboard.writeText(v2Draft).catch(() => {});
    } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }; 

  return (
    <>
      <div
        style={{
          height: 52,
          minHeight: 52,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
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
            minWidth: 0,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <LogoIcon size={26} radius={6} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Prompt Version 2</span>
          <div
            style={{
              background: C.greenBg,
              color: C.greenT,
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            Ready
          </div>
        </div>
        <Btn onClick={onNewSession} variant="outline" style={{ flexShrink: 0 }}>
          New Session
        </Btn>
        <Btn onClick={copyV2} variant="dark" style={{ flexShrink: 0 }}>
          {copied ? 'Copied!' : 'Copy v2'}
        </Btn>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Original (read-only) */}
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
                color: 'oklch(0.70 0.02 85)',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {lineCount} lines
            </span>
          </div>
          <textarea
            readOnly
            value={rawPrompt}
            style={{
              flex: 1,
              width: '100%',
              padding: '20px 28px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              lineHeight: '24px',
              border: 'none',
              background: 'transparent',
              color: 'oklch(0.55 0.02 85)',
            }}
            spellCheck={false}
          />
        </div>

        {/* v2 (editable) */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'oklch(0.99 0.012 145)',
          }}
        >
          <div
            style={{
              padding: '9px 16px',
              borderBottom: `1px solid oklch(0.91 0.04 145)`,
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
                color: 'oklch(0.45 0.12 145)',
              }}
            >
              Version 2 — edit freely
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'oklch(0.50 0.08 145)',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {v2LineCount} lines
            </span>
          </div>
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
        </div>
      </div>
    </>
  );
}

export default FinalScreen;
