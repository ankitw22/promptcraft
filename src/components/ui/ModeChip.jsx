import React, { useRef, useEffect } from 'react';
import { C } from '../../constants/colors';
import { MODES } from '../../constants/content';

function ModeChip({ id, desc, isEditing, onEdit, onSave, onRemove }) {
  const m = MODES.find((x) => x.id === id);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: 'white',
        border: `1.5px solid ${isEditing ? C.amber : 'oklch(0.88 0.06 85)'}`,
        borderRadius: 20,
        padding: '5px 8px 5px 12px',
        fontSize: 12,
        color: C.text,
        animation: 'fadeSlideIn 0.2s ease both',
        transition: 'border-color 0.15s',
      }}
    >
      <span style={{ fontWeight: 600, color: C.amberT, flexShrink: 0 }}>
        {m?.label}
      </span>
      <span style={{ color: 'oklch(0.75 0.02 85)', flexShrink: 0 }}> — </span>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          defaultValue={desc}
          onBlur={(e) => onSave(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur();
            if (e.key === 'Escape') onSave(desc);
          }}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: 12,
            color: C.text,
            background: 'transparent',
            minWidth: 180,
            flex: 1,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        />
      ) : (
        <span style={{ color: 'oklch(0.45 0.02 85)', flex: 1 }}>{desc}</span>
      )}
      {!isEditing && (
        <button
          onClick={onEdit}
          title="Edit description"
          style={{
            marginLeft: 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: 'oklch(0.65 0.02 85)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            padding: 0,
            flexShrink: 0,
          }}
        >
          ✎
        </button>
      )}
      <button
        onClick={onRemove}
        style={{
          marginLeft: 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: 'none',
          background: 'oklch(0.90 0.03 85)',
          color: 'oklch(0.50 0.02 85)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          flexShrink: 0,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default ModeChip;
