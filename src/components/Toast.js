import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toasts } = useAuth();
  return (
    <div id="tc">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}
