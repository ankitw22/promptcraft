import { useState, useRef, useEffect, useCallback } from 'react';
import { C } from '../constants/colors';
import { MODE_DETAILS } from '../constants/content';
import { optimizePrompt, generateThreadId } from '../services/api';
import SetupScreen from './screens/SetupScreen';
import ReviewScreen from './screens/ReviewScreen';
import FinalScreen from './screens/FinalScreen';

export default function PromptCoPilot() {
  // ── Setup state ──
  const [rawPrompt, setRawPrompt] = useState('');
  const [intentLock, setIntentLock] = useState(
    'Use clear language.\nMaintain original intent.\nImprove structure and clarity.'
  );
  const [modes, setModes] = useState([
    'context',
    'redundancy',
    'tokens',
    'contradiction',
    'structure',
  ]);
  const [chipDescs, setChipDescs] = useState({});
  const [chipEditing, setChipEditing] = useState({});

  const apiKey = import.meta.env.VITE_API_KEY;

  // ── Review state ──
  const [screen, setScreen] = useState('setup'); // setup | review | final
  const [phase, setPhase] = useState('idle');     // idle|loading|typing|done|error|awaiting
  const [v2Draft, setV2DraftRaw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Chunk / approval state ──
  const [pendingChunk, setPendingChunk] = useState(null); // full parsed API response
  const threadIdRef = useRef(generateThreadId());         // stable thread ID for the session

  const v2DraftRef = useRef('');
  const phaseRef = useRef('idle');
  const abortControllerRef = useRef(null);

  // ── Ref-synced setters ──
  const setV2Draft = useCallback((val) => {
    v2DraftRef.current = typeof val === 'function' ? val(v2DraftRef.current) : val;
    setV2DraftRaw(v2DraftRef.current);
  }, []);

  const setPhaseSync = useCallback((p) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  // ── Build variables for every API call ──
  const buildVariables = useCallback(() => {
    const variables = {
      OLD_PROMPT: rawPrompt,
      NEW_PROMPT: v2DraftRef.current || '',
    };
    if (intentLock?.trim()) variables.intent_lock = intentLock.trim();
    modes.forEach((mode) => {
      const desc = chipDescs[mode] || MODE_DETAILS[mode] || mode;
      if (desc?.trim()) variables[mode] = desc.trim();
    });
    return variables;
  }, [rawPrompt, intentLock, modes, chipDescs]);

  // ── Core API caller ──
  // isAppend: true when approving a chunk (accumulate), false on first call (replace)
  const callAPI = useCallback(
    async (userMessage, isAppend = false) => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        setPhaseSync('loading');

        // For append calls (approve/reject), don't stream into v2Draft —
        // the chunks are raw API JSON, not displayable content.
        // Only the final extracted text gets appended at the end.
        let isFirstChunk = true;

        const { text, parsed } = await optimizePrompt({
          userPrompt: userMessage,
          variables: buildVariables(),
          pauthkey: apiKey,
          threadId: threadIdRef.current,
          onChunk: isAppend ? null : (chunk) => {
            if (isFirstChunk) {
              setPhaseSync('typing');
              setIsLoading(false);
              isFirstChunk = false;
            }
            setV2Draft((prev) => prev + chunk);
          },
        });

        console.log('API complete. continue:', parsed?.continue, 'isAppend:', isAppend);

        if (isAppend) {
          // Append new chunk content to existing approved content
          setV2Draft((prev) => {
            const separator = prev && !prev.endsWith('\n') ? '\n' : '';
            return prev + separator + text;
          });
        } else {
          // First call — set directly
          setV2Draft(text);
        }

        if (parsed?.continue === true) {
          setPendingChunk(parsed);
          setPhaseSync('awaiting');
        } else {
          setPendingChunk(null);
          setPhaseSync('done');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('API Error:', error);
        setErrorMessage(error.message || 'Failed to optimize prompt. Please try again.');
        setPhaseSync('error');
        setIsLoading(false);
      }
    },
    [buildVariables, apiKey, setPhaseSync, setV2Draft]
  );

  // ── Initial optimise call ──
  const callOptimizeAPI = useCallback(() => {
    setV2Draft('');
    callAPI(rawPrompt);
  }, [rawPrompt, callAPI, setV2Draft]);

  // ── Approve chunk ──
  const approveChunk = useCallback(() => {
    if (!pendingChunk) return;
    const highlightId = pendingChunk.last_updated?.highlight_id;
    const action = JSON.stringify({ action: 'approve', highlight_id: highlightId });
    setPendingChunk(null);
    callAPI(action, true); // isAppend=true — keep previous approved content
  }, [pendingChunk, callAPI]);

  // ── Reject chunk ──
  const rejectChunk = useCallback(
    (reason) => {
      if (!pendingChunk) return;
      const highlightId = pendingChunk.last_updated?.highlight_id;
      const action = JSON.stringify({
        action: 'reject',
        highlight_id: highlightId,
        reason: reason || '',
      });
      setPendingChunk(null);
      callAPI(action, true); // isAppend=true — keep previous approved content
    },
    [pendingChunk, callAPI]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // ── Handlers ──
  const beginAnalysis = useCallback(() => {
    if (!rawPrompt.trim()) return;
    // New session — fresh thread
    threadIdRef.current = generateThreadId();
    setScreen('review');
    setPhaseSync('idle');
    setV2Draft('');
    setErrorMessage('');
    setPendingChunk(null);
    setTimeout(() => callOptimizeAPI(), 500);
  }, [rawPrompt, setPhaseSync, setV2Draft, callOptimizeAPI]);

  const retryOptimization = useCallback(() => {
    setV2Draft('');
    setErrorMessage('');
    setPendingChunk(null);
    callOptimizeAPI();
  }, [setV2Draft, callOptimizeAPI]);

  const startNewSession = useCallback(() => {
    setScreen('setup');
    setPhaseSync('idle');
    setV2Draft('');
    setErrorMessage('');
    setIsLoading(false);
    setPendingChunk(null);
    threadIdRef.current = generateThreadId();
  }, [setPhaseSync, setV2Draft]);

  const setV2DraftEditable = useCallback(
    (val) => {
      if (phase === 'typing' || phase === 'loading') return;
      setV2Draft(val);
    },
    [phase, setV2Draft]
  );

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        background: 'oklch(0.99 0.005 90)',
        color: C.text,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {screen === 'setup' && (
        <SetupScreen
          rawPrompt={rawPrompt}
          setRawPrompt={setRawPrompt}
          intentLock={intentLock}
          setIntentLock={setIntentLock}
          modes={modes}
          setModes={setModes}
          chipDescs={chipDescs}
          setChipDescs={setChipDescs}
          chipEditing={chipEditing}
          setChipEditing={setChipEditing}
          onBegin={beginAnalysis}
        />
      )}
      {screen === 'review' && (
        <ReviewScreen
          state={{
            rawPrompt,
            v2Draft,
            phase,
            isLoading,
            errorMessage,
            pendingChunk,
          }}
          handlers={{
            setV2Draft: setV2DraftEditable,
            onBegin: beginAnalysis,
            onRetry: retryOptimization,
            onNewSession: startNewSession,
            onViewFinal: () => setScreen('final'),
            onApprove: approveChunk,
            onReject: rejectChunk,
          }}
        />
      )}
      {screen === 'final' && (
        <FinalScreen
          rawPrompt={rawPrompt}
          v2Draft={v2Draft}
          setV2Draft={setV2DraftEditable}
          onNewSession={startNewSession}
        />
      )}
    </div>
  );
}
