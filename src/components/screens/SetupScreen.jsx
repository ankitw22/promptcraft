import React from 'react';
import { C } from '../../constants/colors';
import { LogoIcon } from '../ui/Icons';
import { MODES, MODE_DETAILS } from '../../constants/content';
import ModeChip from '../ui/ModeChip';

function SetupScreen({
  rawPrompt,
  setRawPrompt,
  intentLock,
  setIntentLock,
  modes,
  setModes,
  chipDescs,
  setChipDescs,
  chipEditing,
  setChipEditing,
  onBegin,
}) {
  const toggleMode = (id) =>
    setModes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px 48px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
          alignSelf: 'flex-start',
          maxWidth: 620,
          width: '100%',
        }}
      >
        <LogoIcon size={32} radius={8} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px' }}>
            PromptCraft
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>AI-assisted prompt review</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 620, animation: 'fadeSlideIn 0.3s ease both' }}>
        {/* Prompt textarea */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'oklch(0.45 0.02 85)',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            Your Prompt
            <span
              style={{
                fontWeight: 400,
                textTransform: 'none',
                letterSpacing: 0,
                color: 'oklch(0.65 0.02 85)',
                fontSize: 11,
              }}
            >
              Paste your prompt to optimize
            </span>
          </div>
          <textarea
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            style={{
              width: '100%',
              minHeight: 220,
              padding: '12px 14px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12.5,
              lineHeight: 1.65,
              border: `1.5px solid ${C.border}`,
              borderRadius: 8,
              background: 'white',
              color: C.text,
            }}
            placeholder="Paste your prompt here..."
            spellCheck={false}
          />
        </div>

        {/* Optimisation Guidelines */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'oklch(0.45 0.02 85)',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Optimisation Guidelines
            <span
              style={{
                fontWeight: 400,
                textTransform: 'none',
                letterSpacing: 0,
                color: 'oklch(0.65 0.02 85)',
              }}
            >
              Style, structure &amp; formatting preferences
            </span>
          </div>
          <div
            style={{
              border: `1.5px solid ${C.border}`,
              borderRadius: 8,
              background: 'white',
              overflow: 'hidden',
            }}
          >
            <textarea
              value={intentLock}
              onChange={(e) => setIntentLock(e.target.value)}
              style={{
                width: '100%',
                minHeight: 72,
                padding: '10px 14px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12.5,
                lineHeight: 1.6,
                border: 'none',
                background: 'transparent',
                color: C.text,
                display: 'block',
              }}
              placeholder="e.g. Use active voice. Prefer bullet points. Keep under 500 tokens. Do not change the original tone."
            />
            {modes.length > 0 && (
              <div
                style={{
                  borderTop: `1px solid oklch(0.92 0.01 85)`,
                  padding: '8px 12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  background: 'oklch(0.98 0.005 90)',
                }}
              >
                {modes.map((id) => (
                  <ModeChip
                    key={id}
                    id={id}
                    desc={chipDescs[id] ?? MODE_DETAILS[id] ?? ''}
                    isEditing={chipEditing[id] === true}
                    onEdit={() => setChipEditing((prev) => ({ ...prev, [id]: true }))}
                    onSave={(val) => {
                      setChipDescs((prev) => ({ ...prev, [id]: val }));
                      setChipEditing((prev) => ({ ...prev, [id]: false }));
                    }}
                    onRemove={() => toggleMode(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review Modes */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'oklch(0.45 0.02 85)',
              marginBottom: 10,
            }}
          >
            Review Modes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {MODES.map((m) => {
              const on = modes.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMode(m.id)}
                  style={{
                    padding: '9px 8px',
                    border: `1.5px solid ${on ? C.amber : C.border}`,
                    borderRadius: 7,
                    background: on ? C.amberBg : 'white',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: on ? C.amberT : 'oklch(0.50 0.02 85)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onBegin}
          disabled={!rawPrompt.trim()}
          style={{
            width: '100%',
            padding: '13px 20px',
            background: !rawPrompt.trim() ? 'oklch(0.85 0.02 85)' : C.amber,
            color: 'white',
            border: 'none',
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: !rawPrompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: !rawPrompt.trim() ? 0.6 : 1,
          }}
        >
          {!rawPrompt.trim() ? 'Enter Prompt First' : 'Begin Analysis'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="white"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default SetupScreen;
