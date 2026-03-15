import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProfilePanel from './ProfilePanel';
import api from '../utils/api';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const iHome=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const iUsers=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const iBox=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const iClip=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const iStar=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const iMega=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const iChart=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const iBell=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>;
const iGear=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>;
const iUser=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

/* ── Admin Overview ── */
function AdminOverview({ onNav }) {
  const [stats, setStats] = useState({});
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [users, setUsers] = useState([]);
  const actRef=useRef(null), donutRef=useRef(null);
  const actInst=useRef(null), donutInst=useRef(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r=>setStats(r.data)).catch(()=>{});
    api.get('/admin/items').then(r=>setItems(r.data)).catch(()=>{});
    api.get('/admin/rentals').then(r=>setRentals(r.data)).catch(()=>{});
    api.get('/admin/users').then(r=>setUsers(r.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!actRef.current) return;
    if (actInst.current) actInst.current.destroy();
    actInst.current = new Chart(actRef.current, {type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Rentals',data:[4,7,3,9,5,11,6],borderColor:'#F07C2B',backgroundColor:'rgba(240,124,43,.08)',fill:true,tension:.4,pointRadius:3,borderWidth:2},{label:'Listings',data:[2,4,2,5,3,7,4],borderColor:'#2E7D4F',backgroundColor:'rgba(46,125,79,.07)',fill:true,tension:.4,pointRadius:3,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'rgba(255,255,255,.6)',font:{size:11}}}},scales:{x:{grid:{color:'rgba(255,255,255,.08)'},ticks:{color:'rgba(255,255,255,.4)',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.08)'},ticks:{color:'rgba(255,255,255,.4)',font:{size:10}},min:0}}}});
    if (!donutRef.current) return;
    if (donutInst.current) donutInst.current.destroy();
    const catMap={}; items.forEach(i=>{catMap[i.category]=(catMap[i.category]||0)+1;});
    const cats=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const dColors=['#378ADD','#1D9E75','#BA7517','#D4537E','#888780'];
    donutInst.current = new Chart(donutRef.current,{type:'doughnut',data:{labels:cats.length?cats.map(([c])=>c):['No items'],datasets:[{data:cats.length?cats.map(([,v])=>v):[1],backgroundColor:cats.length?cats.map((_,i)=>dColors[i]||'#888'):['#444'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}}});
    return ()=>{ if(actInst.current) actInst.current.destroy(); if(donutInst.current) donutInst.current.destroy(); };
  }, [items]);

  const pending = items.filter(i=>!i.approved);
  const catMap={}; items.forEach(i=>{catMap[i.category]=(catMap[i.category]||0)+1;});
  const dCats=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const dColors=['#378ADD','#1D9E75','#BA7517','#D4537E','#888780'];
  const activity=[];
  rentals.slice(0,3).forEach(r=>{ const dot=r.status==='pending'?'#BA7517':r.status==='approved'?'#378ADD':'#1D9E75'; activity.push({dot,text:<><b>{r.renterName}</b> {r.status==='pending'?'requested rental of':'active rental:'} {r.itemName}</>,time:'recent'}); });
  pending.slice(0,2).forEach(i=>{ activity.push({dot:'#F07C2B',text:<>Owner listed <b>{i.name}</b> — pending approval</>,time:'new'}); });
  users.slice(0,2).forEach(u=>{ if(u.role!=='admin') activity.push({dot:'#378ADD',text:<><b>{u.firstName} {u.lastName}</b> registered as {u.role}</>,time:'new'}); });
  if(!activity.length) activity.push({dot:'#888',text:'No recent activity yet — platform is ready!',time:''});

  const approveItem = async (id) => { try { await api.patch(`/admin/items/${id}/approve`); api.get('/admin/items').then(r=>setItems(r.data)); } catch {} };
  const rejectItem = async (id) => { if(!window.confirm('Remove?')) return; try { await api.delete(`/admin/items/${id}`); api.get('/admin/items').then(r=>setItems(r.data)); } catch {} };

  return (
    <div>
      <div className="ph"><div><div className="ph-title">Dashboard</div><div className="ph-sub">Platform overview · All-time</div></div>
        <div style={{display:'flex',gap:8}}><select style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'7px 12px',color:'var(--text)',fontSize:'.82rem'}}><option>Last 30 days</option><option>Last 7 days</option><option>All time</option></select><button className="btn btn-primary btn-sm">Export</button></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:22}}>
        {[['Total Users',(stats.totalUsers||0),`${stats.owners||0} owners · ${stats.renters||0} renters`,''],['Items Listed',(stats.totalItems||0),`${stats.pendingApprovals||0} pending · ${(stats.totalItems||0)-(stats.pendingApprovals||0)} live`,''],['Active Rentals',(stats.activeRentals||0),`${stats.pendingRentals||0} pending requests`,'#60a5fa'],['Completed',(stats.totalRentals||0),`of ${stats.totalRentals||0} total`,'#4ade80'],['Total Revenue',`₹${Number(stats.totalRevenue||0).toLocaleString('en-IN')}`,'from approved rentals','#4ade80']].map(([l,v,s,c])=>(
          <div key={l} className="admin-metric"><div className="am-lbl">{l}</div><div className="am-val" style={c?{color:c}:{}}>{v}</div><div className="am-delta" style={{color:'var(--muted)'}}>{s}</div></div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Rental activity — last 30 days</span><span className="cb-link" onClick={()=>onNav('analytics')}>Full analytics →</span></div><div style={{position:'relative',height:200}}><canvas ref={actRef} /></div></div>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Rentals by category</span></div>
          <div style={{display:'flex',alignItems:'center',gap:18,marginTop:6}}>
            <div style={{position:'relative',width:120,height:120,flexShrink:0}}><canvas ref={donutRef} /></div>
            <div style={{display:'flex',flexDirection:'column',gap:6,fontSize:'.8rem',flex:1}}>
              {dCats.map(([cat,count],i)=><div key={cat} style={{display:'flex',alignItems:'center',gap:7}}><div style={{width:9,height:9,borderRadius:2,flexShrink:0,background:dColors[i]||'#888'}} /><span style={{color:'var(--muted)'}}>{cat}</span><span style={{fontWeight:600,marginLeft:'auto',color:'#fff'}}>{items.length?Math.round(count/items.length*100):0}%</span></div>)}
              {!dCats.length && <div style={{color:'var(--muted)',fontSize:'.8rem'}}>No items yet</div>}
            </div>
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Recent activity</span></div>
          <div style={{display:'flex',flexDirection:'column'}}>
            {activity.slice(0,6).map((a,i)=><div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:i<activity.slice(0,6).length-1?'1px solid var(--border)':'none'}}><div style={{width:7,height:7,borderRadius:'50%',flexShrink:0,marginTop:5,background:a.dot}} /><div style={{fontSize:'.82rem',color:'var(--text)',lineHeight:1.5,flex:1}}>{a.text}</div><div style={{fontSize:'.74rem',color:'var(--muted2)',whiteSpace:'nowrap'}}>{a.time}</div></div>)}
          </div>
        </div>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Pending approvals</span><span className="cb-link" onClick={()=>onNav('items')}>Manage →</span></div>
          <table className="a-table"><thead><tr><th>Item</th><th>Owner</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {!pending.length ? <tr><td colSpan="4" style={{textAlign:'center',color:'var(--muted)',padding:20}}>All items approved ✅</td></tr>
                : pending.map(i=><tr key={i.id}><td><span style={{fontSize:'.9rem'}}>{i.emoji||'📦'}</span> {i.name}</td><td style={{color:'var(--muted)',fontSize:'.8rem'}}>{i.ownerId?.slice(0,8)}</td><td style={{color:'var(--orange)',fontSize:'.8rem'}}>₹{Number(i.price).toLocaleString('en-IN')}/{i.unit}</td><td><div style={{display:'flex',gap:4}}><button className="abt success" onClick={()=>approveItem(i.id)}>✓</button><button className="abt danger" onClick={()=>rejectItem(i.id)}>✕</button></div></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Analytics ── */
function AdminAnalytics() {
  const [rentals,setRentals]=useState([]);
  const [items,setItems]=useState([]);
  const [reviews,setReviews]=useState([]);
  const chartRef=useRef(null); const chartInst=useRef(null);
  useEffect(()=>{ api.get('/admin/rentals').then(r=>setRentals(r.data)).catch(()=>{}); api.get('/admin/items').then(r=>setItems(r.data)).catch(()=>{}); api.get('/admin/reviews').then(r=>setReviews(r.data)).catch(()=>{}); },[]);
  useEffect(()=>{
    if(!chartRef.current||!rentals.length) return;
    if(chartInst.current) chartInst.current.destroy();
    const now=new Date(); const labels=[]; const rev=Array(6).fill(0);
    for(let i=5;i>=0;i--){ const d=new Date(now.getFullYear(),now.getMonth()-i,1); labels.push(d.toLocaleString('default',{month:'short'})); rentals.filter(r=>r.status==='approved'||r.status==='completed').forEach(r=>{ const rd=new Date(r.startDate||now); if(rd.getMonth()===d.getMonth()&&rd.getFullYear()===d.getFullYear()) rev[5-i]+=Number(r.total)||0; }); }
    chartInst.current=new Chart(chartRef.current,{type:'bar',data:{labels,datasets:[{label:'Revenue',data:rev,backgroundColor:'#F07C2B',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'rgba(255,255,255,.4)',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.07)'},ticks:{color:'rgba(255,255,255,.4)',font:{size:10},callback:v=>'₹'+Math.round(v/1000)+'k'}}}}});
    return ()=>{ if(chartInst.current) chartInst.current.destroy(); };
  },[rentals]);
  const completed=rentals.filter(r=>r.status==='completed');
  const totalRev=rentals.filter(r=>r.status==='approved'||r.status==='completed').reduce((s,r)=>s+Number(r.total),0);
  const avgDur=completed.length?Math.round(completed.reduce((s,r)=>s+r.days,0)/completed.length*10)/10:0;
  const avgTxn=completed.length?Math.round(totalRev/completed.length):0;
  const catMap={}; items.forEach(i=>{catMap[i.category]=(catMap[i.category]||0)+1;});
  const topCats=Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const itemRentCount={}; rentals.forEach(r=>{itemRentCount[r.itemId]=(itemRentCount[r.itemId]||0)+1;});
  const topItems=Object.entries(itemRentCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const exportCSV=()=>{ let csv='Rental ID,Item,Renter,Start,End,Total,Status\n'; rentals.forEach(r=>{csv+=`${r.id},${r.itemName||'?'},${r.renterName||r.renterId},${r.startDate},${r.endDate},${r.total},${r.status}\n`;}); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='rentloop_analytics.csv'; a.click(); URL.revokeObjectURL(url); };
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Analytics</div><div className="ph-sub">Real-time platform metrics</div></div><button className="btn btn-primary btn-sm" onClick={exportCSV}>Download CSV</button></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {[['Avg Rental Duration',`${avgDur}d`,`from ${completed.length} completed`,''],['Avg Transaction',`₹${avgTxn.toLocaleString('en-IN')}`,'per rental',''],['Dispute Rate','0%','0 disputes','#4ade80'],['Total Revenue',`₹${totalRev.toLocaleString('en-IN')}`,'all time','#4ade80']].map(([l,v,s,c])=>(
          <div key={l} className="admin-metric"><div className="am-lbl">{l}</div><div className="am-val" style={c?{color:c}:{}}>{v}</div><div className="am-delta" style={{color:'var(--muted)'}}>{s}</div></div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Revenue trend — last 6 months</span></div><div style={{position:'relative',height:220}}><canvas ref={chartRef} /></div></div>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Items by category</span></div>
          {!topCats.length ? <div style={{color:'var(--muted)',textAlign:'center',padding:40}}>No items yet</div>
            : <div style={{padding:'8px 0'}}>{topCats.map(([cat,count])=>{ const pct=Math.round(count/items.length*100); return <div key={cat} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',fontSize:'.82rem',marginBottom:4}}><span style={{color:'#fff'}}>{cat}</span><span style={{color:'var(--muted)'}}>{count} items · {pct}%</span></div><div style={{height:6,background:'var(--card2)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',background:'var(--orange)',borderRadius:3,width:`${pct}%`}} /></div></div>; })}</div>}
        </div>
      </div>
      <div className="card-box"><div className="cb-head"><span className="cb-title">Most rented items</span></div>
        <table className="a-table"><thead><tr><th>#</th><th>Item</th><th>Category</th><th>Rentals</th><th>Revenue</th><th>Avg Rating</th></tr></thead>
          <tbody>
            {!topItems.length ? <tr><td colSpan="6" style={{textAlign:'center',color:'var(--muted)',padding:20}}>No rental data yet</td></tr>
              : topItems.map(([itemId,count],i)=>{ const item=items.find(x=>x.id===itemId); const irevs=reviews.filter(r=>r.itemId===itemId); const avgR=irevs.length?(irevs.reduce((s,r)=>s+r.rating,0)/irevs.length).toFixed(1):'—'; const rev=rentals.filter(r=>r.itemId===itemId&&(r.status==='approved'||r.status==='completed')).reduce((s,r)=>s+Number(r.total),0); return <tr key={itemId}><td>{i+1}</td><td>{item?item.emoji+' '+item.name:'Unknown'}</td><td>{item?.category||'—'}</td><td>{count}</td><td style={{color:'#4ade80'}}>₹{rev.toLocaleString('en-IN')}</td><td>{avgR==='—'?'—':'⭐ '+avgR}</td></tr>; })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Admin Users ── */
function AdminUsers() {
  const [users,setUsers]=useState([]);
  const [search,setSearch]=useState('');
  const [roleF,setRoleF]=useState('');
  const [statusF,setStatusF]=useState('');
  const [viewUser,setViewUser]=useState(null);
  const { toast }=useAuth();
  const load=()=>api.get('/admin/users').then(r=>setUsers(r.data)).catch(()=>{});
  useEffect(()=>{load();},[]);
  const action=async(id,act)=>{ const map={suspend:'suspended',restore:'active',verify:'verified'}; try{await api.patch(`/admin/users/${id}/status`,{status:map[act]});toast(act==='suspend'?'Suspended':act==='verify'?'Verified ✅':'Restored','s');load();}catch{toast('Failed','e');} };
  const del=async(id)=>{ if(!window.confirm('Delete user?')) return; try{await api.delete(`/admin/users/${id}`);toast('Deleted','s');load();}catch{toast('Failed','e');} };
  const filtered=users.filter(u=>(!search||(u.firstName+' '+u.lastName+' '+u.email+' '+(u.location||'')).toLowerCase().includes(search.toLowerCase()))&&(!roleF||u.role===roleF)&&(!statusF||u.status===statusF));
  return (
    <div>
      <div className="ph"><div><div className="ph-title">User Management</div><div className="ph-sub">{users.filter(u=>u.role!=='admin').length} registered users</div></div><button className="btn btn-primary btn-sm">Export</button></div>
      <div className="card-box">
        <div className="fbar">
          <input className="finput" placeholder="Search by name, email, location…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,maxWidth:320}} />
          <select className="fselect" value={roleF} onChange={e=>setRoleF(e.target.value)}><option value="">All roles</option><option value="owner">Owner</option><option value="renter">Renter</option></select>
          <select className="fselect" value={statusF} onChange={e=>setStatusF(e.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="verified">Verified</option><option value="suspended">Suspended</option></select>
        </div>
        <table className="a-table"><thead><tr><th>User</th><th>Role</th><th>Location</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {!filtered.length ? <tr><td colSpan="6" style={{textAlign:'center',color:'var(--muted)',padding:20}}>No users found</td></tr>
              : filtered.map(u=>(
                <tr key={u.id}>
                  <td><div style={{display:'flex',alignItems:'center',gap:8}}><div className="av" style={{background:u.color,width:28,height:28,fontSize:'.7rem'}}>{u.firstName?.[0]}</div><div><div style={{fontWeight:500}}>{u.firstName} {u.lastName}</div><div style={{fontSize:'.74rem',color:'var(--muted)'}}>{u.email}</div>{u.phone&&<div style={{fontSize:'.7rem',color:'var(--muted2)'}}>+91 {u.phone}</div>}</div></div></td>
                  <td>{u.role}</td>
                  <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{u.location||'—'}</td>
                  <td style={{color:'var(--muted)',fontSize:'.8rem'}}>{u.joinedDate}</td>
                  <td><span className={`abadge ${u.status==='verified'?'ab-blue':u.status==='suspended'?'ab-red':'ab-green'}`}>{u.status}</span></td>
                  <td><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    <button className="abt" onClick={()=>setViewUser(u)}>Profile</button>
                    {u.status!=='suspended'?<button className="abt danger" onClick={()=>action(u.id,'suspend')}>Suspend</button>:<button className="abt success" onClick={()=>action(u.id,'restore')}>Restore</button>}
                    {u.status==='active'&&<button className="abt" onClick={()=>action(u.id,'verify')}>Verify</button>}
                    {u.role!=='admin'&&<button className="abt danger" onClick={()=>del(u.id)}>Delete</button>}
                  </div></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {viewUser && <UserProfileModal user={viewUser} onClose={()=>setViewUser(null)} />}
    </div>
  );
}

function UserProfileModal({ user, onClose }) {
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:480}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
          <div className="av" style={{background:user.color,width:52,height:52,fontSize:'1.3rem'}}>{user.firstName?.[0]}</div>
          <div><div style={{fontFamily:"'Fraunces',serif",fontSize:'1.3rem',fontWeight:700,color:'#fff'}}>{user.firstName} {user.lastName}</div><div style={{fontSize:'.8rem',color:'var(--muted)'}}>{user.email} · {user.location||'—'}</div><span className={`abadge ${user.status==='verified'?'ab-blue':user.status==='suspended'?'ab-red':'ab-green'}`} style={{marginTop:4,display:'inline-block'}}>{user.status}</span><span className="abadge ab-gray" style={{marginTop:4,marginLeft:4,display:'inline-block'}}>{user.role}</span></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
          {[['—','Total Rentals'],['₹0','Earned/Spent'],['⭐ —','Avg Rating']].map(([v,l])=><div key={l} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:12,padding:14,textAlign:'center'}}><div style={{fontFamily:"'Fraunces',serif",fontSize:'1.5rem',fontWeight:700,color:'#fff'}}>{v}</div><div style={{fontSize:'.74rem',color:'var(--muted)',marginTop:2}}>{l}</div></div>)}
        </div>
        <div style={{borderTop:'1px solid var(--border)',paddingTop:14,marginBottom:14}}>
          <div style={{fontSize:'.84rem',fontWeight:600,color:'#fff',marginBottom:8}}>Account Details</div>
          {[['Joined',user.joinedDate||'—'],['Location',user.location||'—'],['Role',user.role],['Phone',user.phone?'+91 '+user.phone:'Not provided']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:'.82rem',padding:'6px 0',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--muted)'}}>{k}</span><span style={{color:'#fff'}}>{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Admin Items (with Images column, Details btn, View Owner btn) ── */
function AdminItems() {
  const [items,setItems]=useState([]);
  const [filter,setFilter]=useState('pending');
  const [detailItem,setDetailItem]=useState(null);
  const [ownerModal,setOwnerModal]=useState(null);
  const { toast }=useAuth();
  const load=()=>api.get('/admin/items').then(r=>setItems(r.data)).catch(()=>{});
  useEffect(()=>{load();},[]);
  const approve=async(id)=>{ try{await api.patch(`/admin/items/${id}/approve`);toast('Approved ✓','s');load();setDetailItem(null);}catch{toast('Failed','e');} };
  const del=async(id)=>{ if(!window.confirm('Remove?')) return; try{await api.delete(`/admin/items/${id}`);toast('Removed','s');load();setDetailItem(null);}catch{toast('Failed','e');} };
  const filtered=filter==='pending'?items.filter(i=>!i.approved):filter==='approved'?items.filter(i=>i.approved):items;
  const getImgs=(item)=>{ try { return JSON.parse(item.images||'[]'); } catch { return []; } };
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Item Listings</div><div className="ph-sub">{items.length} total · {items.filter(i=>!i.approved).length} pending approval</div></div></div>
      <div className="card-box">
        <div className="fbar">
          <input type="text" className="finput" placeholder="Search items…" style={{flex:1,maxWidth:300}} />
          <select className="fselect" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option></select>
        </div>
        <table className="a-table"><thead><tr><th>Item</th><th>Images</th><th>Owner</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {!filtered.length ? <tr><td colSpan="7" style={{textAlign:'center',color:'var(--muted)',padding:20}}>No items</td></tr>
              : filtered.map(i=>{
                const imgs=getImgs(i);
                return <tr key={i.id}>
                  <td><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:'1.2rem'}}>{i.emoji}</span><div><div style={{fontWeight:600,color:'#fff',fontSize:'.84rem'}}>{i.name}</div><div style={{fontSize:'.72rem',color:'var(--muted)'}}>{i.location}</div></div></div></td>
                  <td>{imgs.length>0?<div style={{display:'flex',gap:4}}>{imgs.slice(0,3).map((src,idx)=><img key={idx} src={src} alt="" style={{width:32,height:32,borderRadius:6,objectFit:'cover',border:'1px solid var(--border)'}} />)}</div>:<span style={{color:'var(--muted)',fontSize:'.76rem'}}>No images</span>}</td>
                  <td style={{fontSize:'.82rem',color:'var(--muted)'}}>{i.ownerId?.slice(0,8)}</td>
                  <td><span className="abadge ab-blue">{i.category}</span></td>
                  <td style={{color:'var(--orange)',fontWeight:600,fontSize:'.82rem'}}>₹{Number(i.price).toLocaleString('en-IN')}/{i.unit}</td>
                  <td><span className={`abadge ${i.approved?'ab-green':'ab-amber'}`}>{i.approved?'Active':'Pending'}</span></td>
                  <td><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    <button className="abt" onClick={()=>setDetailItem(i)}>Details</button>
                    {!i.approved&&<><button className="abt" onClick={()=>setOwnerModal({item:i})}>Owner</button><button className="abt success" onClick={()=>approve(i.id)}>Approve</button><button className="abt danger" onClick={()=>del(i.id)}>Reject</button></>}
                    {i.approved&&<button className="abt danger" onClick={()=>del(i.id)}>Remove</button>}
                  </div></td>
                </tr>;
              })
            }
          </tbody>
        </table>
      </div>
      {detailItem && <ItemDetailsModal item={detailItem} onClose={()=>setDetailItem(null)} onApprove={approve} onDelete={del} onViewOwner={(item)=>{setOwnerModal({item});setDetailItem(null);}} />}
      {ownerModal && <OwnerProfileModal item={ownerModal.item} onClose={()=>setOwnerModal(null)} onApprove={approve} onReject={del} />}
    </div>
  );
}

function ItemDetailsModal({ item, onClose, onApprove, onDelete, onViewOwner }) {
  const [rentals,setRentals]=useState([]);
  const [users,setUsers]=useState([]);
  const [reviews,setReviews]=useState([]);
  useEffect(()=>{ api.get('/admin/rentals').then(r=>setRentals(r.data.filter(x=>x.itemId===item.id))).catch(()=>{}); api.get('/admin/users').then(r=>setUsers(r.data)).catch(()=>{}); api.get('/admin/reviews').then(r=>setReviews(r.data.filter(x=>x.itemId===item.id))).catch(()=>{}); },[item.id]);
  const imgs=(() => { try { return JSON.parse(item.images||'[]'); } catch { return []; } })();
  const owner=users.find(u=>u.id===item.ownerId);
  const avg=reviews.length?(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1):'—';
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal item-modal" style={{maxHeight:'90vh',overflowY:'auto'}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{height:160,background:'linear-gradient(135deg,var(--card2),#0e1016)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'5rem',marginBottom:20,overflow:'hidden'}}>
          {imgs.length>0?<img src={imgs[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />:item.emoji||'📦'}
        </div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.3rem',fontWeight:700,color:'#fff',marginBottom:8}}>{item.name}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:14}}>
          <span className={`abadge ${item.approved?'ab-green':'ab-amber'}`}>{item.approved?'Approved':'Pending'}</span>
          <span className="abadge ab-gray">{item.category}</span>
          <span className="abadge ab-gray">₹{Number(item.price).toLocaleString('en-IN')}/{item.unit}</span>
          <span className="abadge ab-gray">⭐ {avg}</span>
        </div>
        <div style={{fontSize:'.84rem',color:'var(--muted)',lineHeight:1.6,marginBottom:16}}>{item.description||'No description'}</div>
        {/* Verification details */}
        <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontSize:'.82rem',fontWeight:600,color:'var(--orange)',marginBottom:9}}>🔒 Verification Details</div>
          {[['Condition',item.condition],['Serial Number',item.serialNumber],['Brand/Model',item.brandModel],['Purchase Year',item.purchaseYear],['Invoice No.',item.invoiceNo],['Damage noted',item.damage]].filter(([,v])=>v).map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:'.8rem',padding:'5px 0',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--muted)'}}>{k}</span><span style={{color:'#fff'}}>{v}</span></div>
          ))}
          {!item.condition&&!item.serialNumber&&!item.brandModel&&<div style={{color:'var(--muted)',fontSize:'.8rem'}}>No verification details provided</div>}
        </div>
        {/* Owner row */}
        <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'var(--card2)',border:'1px solid var(--border)',borderRadius:12,marginBottom:16}}>
          <div className="av" style={{background:owner?.color||'#555',width:34,height:34,fontSize:'.85rem'}}>{owner?.firstName?.[0]||'?'}</div>
          <div style={{flex:1}}><div style={{fontWeight:600,color:'#fff',fontSize:'.88rem'}}>{owner?owner.firstName+' '+owner.lastName:'Unknown'}</div><div style={{fontSize:'.76rem',color:'var(--muted)'}}>{owner?.email||'—'} · {owner?.status||'—'}</div></div>
          <button className="abt" onClick={()=>onViewOwner(item)}>View Owner</button>
        </div>
        {/* Rental history */}
        <div style={{fontSize:'.82rem',color:'#fff',fontWeight:600,marginBottom:8}}>Rental History ({rentals.length})</div>
        {!rentals.length ? <div style={{color:'var(--muted)',fontSize:'.8rem',marginBottom:16}}>No rentals yet</div>
          : rentals.slice(0,5).map(r=><div key={r.id} style={{display:'flex',justifyContent:'space-between',fontSize:'.8rem',padding:'6px 0',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--muted)'}}>{r.renterName||'?'}</span><span>{r.startDate}→{r.endDate}</span><span className={`abadge ${r.status==='completed'?'ab-green':'ab-amber'}`}>{r.status}</span></div>)
        }
        <div style={{display:'flex',gap:9,marginTop:16}}>
          {!item.approved&&<button className="btn btn-green btn-sm" onClick={()=>onApprove(item.id)}>✓ Approve</button>}
          <button className="btn btn-red btn-sm" onClick={()=>onDelete(item.id)}>Remove Listing</button>
        </div>
      </div>
    </div>
  );
}

function OwnerProfileModal({ item, onClose, onApprove, onReject }) {
  const [owner,setOwner]=useState(null);
  const [ownerItems,setOwnerItems]=useState([]);
  const [ownerRentals,setOwnerRentals]=useState([]);
  const [reviews,setReviews]=useState([]);
  useEffect(()=>{
    api.get('/admin/users').then(r=>{ const u=r.data.find(x=>x.id===item.ownerId); setOwner(u||null); }).catch(()=>{});
    api.get('/admin/items').then(r=>setOwnerItems(r.data.filter(i=>i.ownerId===item.ownerId))).catch(()=>{});
    api.get('/admin/rentals').then(r=>setOwnerRentals(r.data.filter(r=>r.ownerId===item.ownerId))).catch(()=>{});
    api.get('/admin/reviews').then(r=>setReviews(r.data)).catch(()=>{});
  },[item.ownerId]);
  if(!owner) return <div className="overlay"><div className="modal"><div style={{color:'var(--muted)',textAlign:'center',padding:32}}>Loading…</div></div></div>;
  const ownerRevs=reviews.filter(r=>ownerItems.map(i=>i.id).includes(r.itemId));
  const avgRating=ownerRevs.length?(ownerRevs.reduce((s,r)=>s+r.rating,0)/ownerRevs.length).toFixed(1):'No ratings';
  const totalEarned=ownerRentals.filter(r=>r.status==='approved'||r.status==='completed').reduce((s,r)=>s+Number(r.total),0);
  const sb=owner.status==='verified'?'ab-blue':owner.status==='suspended'?'ab-red':'ab-green';
  const imgs=(() => { try { return JSON.parse(item.images||'[]'); } catch { return []; } })();
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:480,maxHeight:'90vh',overflowY:'auto'}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{textAlign:'center',marginBottom:20,paddingBottom:18,borderBottom:'1px solid var(--border)'}}>
          <div className="av" style={{background:owner.color,width:52,height:52,fontSize:'1.3rem',margin:'0 auto 10px'}}>{owner.firstName?.[0]}</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.25rem',fontWeight:700,color:'#fff'}}>{owner.firstName} {owner.lastName}</div>
          <div style={{fontSize:'.8rem',color:'var(--muted)'}}>{owner.email} · {owner.phone?'+91 '+owner.phone:'No phone'}</div>
          <div style={{fontSize:'.78rem',color:'var(--muted2)'}}>📍 {owner.location||'—'} · Member since {owner.joinedDate}</div>
          <span className={`abadge ${sb}`} style={{marginTop:6,display:'inline-block'}}>{owner.status}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
          {[[ownerItems.length,'Listings'],[`₹${totalEarned.toLocaleString('en-IN')}`,'Earned'],[`⭐ ${avgRating}`,'Rating'],[ownerRentals.length,'Rentals']].map(([v,l])=>(
            <div key={l} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:10,padding:12,textAlign:'center'}}><div style={{fontFamily:"'Fraunces',serif",fontSize:'1.3rem',fontWeight:700,color:'#fff'}}>{v}</div><div style={{fontSize:'.7rem',color:'var(--muted)'}}>{l}</div></div>
          ))}
        </div>
        {/* Item pending approval */}
        <div style={{background:'rgba(240,124,43,.06)',border:'1px solid rgba(240,124,43,.2)',borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontSize:'.84rem',fontWeight:600,color:'var(--orange)',marginBottom:10}}>Item Pending Approval</div>
          <div style={{fontSize:'.88rem',fontWeight:600,color:'#fff',marginBottom:5}}>{item.emoji||'📦'} {item.name}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
            <span className="abadge ab-gray">{item.category}</span>
            <span className="abadge ab-gray">₹{Number(item.price).toLocaleString('en-IN')}/{item.unit}</span>
            {item.condition&&<span className="abadge ab-gray">{item.condition}</span>}
          </div>
          {item.serialNumber&&<div style={{fontSize:'.78rem',color:'var(--muted)',marginBottom:3}}>Serial: <strong style={{color:'#fff'}}>{item.serialNumber}</strong></div>}
          {item.brandModel&&<div style={{fontSize:'.78rem',color:'var(--muted)',marginBottom:3}}>Brand/Model: <strong style={{color:'#fff'}}>{item.brandModel}</strong></div>}
          {item.damage&&<div style={{fontSize:'.78rem',color:'#fbbf24',marginBottom:3}}>Damage noted: {item.damage}</div>}
          {imgs.length>0&&<div style={{display:'flex',gap:6,marginTop:8}}>{imgs.slice(0,4).map((src,i)=><img key={i} src={src} alt="" style={{width:48,height:48,borderRadius:8,objectFit:'cover',border:'1px solid var(--border)'}} />)}</div>}
        </div>
        {/* Previous approved listings */}
        {ownerItems.filter(i=>i.approved&&i.id!==item.id).length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:'.84rem',fontWeight:600,color:'#fff',marginBottom:8}}>Previous Approved Listings</div>
            {ownerItems.filter(i=>i.approved&&i.id!==item.id).slice(0,3).map(i=><div key={i.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid var(--border)'}}><span style={{fontSize:'1rem'}}>{i.emoji||'📦'}</span><div style={{flex:1,fontSize:'.82rem',color:'#fff'}}>{i.name}</div><span className="abadge ab-green">approved</span></div>)}
          </div>
        )}
        <div style={{display:'flex',gap:9}}>
          {!item.approved&&<><button className="btn btn-green" style={{flex:1,justifyContent:'center'}} onClick={()=>{onApprove(item.id);onClose();}}>✓ Approve Listing</button><button className="btn btn-red" style={{justifyContent:'center'}} onClick={()=>{onReject(item.id);onClose();}}>✕ Reject</button></>}
        </div>
      </div>
    </div>
  );
}

/* ── Admin Rentals (with ID col, owner col, overdue, search, overdue filter, QR btn) ── */
function AdminRentals() {
  const [rentals,setRentals]=useState([]);
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');
  const today=new Date().toISOString().slice(0,10);
  useEffect(()=>{ api.get('/admin/rentals').then(r=>setRentals(r.data)).catch(()=>{}); },[]);
  const overdue=rentals.filter(r=>r.status==='approved'&&r.endDate<today);
  const filtered=rentals.filter(r=>{
    const q=search.toLowerCase();
    const matchQ=!q||(r.id+' '+(r.itemName||'')+(r.renterName||'')).toLowerCase().includes(q);
    const isOverdue=r.status==='approved'&&r.endDate<today;
    const matchF=filter==='all'||(filter==='overdue'?isOverdue:r.status===filter);
    return matchQ&&matchF;
  }).sort((a,b)=>b.id?.localeCompare(a.id)||0);
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Rental Transactions</div><div className="ph-sub">{rentals.length} total rentals{overdue.length>0&&<span style={{color:'#f87171'}}> · {overdue.length} overdue</span>}</div></div></div>
      {overdue.length>0&&<div style={{background:'rgba(248,113,113,.06)',border:'1px solid rgba(248,113,113,.25)',borderRadius:14,padding:'14px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:'1.1rem'}}>⚠</span><div><div style={{fontWeight:600,color:'#f87171',fontSize:'.9rem'}}>{overdue.length} overdue rental{overdue.length>1?'s':''} — items not yet returned</div><div style={{fontSize:'.78rem',color:'var(--muted)',marginTop:2}}>{overdue.map(r=>r.itemName||'Item').join(', ')}</div></div></div>}
      <div className="card-box">
        <div className="fbar">
          <input className="finput" placeholder="Search by rental ID, item or user…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,maxWidth:320}} />
          <select className="fselect" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="completed">Completed</option><option value="overdue">Overdue</option></select>
        </div>
        <table className="a-table" style={{overflowX:'auto'}}>
          <thead><tr><th>Rental ID</th><th>Item</th><th>Renter</th><th>Owner</th><th>Dates</th><th>Value</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!filtered.length?<tr><td colSpan="8" style={{textAlign:'center',color:'var(--muted)',padding:20}}>No rentals found</td></tr>
              :filtered.map(r=>{
                const isOverdue=r.status==='approved'&&r.endDate<today;
                const sb=isOverdue?'ab-red':r.status==='approved'?'ab-blue':r.status==='pending'?'ab-amber':r.status==='completed'?'ab-green':'ab-red';
                return <tr key={r.id} style={{background:isOverdue?'rgba(248,113,113,.04)':''}}>
                  <td style={{fontWeight:500,fontFamily:'monospace',fontSize:'.78rem'}}>#{r.id?.slice(-6).toUpperCase()}</td>
                  <td><div style={{fontWeight:600,color:'#fff',fontSize:'.84rem'}}>{r.itemEmoji} {r.itemName}</div></td>
                  <td style={{fontSize:'.82rem',color:'var(--muted)'}}>{r.renterName}</td>
                  <td style={{fontSize:'.82rem',color:'var(--muted)'}}>{r.ownerName}</td>
                  <td style={{fontSize:'.78rem',color:'var(--muted)'}}>{r.startDate} → {r.endDate}</td>
                  <td style={{color:'#4ade80',fontWeight:600}}>₹{Number(r.total).toLocaleString('en-IN')}</td>
                  <td><span className={`abadge ${sb}`}>{isOverdue?'overdue':r.status}</span></td>
                  <td><button className="abt">QR</button></td>
                </tr>;
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Admin Reviews (with rating chart + flagged section) ── */
function AdminReviews() {
  const [reviews,setReviews]=useState([]);
  const { toast }=useAuth();
  const chartRef=useRef(null); const chartInst=useRef(null);
  const load=()=>api.get('/admin/reviews').then(r=>setReviews(r.data)).catch(()=>{});
  useEffect(()=>{load();},[]);
  useEffect(()=>{
    if(!chartRef.current) return;
    if(chartInst.current) chartInst.current.destroy();
    chartInst.current=new Chart(chartRef.current,{type:'bar',data:{labels:['5★','4★','3★','2★','1★'],datasets:[{data:[reviews.filter(r=>r.rating===5).length||0,reviews.filter(r=>r.rating===4).length||0,reviews.filter(r=>r.rating===3).length||0,reviews.filter(r=>r.rating===2).length||0,reviews.filter(r=>r.rating===1).length||0],backgroundColor:['#1D9E75','#378ADD','#BA7517','#D4537E','#E24B4A'],borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.07)'},ticks:{color:'rgba(255,255,255,.4)',font:{size:10}}},y:{grid:{display:false},ticks:{color:'rgba(255,255,255,.5)',font:{size:11}}}}}});
    return ()=>{ if(chartInst.current) chartInst.current.destroy(); };
  },[reviews]);
  const del=async(id)=>{ if(!window.confirm('Delete review?')) return; try{await api.delete(`/admin/reviews/${id}`);toast('Removed','s');load();}catch{toast('Failed','e');} };
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Review Moderation</div><div className="ph-sub">{reviews.length} reviews total</div></div></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Rating distribution</span></div><div style={{position:'relative',height:180}}><canvas ref={chartRef} /></div></div>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Flagged reviews</span><span className="abadge ab-red">0 flagged</span></div>
          <table className="a-table"><thead><tr><th>Reviewer</th><th>Item</th><th>Rating</th><th>Flag</th><th></th></tr></thead>
            <tbody><tr><td colSpan="5" style={{textAlign:'center',color:'var(--muted)',padding:16}}>No flagged reviews</td></tr></tbody>
          </table>
        </div>
      </div>
      <div className="card-box"><div className="cb-head"><span className="cb-title">All reviews</span></div>
        <table className="a-table"><thead><tr><th>Reviewer</th><th>Item</th><th>Rating</th><th>Comment</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {!reviews.length?<tr><td colSpan="6" style={{textAlign:'center',color:'var(--muted)',padding:20}}>No reviews yet</td></tr>
              :reviews.map(r=><tr key={r.id}><td style={{color:'var(--muted)',fontSize:'.82rem'}}>{r.renterName||'User'}</td><td style={{fontSize:'.84rem'}}>{r.itemEmoji} {r.itemName}</td><td><span className="star-row">{'⭐'.repeat(r.rating)}</span></td><td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:'.8rem',color:'var(--muted)'}}>{r.comment}</td><td style={{fontSize:'.78rem',color:'var(--muted2)'}}>{r.date}</td><td><button className="abt danger" onClick={()=>del(r.id)}>Remove</button></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Admin Alerts (with chart + progress bars) ── */
function AdminAlerts({ onNav }) {
  const [stats,setStats]=useState({});
  const [rentals,setRentals]=useState([]);
  const chartRef=useRef(null); const chartInst=useRef(null);
  const today=new Date().toISOString().slice(0,10);
  useEffect(()=>{ api.get('/admin/dashboard').then(r=>setStats(r.data)).catch(()=>{}); api.get('/admin/rentals').then(r=>setRentals(r.data)).catch(()=>{}); },[]);
  useEffect(()=>{
    if(!chartRef.current) return;
    if(chartInst.current) chartInst.current.destroy();
    chartInst.current=new Chart(chartRef.current,{type:'bar',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{data:[3,5,2,7,4,8,5],backgroundColor:'#E24B4A',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'rgba(255,255,255,.4)',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.07)'},ticks:{color:'rgba(255,255,255,.4)',font:{size:10}}}}}});
    return ()=>{ if(chartInst.current) chartInst.current.destroy(); };
  },[]);
  const pa=stats.pendingApprovals||0, pr=stats.pendingRentals||0;
  const overdueCount=rentals.filter(r=>r.status==='approved'&&r.endDate<today).length;
  const total=pa+pr+overdueCount;
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Alerts &amp; Notifications</div><div className="ph-sub">{total} active alert{total!==1?'s':''}</div></div><button className="btn btn-ghost btn-sm">Mark all read</button></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          {pa>0&&<div className="alert-card warn"><div style={{fontSize:'.9rem',marginRight:8}}>⏳</div><div><div className="alert-title">{pa} listing{pa!==1?'s':''} pending approval</div><div className="alert-sub">Owner submitted items waiting for review</div></div><button className="abt" style={{marginLeft:'auto',flexShrink:0}} onClick={()=>onNav('items')}>Review</button></div>}
          {overdueCount>0&&<div className="alert-card danger"><div style={{fontSize:'.9rem',marginRight:8}}>⏰</div><div><div className="alert-title">{overdueCount} overdue rental{overdueCount!==1?'s':''}</div><div className="alert-sub">Items not returned past their end date</div></div><button className="abt" style={{marginLeft:'auto',flexShrink:0}} onClick={()=>onNav('rentals')}>View</button></div>}
          {pr>0&&<div className="alert-card info"><div style={{fontSize:'.9rem',marginRight:8}}>📋</div><div><div className="alert-title">{pr} rental request{pr!==1?'s':''} awaiting owner approval</div><div className="alert-sub">Renters waiting for owner response</div></div></div>}
          {!total&&<div className="alert-card success"><div style={{fontSize:'.9rem',marginRight:8}}>✓</div><div><div className="alert-title">All clear — no active alerts</div><div className="alert-sub">Platform is running smoothly</div></div></div>}
        </div>
        <div className="card-box"><div className="cb-head"><span className="cb-title">Alert volume — 7 days</span></div>
          <div style={{position:'relative',height:180}}><canvas ref={chartRef} /></div>
          <div style={{marginTop:16}}>
            {[['Disputes','8','#E24B4A',32],['Flagged items','11','#BA7517',44],['Fake reviews','4','#378ADD',16],['Suspicious logins','2','#1D9E75',8]].map(([l,v,c,w])=>(
              <div key={l}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'.8rem',color:'var(--muted)',marginBottom:3,marginTop:9}}><span>{l}</span><span style={{fontWeight:600,color:'#fff'}}>{v}</span></div>
                <div className="prog-wrap"><div className="prog-fill" style={{width:`${w}%`,background:c}} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Announcements ── */
function AdminAnnouncements() {
  const [anns,setAnns]=useState([]);
  const [form,setForm]=useState({title:'',body:'',type:'info'});
  const { toast }=useAuth();
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const load=()=>api.get('/admin/announcements').then(r=>setAnns(r.data)).catch(()=>{});
  useEffect(()=>{load();},[]);
  const post=async()=>{ if(!form.title||!form.body){toast('Fill all fields','e');return;} try{await api.post('/admin/announcements',form);toast('Published ✓','s');setForm({title:'',body:'',type:'info'});load();}catch{toast('Failed','e');} };
  const del=async(id)=>{ try{await api.delete(`/admin/announcements/${id}`);toast('Deleted','s');load();}catch{toast('Failed','e');} };
  const colors={info:'rgba(96,165,250,.08)',warning:'rgba(251,191,36,.08)',success:'rgba(74,222,128,.08)'};
  const borders={info:'rgba(96,165,250,.25)',warning:'rgba(251,191,36,.25)',success:'rgba(74,222,128,.25)'};
  const textColors={info:'#60a5fa',warning:'#fbbf24',success:'#4ade80'};
  return (
    <div>
      <div className="ph"><div><div className="ph-title">System Announcements</div><div className="ph-sub">{anns.length} announcement{anns.length!==1?'s':''} · Visible to all users</div></div></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div><div className="card-box">
          <div className="cb-head"><span className="cb-title">Post New Announcement</span></div>
          <div className="fg"><label className="fl">Title</label><input className="fi" placeholder="Announcement title" value={form.title} onChange={e=>set('title',e.target.value)} /></div>
          <div className="fg"><label className="fl">Message</label><textarea className="fi" rows={3} placeholder="Write your message…" value={form.body} onChange={e=>set('body',e.target.value)} /></div>
          <div className="fg"><label className="fl">Type</label><select className="fsel" value={form.type} onChange={e=>set('type',e.target.value)}><option value="info">ℹ Info / Update</option><option value="warning">⚠ Warning / Maintenance</option><option value="success">✅ Good news</option></select></div>
          <button className="btn btn-primary btn-sm" onClick={post}>Publish Announcement</button>
        </div></div>
        <div>
          <div style={{fontSize:'.92rem',fontWeight:600,color:'#fff',marginBottom:14}}>Active Announcements ({anns.length})</div>
          {!anns.length?<div className="card-box" style={{textAlign:'center',padding:32}}><div style={{fontSize:'2rem',marginBottom:8}}>📢</div><div style={{color:'var(--muted)',fontSize:'.88rem'}}>No announcements yet</div></div>
            :anns.map(a=><div key={a.id} style={{background:colors[a.type]||colors.info,border:`1px solid ${borders[a.type]||borders.info}`,borderRadius:14,padding:16,marginBottom:12}}><div style={{display:'flex',alignItems:'flex-start',gap:10}}><div style={{flex:1}}><div style={{fontWeight:600,color:textColors[a.type]||textColors.info,fontSize:'.9rem',marginBottom:4}}>{a.title}</div><div style={{fontSize:'.84rem',color:'var(--muted)',lineHeight:1.5,marginBottom:6}}>{a.body}</div><div style={{fontSize:'.72rem',color:'var(--muted2)'}}>Posted by {a.author} · {a.createdAt}</div></div><button className="abt danger" style={{flexShrink:0}} onClick={()=>del(a.id)}>Delete</button></div></div>)}
        </div>
      </div>
    </div>
  );
}

/* ── Admin Settings (all toggles from HTML) ── */
function AdminSettings() {
  const CATS=['Electronics','Outdoors','Tools','Sports','Vehicles','Home & Garden','Music','Books','Fashion','Other'];
  const [toggles,setToggles]=useState({deposit:true,autoRelease:true,approvalReq:true,idVerif:true,guestBrowse:false,autoFlag:true,emailNotif:true,passGateway:false});
  const tog=(k)=>setToggles(p=>({...p,[k]:!p[k]}));
  const Toggle=({k})=><button className={`toggle ${toggles[k]?'on':'off'}`} onClick={()=>tog(k)} />;
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Platform Settings</div><div className="ph-sub">Admin controls and configuration</div></div><button className="btn btn-primary btn-sm">Save Changes</button></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <div className="settings-block"><h4>Item Categories</h4><div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:12}}>{CATS.map(c=><span key={c} className="abadge ab-blue" style={{cursor:'pointer'}}>{c}</span>)}<span className="abadge ab-gray" style={{cursor:'pointer'}}>+ Add</span></div></div>
          <div className="settings-block"><h4>Security Deposit Rules</h4>
            <div className="s-row"><div><div className="s-row-lbl">Require deposit for items &gt; ₹5,000</div><div style={{fontSize:'.74rem',color:'var(--muted)'}}>Auto-hold deposit on booking</div></div><Toggle k="deposit" /></div>
            <div className="s-row"><div className="s-row-lbl">Default deposit rate</div><input type="number" defaultValue="20" style={{width:70,padding:'5px 10px',fontSize:'.84rem',background:'var(--card2)',border:'1px solid var(--border2)',borderRadius:8,color:'var(--text)'}} /><span style={{fontSize:'.82rem',color:'var(--muted)',marginLeft:6}}>%</span></div>
            <div className="s-row"><div><div className="s-row-lbl">Auto-release after return</div><div style={{fontSize:'.74rem',color:'var(--muted)'}}>48h grace period</div></div><Toggle k="autoRelease" /></div>
          </div>
          <div className="settings-block"><h4>Payment Integrations</h4>
            <div className="s-row"><div className="s-row-lbl">Razorpay</div><span className="abadge ab-green">Connected</span></div>
            <div className="s-row"><div className="s-row-lbl">Stripe</div><span className="abadge ab-gray">Not configured</span></div>
            <div className="s-row"><div className="s-row-lbl">UPI / IMPS</div><span className="abadge ab-green">Connected</span></div>
          </div>
        </div>
        <div>
          <div className="settings-block"><h4>Platform Features</h4>
            <div className="s-row"><div className="s-row-lbl">Require listing approval</div><Toggle k="approvalReq" /></div>
            <div className="s-row"><div className="s-row-lbl">ID verification for owners</div><Toggle k="idVerif" /></div>
            <div className="s-row"><div className="s-row-lbl">Guest browsing (no login)</div><Toggle k="guestBrowse" /></div>
            <div className="s-row"><div className="s-row-lbl">Auto-flag suspicious items</div><Toggle k="autoFlag" /></div>
            <div className="s-row"><div className="s-row-lbl">Email notifications</div><Toggle k="emailNotif" /></div>
          </div>
          <div className="settings-block"><h4>System Announcements</h4>
            <div style={{fontSize:'.78rem',color:'var(--muted)',marginBottom:12}}>Post announcements visible to all owners and renters</div>
            <div className="fg"><label className="fl">Title</label><input type="text" className="fi" placeholder="e.g. Scheduled maintenance on Jun 20" /></div>
            <div className="fg"><label className="fl">Message</label><textarea className="fi" rows={3} placeholder="Write your announcement here…" /></div>
            <div style={{display:'flex',gap:8,marginTop:4}}>
              <button className="btn btn-primary btn-sm">Publish</button>
              <button className="btn btn-ghost btn-sm">Clear</button>
            </div>
          </div>
          <div className="settings-block"><h4>Commission &amp; Fees</h4>
            <div className="s-row"><div className="s-row-lbl">Platform commission</div><input type="number" defaultValue="8" style={{width:70,padding:'5px 10px',fontSize:'.84rem',background:'var(--card2)',border:'1px solid var(--border2)',borderRadius:8,color:'var(--text)'}} /><span style={{fontSize:'.82rem',color:'var(--muted)',marginLeft:6}}>%</span></div>
            <div className="s-row"><div className="s-row-lbl">Pass gateway fee to user</div><Toggle k="passGateway" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Dashboard Main ── */
export default function AdminDashboard() {
  const { user }=useAuth();
  const [panel,setPanel]=useState('overview');
  const [pendingCount,setPendingCount]=useState(0);
  useEffect(()=>{ api.get('/admin/items').then(r=>setPendingCount(r.data.filter(i=>!i.approved).length)).catch(()=>{}); },[panel]);
  const links=[
    {icon:iHome(),lbl:'Dashboard',p:'overview'},
    {icon:iChart(),lbl:'Analytics',p:'analytics'},
    {sec:'Management'},
    {icon:iUsers(),lbl:'Users',p:'users'},
    {icon:iBox(),lbl:'Listings',p:'items',badge:pendingCount||null},
    {icon:iClip(),lbl:'Rentals',p:'rentals'},
    {icon:iStar(),lbl:'Reviews',p:'reviews'},
    {sec:'System'},
    {icon:iBell(),lbl:'Alerts',p:'alerts',badge:5},
    {icon:iMega(),lbl:'Announcements',p:'announcements'},
    {icon:iGear(),lbl:'Settings',p:'settings'},
  ];
  const renderPanel=()=>{
    if(panel==='overview') return <AdminOverview onNav={setPanel} />;
    if(panel==='analytics') return <AdminAnalytics />;
    if(panel==='users') return <AdminUsers />;
    if(panel==='items') return <AdminItems />;
    if(panel==='rentals') return <AdminRentals />;
    if(panel==='reviews') return <AdminReviews />;
    if(panel==='alerts') return <AdminAlerts onNav={setPanel} />;
    if(panel==='announcements') return <AdminAnnouncements />;
    if(panel==='settings') return <AdminSettings />;
    if(panel==='profile') return <ProfilePanel />;
    return null;
  };
  return (
    <div>
      <Navbar />
      <div className="dash">
        <div className="sidebar">
          <div style={{padding:'8px 11px 18px',borderBottom:'1px solid var(--border)',marginBottom:10}}>
            <div style={{fontSize:'.74rem',color:'var(--muted2)',marginBottom:3}}>Admin Panel</div>
            <div style={{fontWeight:600,color:'#fff',fontSize:'.88rem'}}>{user.firstName} {user.lastName}</div>
            <div style={{fontSize:'.74rem',color:'var(--orange)',marginTop:1}}>⚙ Super Admin</div>
          </div>
          {links.map((l,i)=>l.sec?<div key={i} className="sb-sec">{l.sec}</div>:<button key={l.p} className={`sbb${panel===l.p?' act':''}`} onClick={()=>setPanel(l.p)}>{l.icon}{l.lbl}{l.badge?<span className="sb-badge">{l.badge}</span>:null}</button>)}
          <div style={{flex:1}} />
          <button className={`sbb${panel==='profile'?' act':''}`} onClick={()=>setPanel('profile')}>{iUser()}Profile</button>
        </div>
        <div className="mc">{renderPanel()}</div>
      </div>
    </div>
  );
}
