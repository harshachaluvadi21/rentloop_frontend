import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProfilePanel() {
  const { user, updateUser, toast } = useAuth();
  const [form, setForm] = useState({ firstName:user.firstName||'', lastName:user.lastName||'', email:user.email||'', phone:user.phone||'', location:user.location||'', password:'' });
  const set = (k,v) => setForm(p => ({...p,[k]:v}));
  const save = async () => {
    if (!form.firstName||!form.lastName||!form.email) { toast('Fill required fields','e'); return; }
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) { toast('Enter a valid 10-digit mobile number','e'); return; }
    try { const res = await api.put('/users/me',{...form,password:form.password||undefined}); updateUser(res.data); toast('Profile updated! ✓','s'); }
    catch(e) { toast(e.response?.data?.error||'Update failed','e'); }
  };
  const roleLabel = {owner:'🏷 Item Owner',renter:'🔍 Renter',admin:'⚙ Admin'}[user.role]||user.role;
  const roleBadge = {owner:'rb-owner',renter:'rb-renter',admin:'rb-admin'}[user.role]||'rb-renter';
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Profile</div><div className="ph-sub">Manage your account</div></div></div>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:32,maxWidth:480}}>
        <div className="profile-av" style={{background:user.color}}>{user.firstName?.[0]}</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.45rem',fontWeight:700,color:'#fff',marginBottom:4}}>{user.firstName} {user.lastName}</div>
        <div className={`role-badge ${roleBadge}`}>{roleLabel}</div>
        <div className="section-div" />
        <div className="frow">
          <div className="fg"><label className="fl">First Name</label><input className="fi" value={form.firstName} onChange={e=>set('firstName',e.target.value)} /></div>
          <div className="fg"><label className="fl">Last Name</label><input className="fi" value={form.lastName} onChange={e=>set('lastName',e.target.value)} /></div>
        </div>
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
        <div className="fg"><label className="fl">Phone Number</label>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:'.88rem',color:'var(--muted)',pointerEvents:'none'}}>+91</span>
            <input className="fi" style={{paddingLeft:44}} type="tel" maxLength={10} placeholder="10-digit mobile" value={form.phone} onChange={e=>set('phone',e.target.value.replace(/\D/g,''))} />
          </div>
        </div>
        <div className="fg"><label className="fl">Location</label><input className="fi" value={form.location} onChange={e=>set('location',e.target.value)} /></div>
        <div className="fg"><label className="fl">New Password</label><input className="fi" type="password" placeholder="Leave blank to keep current" value={form.password} onChange={e=>set('password',e.target.value)} /></div>
        <button className="btn btn-primary" onClick={save}>Save Changes</button>
      </div>
    </div>
  );
}
