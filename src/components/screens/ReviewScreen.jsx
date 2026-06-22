import { useRef, useEffect, useState } from 'react';
import { C } from '../../constants/colors';
import { LogoIcon, Spinner } from '../ui/Icons';
import Btn from '../ui/Button';
import { getRealtimeCoverage } from '../../utils/textMatcher';

// Minimal skeleton — 3 lines, shown only before first content
function SkeletonLines() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 28px' }}>
      {[88, 70, 80].map((w, i) => (
        <div
          key={i}
          style={{
            height: 13,
            borderRadius: 6,
            background: 'linear-gradient(90deg, #ebebeb 25%, #e0e0e0 50%, #ebebeb 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.6s infinite ease-in-out ${i * 0.15}s`,
            width: `${w}%`,
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function ReviewScreen({ state, handlers }) {
  const { rawPrompt, v2Draft, phase, errorMessage, pendingChunk } = state;
  const { setV2Draft, onBegin, onRetry, onNewSession, onViewFinal, onApprove, onReject } = handlers;

  const v2StreamRef = useRef(null);
  const [lineCoverage, setLineCoverage] = useState([]);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isLoading  = phase === 'loading';
  const isTyping   = phase === 'typing';
  const isDone     = phase === 'done';
  const isError    = phase === 'error';
  const isAwaiting = phase === 'awaiting';

  const lineCount   = rawPrompt.split('\n').length;
  const v2LineCount = v2Draft.split('\n').length;

  const addedLines   = pendingChunk?.changes?.added_lines   ?? [];
  const removedLines = pendingChunk?.changes?.removed_lines ?? [];
  const sectionName  = pendingChunk?.migration?.section_name ?? '';
  const progress     = pendingChunk?.remaining_summary?.progress_percentage ?? null;

  // Auto-scroll while streaming
  useEffect(() => {
    if (v2StreamRef.current && (isTyping || isLoading)) {
      v2StreamRef.current.scrollTop = v2StreamRef.current.scrollHeight;
    }
  }, [v2Draft, isTyping, isLoading]);

  // Coverage highlighting
  useEffect(() => {
    if (v2Draft) {
      setLineCoverage(getRealtimeCoverage(rawPrompt, v2Draft));
    }
  }, [v2Draft, rawPrompt]);

  // Reset reject UI when chunk changes
  useEffect(() => {
    setRejectMode(false);
    setRejectReason('');
  }, [pendingChunk]);

  const handleRejectSubmit = () => {
    onReject(rejectReason);
    setRejectMode(false);
    setRejectReason('');
  };

  // ── Status dot + label in header ──
  const statusLabel = isLoading  ? { dot: '#bbb',    text: 'Calling AI…'     }
                    : isTyping   ? { dot: '#bbb',    text: 'Generating…'     }
                    : isAwaiting ? { dot: '#6b7280', text: 'Review chunk'    }
                    : isDone     ? { dot: '#22c55e', text: 'Complete'        }
                    : isError    ? { dot: '#ef4444', text: 'Error'           }
                    : null;

  // ── Original prompt rows ──
  const promptRows = rawPrompt.split('\n').map((t, i) => {
    const coverage = lineCoverage[i];
    const isCovered = coverage?.isCovered || false;
    const score = coverage?.coverageScore || 0;
    const showHighlight = isCovered && (isDone || isAwaiting || isLoading || isTyping);
    const showPartial = score > 0.3 && (isTyping || isDone || isAwaiting || isLoading);

    return (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '3px 0',
          borderRadius: 3,
          backgroundColor: showHighlight
            ? '#fef2f2'
            : showPartial
            ? `rgba(254,226,226,${Math.min(score, 0.8) * 0.6})`
            : 'transparent',
          transition: 'background 0.6s ease',
        }}
      >
        <span
          style={{
            width: 32,
            minWidth: 32,
            textAlign: 'right',
            paddingRight: 12,
            fontSize: 11,
            color: showHighlight ? '#fca5a5' : '#d1d5db',
            userSelect: 'none',
            lineHeight: '22px',
            fontFamily: "'IBM Plex Mono', monospace",
            flexShrink: 0,
          }}
        >
          {i + 1}
        </span>
        <span
          style={{
            color: showHighlight ? '#b91c1c' : C.text,
            fontWeight: t.startsWith('#') ? 600 : 400,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '22px',
            paddingRight: 12,
            paddingLeft: 4,
            flex: 1,
            fontSize: 13,
            fontFamily: "'IBM Plex Mono', monospace",
            transition: 'color 0.6s ease',
          }}
        >
          {t || '\u00A0'}
        </span>
      </div>
    );
  });

  // ── Diff view (awaiting) ──
  const DiffView = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
      {/* Section + progress */}
      {sectionName && (
        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#6b7280',
          }}
        >
          <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {sectionName}
          </span>
          {progress !== null && <span>{progress}%</span>}
        </div>
      )}

      {/* Removed lines */}
      {removedLines.map((line, i) => (
        <div
          key={`rm-${i}`}
          style={{
            display: 'flex',
            gap: 8,
            padding: '4px 10px',
            marginBottom: 2,
            borderRadius: 4,
            background: '#fef2f2',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            lineHeight: '20px',
            color: '#b91c1c',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <span style={{ flexShrink: 0, opacity: 0.5, userSelect: 'none' }}>−</span>
          <span>{line}</span>
        </div>
      ))}

      {/* Added lines */}
      {addedLines.map((line, i) => (
        <div
          key={`add-${i}`}
          style={{
            display: 'flex',
            gap: 8,
            padding: '4px 10px',
            marginBottom: 2,
            borderRadius: 4,
            background: '#f0fdf4',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            lineHeight: '20px',
            color: '#166534',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <span style={{ flexShrink: 0, opacity: 0.5, userSelect: 'none' }}>+</span>
          <span>{line}</span>
        </div>
      ))}

      {addedLines.length === 0 && removedLines.length === 0 && (
        <span style={{ fontSize: 12, color: '#9ca3af' }}>No changes.</span>
      )}

      {/* Approve / Reject inline below the diff */}
      {!rejectMode && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Btn
            onClick={() => setRejectMode(true)}
            variant="outline"
            style={{ fontSize: 12, color: '#ef4444', borderColor: '#fca5a5' }}
          >
            Reject
          </Btn>
          <Btn onClick={onApprove} variant="dark" style={{ fontSize: 12 }}>
            Approve →
          </Btn>
        </div>
      )}

      {/* Reject reason input inline */}
      {rejectMode && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            autoFocus
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRejectSubmit();
              if (e.key === 'Escape') setRejectMode(false);
            }}
            placeholder="Reason (optional) — Enter to send"
            style={{
              flex: 1,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #fca5a5',
              outline: 'none',
              color: '#111',
              background: '#fef2f2',
            }}
          />
          <Btn onClick={handleRejectSubmit} variant="primary" style={{ background: '#ef4444', fontSize: 12 }}>
            Send
          </Btn>
          <Btn onClick={() => setRejectMode(false)} variant="outline" style={{ fontSize: 12 }}>
            Cancel
          </Btn>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Header ── */}
      <div
        style={{
          height: 48,
          minHeight: 48,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <div
          onClick={onNewSession}
          style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, cursor: 'pointer', userSelect: 'none' }}
        >
          <LogoIcon size={24} radius={6} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>PromptCraft</span>
        </div>

        {statusLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {(isLoading || isTyping) ? (
              <Spinner />
            ) : (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusLabel.dot }} />
            )}
            <span style={{ fontSize: 12, color: '#6b7280', fontFamily: "'IBM Plex Mono', monospace" }}>
              {statusLabel.text}
            </span>
          </div>
        )}
      </div>

      {/* ── Dual panels ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Original */}
        <div
          style={{
            flex: 1, minWidth: 0,
            display: 'flex', flexDirection: 'column',
            borderRight: `1px solid ${C.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '7px 16px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af' }}>
              Original
            </span>
            <span style={{ fontSize: 10, color: '#d1d5db', fontFamily: "'IBM Plex Mono', monospace" }}>
              {lineCount} lines
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
            {promptRows}
          </div>
        </div>

        {/* RIGHT: Optimised / Diff */}
        <div
          style={{
            flex: 1, minWidth: 0,
            display: 'flex', flexDirection: 'column',
            background: '#fafafa',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '7px 16px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af' }}>
              Optimised
            </span>
            <span style={{ fontSize: 10, color: '#d1d5db', fontFamily: "'IBM Plex Mono', monospace" }}>
              {isAwaiting
                ? `+${addedLines.length} −${removedLines.length}`
                : `${v2LineCount} lines`}
            </span>
          </div>

          {/* Content area */}
          <div
            ref={v2StreamRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* ── AWAITING: approved content on top, diff below ── */}
            {isAwaiting && (
              <>
                {v2Draft.length > 0 && (
                  <div
                    style={{
                      padding: '20px 24px 12px',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 13,
                      lineHeight: '24px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#166534',
                    }}
                  >
                    {v2Draft}
                  </div>
                )}
                <div
                  style={{
                    margin: '0 20px 20px',
                    borderTop: v2Draft.length > 0 ? `1px solid ${C.border}` : 'none',
                    paddingTop: v2Draft.length > 0 ? 16 : 0,
                  }}
                >
                  <DiffView />
                </div>
              </>
            )}

            {/* ── NOT awaiting: show accumulated approved content ── */}
            {!isAwaiting && v2Draft.length > 0 && (
              isDone ? (
                <textarea
                  value={v2Draft}
                  onChange={(e) => setV2Draft(e.target.value)}
                  style={{
                    flex: 1,
                    width: '100%',
                    padding: '20px 24px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    lineHeight: '24px',
                    border: 'none',
                    background: 'transparent',
                    color: '#166534',
                    resize: 'none',
                    outline: 'none',
                    minHeight: 0,
                  }}
                  spellCheck={false}
                />
              ) : (
                <div
                  style={{
                    padding: '20px 24px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    lineHeight: '24px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: '#166534',
                  }}
                >
                  {v2Draft}
                </div>
              )
            )}

            {/* ── Skeleton — loading with no content yet ── */}
            {(isLoading || isTyping) && v2Draft.length === 0 && <SkeletonLines />}

            {/* ── Skeleton below content — loading after first chunk approved ── */}
            {(isLoading || isTyping) && v2Draft.length > 0 && (
              <div style={{ padding: '8px 24px 16px' }}>
                <SkeletonLines />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: `1px solid ${C.border}`, background: '#fff', flexShrink: 0 }}>
        {/* Action row */}
        <div
          style={{
            minHeight: 60,
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: 12,
          }}
        >
          {/* Left status text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {(isLoading || isTyping) && (
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                Optimizing your prompt…
              </span>
            )}
            {isAwaiting && (
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {sectionName ? `"${sectionName}" — approve or reject to continue` : 'Review this chunk'}
                {progress !== null && <span style={{ color: '#d1d5db', marginLeft: 8 }}>{progress}%</span>}
              </span>
            )}
            {isError && (
              <span style={{ fontSize: 12, color: '#ef4444' }}>
                {errorMessage || 'Something went wrong'}
              </span>
            )}
            {isDone && (
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                Done — review or copy your optimized prompt.
              </span>
            )}
          </div>

          {/* Right buttons */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {(isTyping || isLoading) && (
              <Btn onClick={onBegin} variant="outline" style={{ fontSize: 12 }}>Restart</Btn>
            )}
            {isError && (
              <>
                <Btn onClick={onNewSession} variant="outline" style={{ fontSize: 12 }}>Back</Btn>
                <Btn onClick={onRetry} variant="primary" style={{ fontSize: 12 }}>Retry</Btn>
              </>
            )}
            {isDone && (
              <Btn onClick={onViewFinal} variant="dark" style={{ fontSize: 12 }}>
                View Final →
              </Btn>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ReviewScreen;
