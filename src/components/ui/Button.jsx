import React from 'react';
import { C } from '../../constants/colors';

function Btn({ onClick, variant = 'outline', children, disabled = false, style: extra = {} }) {
  const base = {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 13,
    cursor: disabled ? 'default' : 'pointer',
    border: 'none',
    borderRadius: 7,
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 500,
    transition: 'background 0.15s',
    ...extra,
  };

  const styles = {
    outline: {
      ...base,
      border: `1.5px solid ${C.border}`,
      background: 'transparent',
      color: 'oklch(0.48 0.02 85)',
    },
    primary: { ...base, background: C.amber, color: 'white' },
    dark: { ...base, background: C.text, color: 'white' },
    purple: { ...base, background: C.purple, color: 'white' },
    ghost: {
      ...base,
      background: 'oklch(0.96 0.02 85)',
      color: 'oklch(0.60 0.02 85)',
      cursor: 'default',
    },
  };

  return (
    <button onClick={onClick} style={styles[variant]} disabled={disabled}>
      {children}
    </button>
  );
}

export default Btn;
