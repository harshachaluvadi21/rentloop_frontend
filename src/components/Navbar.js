import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();
  return (
    <nav>
      <div className="nav-logo" onClick={() => window.location.reload()}>
        Rent<span>Loop</span>
      </div>
      <div className="nav-links" />
      <div className="nav-right">
        {!user ? (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onOpenAuth('login')}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('register')}>Get Started</button>
          </>
        ) : (
          <div className="nav-user">
            <div className="av" style={{ background: user.color }}>{user.firstName?.[0]}</div>
            <span>{user.firstName}</span>
            {user.role === 'admin' && (
              <span style={{ fontSize: '.7rem', background: 'rgba(240,124,43,.15)', color: 'var(--orange)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(240,124,43,.3)' }}>Admin</span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
}
