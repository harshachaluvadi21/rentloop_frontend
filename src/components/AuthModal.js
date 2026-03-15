import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ mode, onClose }) {
  const { login, register, toast } = useAuth();
  const [view, setView] = useState(mode);
  const [role, setRole] = useState('renter');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email:'', password:'', firstName:'', lastName:'', phone:'', location:'' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const doLogin = async () => {
    if (!form.email || !form.password) { toast('Fill all fields', 'e'); return; }
    setLoading(true);
    try { const u = await login(form.email, form.password); toast(`Welcome back, ${u.firstName}! 👋`, 's'); onClose(); }
    catch (e) { toast(e.response?.data?.error || 'Invalid email or password', 'e'); }
    finally { setLoading(false); }
  };

  const doRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) { toast('Fill all required fields', 'e'); return; }
    if (!form.phone) { toast('Phone number is required', 'e'); return; }
    if (!/^[6-9]\d{9}$/.test(form.phone)) { toast('Enter a valid 10-digit Indian mobile number', 'e'); return; }
    setLoading(true);
    try { const u = await register({ ...form, role }); toast(`Welcome, ${u.firstName}! 🎉`, 's'); onClose(); }
    catch (e) { toast(e.response?.data?.error || 'Registration failed', 'e'); }
    finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {view === 'login' ? (
          <>
            <div className="modal-title">Welcome back</div>
            <div className="modal-sub">Sign in to your RentLoop account</div>
            <div className="fg"><label className="fl">Email</label>
              <input className="fi" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="fg"><label className="fl">Password</label>
              <input className="fi" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} /></div>
            <button className="btn btn-primary" style={{ width:'100%', marginTop:6, justifyContent:'center' }} onClick={doLogin} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <div className="msw">No account? <a onClick={() => setView('register')}>Create one</a></div>
            <div style={{ marginTop:14, padding:13, background:'rgba(240,124,43,.06)', border:'1px solid rgba(240,124,43,.15)', borderRadius:10, fontSize:'.76rem', color:'var(--muted)' }}>
              <strong style={{ color:'var(--orange)' }}>Demo accounts:</strong><br />
              <span style={{ color:'var(--muted)' }}>owner@demo.com / demo123 (Kukatpally, Hyd) · renter@demo.com / demo123 (Secunderabad, Hyd)</span><br />
              <strong style={{ color:'var(--orange)' }}>Admin:</strong> harsha@admin.com / harsha@12345
            </div>
          </>
        ) : (
          <>
            <div className="modal-title">Create account</div>
            <div className="modal-sub">Join RentLoop today</div>
            <div className="fg"><label className="fl">I want to</label>
              <div className="rtoggle">
                <div className={`ropt${role==='owner'?' sel-owner':''}`} onClick={() => setRole('owner')}>
                  <span className="ropt-icon">🏷</span>
                  <div className="ropt-lbl">List Items</div>
                  <div style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:2 }}>Item Owner</div>
                </div>
                <div className={`ropt${role==='renter'?' sel-renter':''}`} onClick={() => setRole('renter')}>
                  <span className="ropt-icon">🔍</span>
                  <div className="ropt-lbl">Rent Items</div>
                  <div style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:2 }}>Renter</div>
                </div>
              </div>
            </div>
            <div className="frow">
              <div className="fg"><label className="fl">First name</label>
                <input className="fi" placeholder="Alex" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
              <div className="fg"><label className="fl">Last name</label>
                <input className="fi" placeholder="Smith" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
            </div>
            <div className="fg"><label className="fl">Email</label>
              <input className="fi" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="fg">
              <label className="fl">Phone Number <span style={{ color:'#f87171' }}>*</span></label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:'.88rem', color:'var(--muted)', pointerEvents:'none' }}>+91</span>
                <input className="fi" style={{ paddingLeft:44 }} type="tel" placeholder="10-digit mobile number" maxLength={10}
                  value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,''))} />
              </div>
              <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:4 }}>Required · Used for rental verification</div>
            </div>
            <div className="fg"><label className="fl">Location</label>
              <input className="fi" placeholder="e.g. Kukatpally, Hyderabad" value={form.location} onChange={e => set('location', e.target.value)} /></div>
            <div className="fg"><label className="fl">Password</label>
              <input className="fi" type="password" placeholder="Min 6 chars" value={form.password} onChange={e => set('password', e.target.value)} /></div>
            <button className="btn btn-primary" style={{ width:'100%', marginTop:6, justifyContent:'center' }} onClick={doRegister} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
            <div className="msw">Have an account? <a onClick={() => setView('login')}>Sign in</a></div>
          </>
        )}
      </div>
    </div>
  );
}
