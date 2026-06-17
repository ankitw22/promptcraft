import React, { useState } from 'react';
import { C } from '../../constants/colors';
import Btn from './Button';

function ApiKeyModal({ isOpen, onClose, onSave, currentApiKey }) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: '24px',
          maxWidth: 500,
          width: '90%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
            color: C.text,
          }}
        >
          API Configuration
        </h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          Enter your Gateway AI API key to enable prompt optimization.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'oklch(0.45 0.02 85)',
              marginBottom: 8,
            }}
          >
            API Key (pauthkey)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your pauthkey..."
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1.5px solid ${C.border}`,
              borderRadius: 7,
              fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace",
              color: C.text,
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') onClose();
            }}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn onClick={onClose} variant="outline">
            Cancel
          </Btn>
          <Btn onClick={handleSave} variant="primary" disabled={!apiKey.trim()}>
            Save API Key
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyModal;
