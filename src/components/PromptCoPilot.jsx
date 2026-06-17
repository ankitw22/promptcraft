import { useState, useRef, useEffect, useCallback } from 'react';
import { C } from '../constants/colors';
import { MODE_DETAILS } from '../constants/content';
import { optimizePrompt } from '../services/api';
import SetupScreen from './screens/SetupScreen';
import ReviewScreen from './screens/ReviewScreen';
import FinalScreen from './screens/FinalScreen';

export default function PromptCoPilot() {
  // Setup state
  const [rawPrompt, setRawPrompt] = useState('');
  const [intentLock, setIntentLock] = useState('Use clear language.\nMaintain original intent.\nImprove structure and clarity.');
  const [modes, setModes] = useState([
    'context',
    'redundancy',
    'tokens',
    'contradiction',
    'structure',
  ]);
  const [chipDescs, setChipDescs] = useState({});
  const [chipEditing, setChipEditing] = useState({});
  
  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_API_KEY;

  // Review state
  const [screen, setScreen] = useState('setup'); // setup | review | final
  const [phase, setPhase] = useState('idle'); // idle|loading|typing|done|error
  const [v2Draft, setV2DraftRaw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const v2DraftRef = useRef('');
  const phaseRef = useRef('idle');
  const abortControllerRef = useRef(null);

  // Keep refs in sync
  const setV2Draft = useCallback((val) => {
    v2DraftRef.current = typeof val === 'function' ? val(v2DraftRef.current) : val;
    setV2DraftRaw(v2DraftRef.current);
  }, []);

  const setPhaseSync = useCallback((p) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  // Call the API with streaming
  const callOptimizeAPI = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setPhaseSync('loading');
      setV2Draft(''); // Clear previous content

      // Create variables object with separate fields
      const variables = {};
      
      // Only add intent_lock if user has entered something
      if (intentLock && intentLock.trim()) {
        variables.intent_lock = intentLock.trim();
      }

      // Add each selected mode as a separate variable
      modes.forEach(mode => {
        // If user has edited this chip, use their custom description
        // Otherwise use the default description that's shown in the UI
        const description = chipDescs[mode] || MODE_DETAILS[mode] || mode;
        
        if (description && description.trim()) {
          variables[mode] = description.trim();
        }
      });

      console.log('Calling API with streaming...');
      console.log('Variables being sent:', variables);

      // Set to typing phase immediately when first chunk arrives
      let isFirstChunk = true;

      const response = await optimizePrompt({
        userPrompt: rawPrompt,
        variables: variables, // Pass variables object directly
        pauthkey: apiKey,
        onChunk: (chunk) => {
          // Real-time streaming - add each chunk as it arrives
          if (isFirstChunk) {
            console.log('First chunk received, starting stream display');
            setPhaseSync('typing');
            setIsLoading(false);
            isFirstChunk = false;
          }
          // Directly append chunk to display (no typewriter delay)
          setV2Draft(prev => prev + chunk);
        }
      });

      console.log('Stream complete. Total length:', response.length);
      
      // Ensure we have the full response displayed
      setV2Draft(response);
      setPhaseSync('done');
      setIsLoading(false);
    } catch (error) {
      console.error('API Error:', error);
      setErrorMessage(error.message || 'Failed to optimize prompt. Please try again.');
      setPhaseSync('error');
      setIsLoading(false);
    }
  }, [rawPrompt, intentLock, modes, chipDescs, apiKey, setPhaseSync, setV2Draft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // ── Handlers ──
  const beginAnalysis = useCallback(() => {
    if (!rawPrompt.trim()) return;
    
    // Reset state
    setScreen('review');
    setPhaseSync('idle');
    setV2Draft('');
    setErrorMessage('');

    // Start API call after a short delay for UX
    setTimeout(() => {
      callOptimizeAPI();
    }, 500);
  }, [rawPrompt, setPhaseSync, setV2Draft, callOptimizeAPI]);

  const retryOptimization = useCallback(() => {
    setV2Draft('');
    setErrorMessage('');
    callOptimizeAPI();
  }, [setV2Draft, callOptimizeAPI]);

  const startNewSession = useCallback(() => {
    // Reset all state and go back to setup screen
    setScreen('setup');
    setPhaseSync('idle');
    setV2Draft('');
    setErrorMessage('');
    setIsLoading(false);
  }, [setScreen, setPhaseSync, setV2Draft]);

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
          }}
          handlers={{
            setV2Draft: setV2DraftEditable,
            onBegin: beginAnalysis,
            onRetry: retryOptimization,
            onNewSession: startNewSession,
            onViewFinal: () => setScreen('final'),
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
