import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const EMOJIS=['📷','⛺','🔧','🚲','🚁','📽','🎸','🏄','🎿','🛶','🔬','🎮','📚','🎨','🪴','🎻','🧳','🛴','🎤'];
const CATS=['Electronics','Outdoors','Tools','Sports','Vehicles','Home & Garden','Music','Books','Fashion','Other'];

/* ── ItemCard ── */
export function ItemCard({ item, onClick, pendingRequests = 0 }) {
  const imgs = (() => { try { const p=JSON.parse(item.images||'[]'); return Array.isArray(p)?p:[]; } catch { return []; } })();
  return (
    <div className="icard" onClick={() => onClick&&onClick(item.id)}>
      <div className="icard-img">
        {imgs.length>0 ? <img src={imgs[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : item.emoji}
        <span className={`ibadge ${item.status}`}>{item.approved?item.status:'pending approval'}</span>
      </div>
      <div className="icard-body">
        <div className="icard-name">{item.name}</div>
        <div className="icard-cat">{item.category}</div>
        <div className="icard-meta"><div className="icard-price">₹{Number(item.price).toLocaleString('en-IN')}<span>/{item.unit}</span></div></div>
        {!item.approved && <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'.74rem',color:'#fbbf24',marginTop:5,padding:'4px 8px',background:'rgba(251,191,36,.08)',border:'1px solid rgba(251,191,36,.2)',borderRadius:7}}>⏳ Awaiting admin approval</div>}
        {pendingRequests > 0 && <div style={{fontSize:'.75rem',color:'#fbbf24',marginTop:6}}>⏳ {pendingRequests} pending rental request{pendingRequests!==1?'s':''}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, sub, onAction, actionLabel }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
      {onAction && <button className="btn btn-primary btn-sm" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

/* ── Announcement Banner ── */
function AnnouncementBanner() {
  const [ann, setAnn] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => { api.get('/announcements').then(r => { if(r.data.length>0) setAnn(r.data[0]); }).catch(()=>{}); }, []);
  if (!ann || dismissed) return null;
  const colors={info:'rgba(96,165,250,.08)',warning:'rgba(251,191,36,.08)',success:'rgba(74,222,128,.08)'};
  const borders={info:'rgba(96,165,250,.25)',warning:'rgba(251,191,36,.25)',success:'rgba(74,222,128,.25)'};
  const textColors={info:'#60a5fa',warning:'#fbbf24',success:'#4ade80'};
  const icons={info:'📢',warning:'⚠',success:'✅'};
  return (
    <div style={{background:colors[ann.type]||colors.info,border:`1px solid ${borders[ann.type]||borders.info}`,borderRadius:12,padding:'13px 16px',marginBottom:18,display:'flex',alignItems:'flex-start',gap:10}}>
      <span style={{fontSize:'1rem',flexShrink:0}}>{icons[ann.type]||'📢'}</span>
      <div style={{flex:1}}>
        <div style={{fontWeight:600,color:textColors[ann.type]||textColors.info,fontSize:'.88rem'}}>{ann.title}</div>
        <div style={{fontSize:'.82rem',color:'var(--muted)',marginTop:2}}>{ann.body}</div>
      </div>
      <button onClick={()=>setDismissed(true)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'.9rem',flexShrink:0}}>✕</button>
    </div>
  );
}

/* ── Item Detail Modal ── */
export function ItemDetailModal({ itemId, onClose, onBooked }) {
  const { user, toast } = useAuth();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [mainImg, setMainImg] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    api.get(`/items/${itemId}`).then(r=>setItem(r.data)).catch(()=>{});
    api.get(`/reviews/item/${itemId}`).then(r=>setReviews(r.data)).catch(()=>{});
  }, [itemId]);
  const imgs = (() => { try { return JSON.parse(item?.images||'[]'); } catch { return []; } })();
  const today = new Date().toISOString().slice(0,10);
  const days = startDate&&endDate ? Math.max(0,Math.round((new Date(endDate)-new Date(startDate))/(1000*60*60*24))) : 0;
  const total = days * Number(item?.price||0);
  const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : '—';
  const isRenter = user?.role==='renter';
  const book = async () => {
    if (!startDate||!endDate) { toast('Select dates','e'); return; }
    if (days<=0) { toast('End must be after start','e'); return; }
    setLoading(true);
    try { await api.post('/rentals',{itemId,startDate,endDate,message:msg}); toast('Request sent! 📨','s'); onBooked&&onBooked(); onClose(); }
    catch(e) { toast(e.response?.data?.error||'Booking failed','e'); }
    finally { setLoading(false); }
  };
  if (!item) return <div className="overlay"><div className="modal"><div style={{color:'var(--muted)',textAlign:'center',padding:32}}>Loading…</div></div></div>;
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal item-modal" style={{maxHeight:'90vh',overflowY:'auto'}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {imgs.length>0 ? (
          <div style={{marginBottom:20}}>
            <div style={{height:200,borderRadius:14,overflow:'hidden',background:'var(--card2)',marginBottom:8}}>
              <img src={imgs[mainImg]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
            <div style={{display:'flex',gap:7}}>
              {imgs.map((src,i) => <div key={i} onClick={()=>setMainImg(i)} style={{width:56,height:56,borderRadius:8,overflow:'hidden',cursor:'pointer',border:`2px solid ${i===mainImg?'var(--orange)':'transparent'}`,transition:'border-color .15s'}}><img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>)}
            </div>
          </div>
        ) : <div className="im-img">{item.emoji}</div>}
        <div className="im-name">{item.name}</div>
        <div className="dc-row">
          <div className="dc"><strong>{item.category}</strong></div>
          <div className="dc">₹<strong>{Number(item.price).toLocaleString('en-IN')}</strong>/{item.unit}</div>
          <div className="dc">📍 <strong>{item.location}</strong></div>
          <div className="dc">⭐ <strong>{avg}</strong> ({reviews.length})</div>
        </div>
        {item.description && <div className="im-desc">{item.description}</div>}
        <div className="owner-row">
          <div className="av" style={{background:'#F07C2B',width:38,height:38,fontSize:'.9rem'}}>👤</div>
          <div>
            <div style={{fontWeight:600,color:'#fff',fontSize:'.9rem'}}>Owner</div>
            <div style={{fontSize:'.76rem',color:'var(--muted)'}}>📍 {item.location}</div>
          </div>
        </div>
        {isRenter && item.status==='available' && (
          <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:14,padding:18,marginBottom:14}}>
            <div style={{fontWeight:600,color:'#fff',marginBottom:12,fontSize:'.92rem'}}>📅 Request Rental</div>
            <div className="date-row">
              <div><label className="fl">Start Date</label><input className="fi" type="date" min={today} value={startDate} onChange={e=>setStartDate(e.target.value)} /></div>
              <div><label className="fl">End Date</label><input className="fi" type="date" min={startDate||today} value={endDate} onChange={e=>setEndDate(e.target.value)} /></div>
            </div>
            {days>0 && <div style={{fontSize:'.83rem',color:'var(--muted)',marginBottom:11}}><strong style={{color:'var(--orange)'}}>₹{total.toLocaleString('en-IN')}</strong> total for {days} day(s)</div>}
            <div className="fg"><label className="fl">Message (optional)</label><textarea className="fi" rows={2} placeholder="Hi, I'd like to rent your item…" value={msg} onChange={e=>setMsg(e.target.value)} /></div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={book} disabled={loading}>{loading?'Sending…':'Send Request'}</button>
          </div>
        )}
        {!user && <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Sign In to Rent</button>}
        {user?.id===item.ownerId && <div style={{background:'rgba(255,255,255,.04)',borderRadius:10,padding:'10px 14px',fontSize:'.84rem',color:'var(--muted)',textAlign:'center'}}>This is your listing</div>}
        {reviews.length>0 && (
          <div style={{marginTop:16}}>
            <div style={{fontWeight:600,color:'#fff',marginBottom:10,fontSize:'.9rem'}}>Reviews ({reviews.length})</div>
            {reviews.slice(0,3).map(r => (
              <div key={r.id} className="review-card">
                <div className="star-row" style={{marginBottom:6}}>{'⭐'.repeat(r.rating)}</div>
                <div style={{fontSize:'.84rem',color:'var(--muted)',marginBottom:6}}>{r.comment}</div>
                <div style={{fontSize:'.74rem',color:'var(--muted2)'}}>{r.renterName} · {r.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Owner QR Modal ── */
export function OwnerQRModal({ rental, onClose, onUpdate }) {
  const { toast } = useAuth();
  const [data, setData] = useState(rental);
  const [loading, setLoading] = useState(false);
  const confirmPickup = async () => { setLoading(true); try { await api.patch(`/rentals/${rental.id}/pickup`,{pickedUp:true}); setData(p=>({...p,pickedUp:true})); toast('Pickup confirmed ✅','s'); } catch { toast('Failed','e'); } finally { setLoading(false); } };
  const confirmReturn = async () => { setLoading(true); try { await api.patch(`/rentals/${rental.id}/return`); toast('Return confirmed — rental closed! 🎉','s'); onUpdate(); } catch { toast('Failed','e'); } finally { setLoading(false); } };
  const code = rental.id?.slice(-8).toUpperCase();
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:440}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{textAlign:'center',padding:'6px 0 16px'}}>
          <div style={{fontSize:'1.8rem',marginBottom:8}}>📱</div>
          <div className="modal-title" style={{fontSize:'1.3rem',marginBottom:3}}>QR Scan — Item Handover</div>
          <div className="modal-sub">Scan the renter's QR code to confirm pickup or return</div>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:0,marginBottom:22}}>
          <div style={{textAlign:'center',width:90}}>
            <div style={{width:32,height:32,borderRadius:'50%',margin:'0 auto 5px',display:'flex',alignItems:'center',justifyContent:'center',background:data.pickedUp?'#4ade80':'rgba(255,255,255,.1)',border:data.pickedUp?'none':'2px dashed rgba(255,255,255,.3)',color:data.pickedUp?'#000':'var(--muted)',fontSize:'.9rem'}}>{data.pickedUp?'✓':'1'}</div>
            <div style={{fontSize:'.72rem',color:data.pickedUp?'#4ade80':'var(--muted)',fontWeight:data.pickedUp?600:400}}>Picked Up</div>
          </div>
          <div style={{flex:1,height:2,background:data.pickedUp?'rgba(74,222,128,.4)':'rgba(255,255,255,.1)',marginBottom:18}} />
          <div style={{textAlign:'center',width:90}}>
            <div style={{width:32,height:32,borderRadius:'50%',margin:'0 auto 5px',display:'flex',alignItems:'center',justifyContent:'center',background:data.returned?'#4ade80':data.pickedUp?'var(--orange)':'rgba(255,255,255,.1)',color:data.returned?'#000':data.pickedUp?'#fff':'var(--muted)',fontSize:'.9rem'}}>{data.returned?'✓':'2'}</div>
            <div style={{fontSize:'.72rem',color:data.returned?'#4ade80':data.pickedUp?'var(--orange)':'var(--muted)',fontWeight:(data.returned||data.pickedUp)?600:400}}>Returned</div>
          </div>
        </div>
        <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'1.5rem'}}>{rental.itemEmoji||'📦'}</div>
            <div><div style={{fontWeight:600,color:'#fff',fontSize:'.9rem'}}>{rental.itemName}</div><div style={{fontSize:'.76rem',color:'var(--muted)'}}>{rental.startDate} → {rental.endDate} · {rental.days} day(s)</div></div>
            <div style={{marginLeft:'auto',fontFamily:"'Fraunces',serif",fontSize:'1.1rem',fontWeight:700,color:'#4ade80'}}>₹{Number(rental.total).toLocaleString('en-IN')}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <div className="av" style={{background:rental.renterColor||'#555',width:26,height:26,fontSize:'.68rem'}}>{rental.renterName?.[0]||'?'}</div>
            <div style={{fontSize:'.82rem',color:'#fff'}}>{rental.renterName}</div>
            <div style={{fontFamily:'monospace',fontSize:'.72rem',color:'var(--orange)',background:'rgba(240,124,43,.08)',border:'1px solid rgba(240,124,43,.2)',borderRadius:6,padding:'2px 8px',marginLeft:'auto'}}>ID: {code}</div>
          </div>
        </div>
        {!data.pickedUp ? (
          <div style={{background:'rgba(240,124,43,.06)',border:'1px solid rgba(240,124,43,.2)',borderRadius:12,padding:14,textAlign:'center'}}>
            <div style={{fontSize:'.88rem',color:'#fff',fontWeight:600,marginBottom:4}}>Step 1 — Confirm Pickup</div>
            <div style={{fontSize:'.78rem',color:'var(--muted)',marginBottom:12}}>Ask the renter to show their QR code, verify the rental ID matches, then tap below</div>
            <div style={{fontFamily:'monospace',fontSize:'1rem',color:'var(--orange)',background:'rgba(240,124,43,.08)',border:'1px solid rgba(240,124,43,.2)',borderRadius:8,padding:'8px 16px',display:'inline-block',marginBottom:14}}>{code}</div><br/>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={confirmPickup} disabled={loading}>✓ Confirm Item Picked Up</button>
            <div style={{fontSize:'.76rem',color:'var(--muted)',textAlign:'center',lineHeight:1.6,marginTop:10}}>Tap only after you have physically handed the item to the renter and verified their QR code matches this rental ID</div>
          </div>
        ) : !data.returned ? (
          <div style={{background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.2)',borderRadius:12,padding:14,textAlign:'center'}}>
            <div style={{fontSize:'.88rem',color:'#fff',fontWeight:600,marginBottom:4}}>Step 2 — Confirm Return</div>
            <div style={{fontSize:'.78rem',color:'var(--muted)',marginBottom:12}}>When the renter brings the item back, verify their QR code and confirm below</div>
            <div style={{fontFamily:'monospace',fontSize:'1rem',color:'#4ade80',background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:8,padding:'8px 16px',display:'inline-block',marginBottom:14}}>{code}</div><br/>
            <button className="btn btn-green" style={{width:'100%',justifyContent:'center'}} onClick={confirmReturn} disabled={loading}>✓ Confirm Item Returned</button>
            <div style={{fontSize:'.76rem',color:'var(--muted)',textAlign:'center',lineHeight:1.6,marginTop:10}}>Check the item condition before confirming. Once confirmed, the rental is closed and the security deposit is released</div>
          </div>
        ) : (
          <div style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.3)',borderRadius:12,padding:18,textAlign:'center'}}>
            <div style={{fontSize:'1.8rem',marginBottom:8}}>🎉</div>
            <div style={{fontWeight:600,color:'#4ade80',marginBottom:4}}>Rental Complete!</div>
            <div style={{fontSize:'.82rem',color:'var(--muted)'}}>Item has been picked up and returned. Transaction closed.</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Renter Profile Modal (full, with real data) ── */
function RenterProfileModal({ rental, onClose, onAction }) {
  const [completedCount, setCompletedCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [renterReviews, setRenterReviews] = useState([]);
  const [renterStatus, setRenterStatus] = useState('active');

  useEffect(() => {
    // Fetch renter's booking history and reviews
    api.get('/admin/rentals').then(r => {
      const completed = r.data.filter(x => x.renterId === rental.renterId && (x.status==='approved'||x.status==='completed'));
      setCompletedCount(completed.length);
    }).catch(()=>{});
    api.get('/admin/reviews').then(r => {
      const revs = r.data.filter(x => x.renterId === rental.renterId);
      setRenterReviews(revs);
      if (revs.length) setAvgRating((revs.reduce((s,x)=>s+x.rating,0)/revs.length).toFixed(1));
    }).catch(()=>{});
    api.get('/admin/users').then(r => {
      const u = r.data.find(x => x.id === rental.renterId);
      if (u) setRenterStatus(u.status);
    }).catch(()=>{});
  }, [rental.renterId]);

  const sb = renterStatus==='verified'?'ab-blue':renterStatus==='suspended'?'ab-red':'ab-green';

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:480}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div className="av" style={{background:rental.renterColor||'#555',width:56,height:56,fontSize:'1.5rem',margin:'0 auto 10px'}}>{rental.renterName?.[0]||'?'}</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.3rem',fontWeight:700,color:'#fff'}}>{rental.renterName}</div>
          <div style={{fontSize:'.8rem',color:'var(--muted)',marginTop:2}}>Member since —</div>
          <span className={`abadge ${sb}`} style={{marginTop:6,display:'inline-block'}}>{renterStatus}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:18}}>
          {[[completedCount,'Completed Rentals'],[`⭐ ${avgRating||'—'}`, 'Avg Rating'],[renterReviews.length,'Reviews Received']].map(([v,l])=>(
            <div key={l} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:12,padding:12,textAlign:'center'}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.4rem',fontWeight:700,color:l==='Avg Rating'?'#fbbf24':'#fff'}}>{v}</div>
              <div style={{fontSize:'.72rem',color:'var(--muted)',marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        {renterReviews.length>0 ? (
          <div style={{marginBottom:16}}>
            <div style={{fontSize:'.84rem',fontWeight:600,color:'#fff',marginBottom:9}}>Reviews about this renter</div>
            {renterReviews.slice(0,3).map(rv=>(
              <div key={rv.id} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:10,padding:11,marginBottom:7}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:'.8rem',fontWeight:500,color:'#fff'}}>Owner</span>
                  <span className="star-row" style={{fontSize:'.82rem'}}>{'⭐'.repeat(rv.rating)}</span>
                </div>
                <div style={{fontSize:'.8rem',color:'var(--muted)'}}>{rv.comment}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:10,padding:13,textAlign:'center',marginBottom:16,fontSize:'.84rem',color:'var(--muted)'}}>No reviews yet — this is a new renter</div>
        )}
        <div style={{background:'rgba(240,124,43,.06)',border:'1px solid rgba(240,124,43,.2)',borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{fontSize:'.84rem',fontWeight:600,color:'var(--orange)',marginBottom:9}}>Current Rental Request</div>
          {[['Item',rental.itemEmoji+' '+rental.itemName],['Period',`${rental.startDate} → ${rental.endDate} (${rental.days} days)`],['Total',`₹${Number(rental.total).toLocaleString('en-IN')}`]].map(([k,v],i,arr)=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:'.82rem',padding:'5px 0',borderBottom:i<arr.length-1?'1px solid var(--border)':'none'}}>
              <span style={{color:'var(--muted)'}}>{k}</span><span style={{color:k==='Total'?'#4ade80':'#fff',fontWeight:k==='Total'?600:400}}>{v}</span>
            </div>
          ))}
        </div>
        {rental.status==='pending' && (
          <div style={{display:'flex',gap:9}}>
            <button className="btn btn-green" style={{flex:1,justifyContent:'center'}} onClick={()=>{onAction(rental.id,'approved');onClose();}}>✓ Approve Request</button>
            <button className="btn btn-red" style={{flex:1,justifyContent:'center'}} onClick={()=>{onAction(rental.id,'rejected');onClose();}}>✕ Reject Request</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Request List ── */
export function RequestsList({ rentals, onUpdate }) {
  const { toast } = useAuth();
  const [renterModal, setRenterModal] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [reviewRental, setReviewRental] = useState(null);

  const action = async (id, status) => {
    try { await api.patch(`/rentals/${id}/status`,{status}); toast(status==='approved'?'Request approved! ✅':'Rejected',status==='approved'?'s':''); onUpdate(); }
    catch { toast('Action failed','e'); }
  };

  if (!rentals.length) return <EmptyState icon="📋" title="No requests" sub="Rental requests will appear here" />;
  return (
    <>
      <div className="rlist">
        {rentals.map(r => (
          <div key={r.id} className="rcard" style={{flexWrap:'wrap',gap:12}}>
            <div className="ri" style={{background:'rgba(240,124,43,.1)',alignSelf:'flex-start'}}>{r.itemEmoji||'📦'}</div>
            <div style={{flex:1,minWidth:220}}>
              <div className="r-title">{r.itemName||'Item'}</div>
              <div className="r-meta">📅 {r.startDate} → {r.endDate} · {r.days} day(s) · <strong style={{color:'#4ade80'}}>₹{Number(r.total).toLocaleString('en-IN')}</strong></div>
              {r.message && <div style={{fontSize:'.76rem',color:'var(--muted)',marginTop:3,fontStyle:'italic'}}>"{r.message}"</div>}
              {/* Renter mini-profile */}
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,padding:'9px 11px',background:'var(--card2)',border:'1px solid var(--border)',borderRadius:10}}>
                <div className="av" style={{background:r.renterColor||'#555',width:28,height:28,fontSize:'.7rem',flexShrink:0}}>{r.renterName?.[0]||'?'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'.84rem',fontWeight:600,color:'#fff'}}>{r.renterName||'Renter'}</div>
                  <div style={{fontSize:'.72rem',color:'var(--muted)'}}>📍 — · 0 rentals completed</div>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={()=>setRenterModal(r)}>View Profile</button>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:7,flexShrink:0}}>
              <span className={`rs rs-${r.status[0]}`}>{r.status}</span>
              {r.status==='pending' && (
                <div style={{display:'flex',gap:7}}>
                  <button className="btn btn-green btn-xs" onClick={()=>action(r.id,'approved')}>✓ Approve</button>
                  <button className="btn btn-red btn-xs" onClick={()=>action(r.id,'rejected')}>✕ Reject</button>
                </div>
              )}
              {r.status==='approved' && <button className="btn btn-ghost btn-xs" onClick={()=>setQrModal(r)}>📱 Scan QR</button>}
              {(r.status==='approved' || r.status==='completed') && !r.isOwnerReviewed && <button className="btn btn-ghost btn-xs" onClick={()=>setReviewRental(r)}>Review Renter</button>}
            </div>
          </div>
        ))}
      </div>
      {renterModal && <RenterProfileModal rental={renterModal} onClose={()=>setRenterModal(null)} onAction={action} />}
      {qrModal && <OwnerQRModal rental={qrModal} onClose={()=>setQrModal(null)} onUpdate={()=>{onUpdate();setQrModal(null);}} />}
      {reviewRental && <ReviewModal rental={reviewRental} onClose={()=>setReviewRental(null)} onDone={onUpdate} />}
    </>
  );
}

/* ── Owner Overview ── */
export function OwnerOverview({ onNav }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const load = () => { api.get('/items/my').then(r=>setItems(r.data)).catch(()=>{}); api.get('/rentals/requests').then(r=>setRentals(r.data)).catch(()=>{}); };
  useEffect(()=>{ load(); },[]);
  const earned = rentals.filter(r=>r.status==='approved'||r.status==='completed').reduce((s,r)=>s+Number(r.total),0);
  const pending = rentals.filter(r=>r.status==='pending').length;
  return (
    <div>
      <AnnouncementBanner />
      <div className="ph"><div><div className="ph-title">Good day, {user.firstName} 👋</div><div className="ph-sub">Here's your listing overview</div></div><button className="btn btn-primary btn-sm" onClick={()=>onNav('add-item')}>+ Add Item</button></div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="sc"><div className="sc-lbl">Listings</div><div className="sc-val">{items.length}</div></div>
        <div className="sc"><div className="sc-lbl">Pending</div><div className="sc-val" style={{color:'#fbbf24'}}>{pending}</div></div>
        <div className="sc"><div className="sc-lbl">Earned</div><div className="sc-val" style={{color:'#4ade80'}}>₹{earned.toLocaleString('en-IN')}</div></div>
        <div className="sc"><div className="sc-lbl">Total Rentals</div><div className="sc-val">{rentals.length}</div></div>
      </div>
      <div style={{marginBottom:16}}><div className="ph-title" style={{fontSize:'1.1rem',marginBottom:14}}>Your Listings</div>
        {items.length===0 ? <EmptyState icon="📦" title="No listings yet" sub="Add your first item to start earning" onAction={()=>onNav('add-item')} actionLabel="+ Add Item" />
          : <div className="ig">{items.slice(0,4).map(i=><ItemCard key={i.id} item={i} onClick={setSelectedItem} />)}</div>}
      </div>
      {pending>0 && <div><div className="ph-title" style={{fontSize:'1.1rem',marginBottom:14}}>Pending Requests</div><RequestsList rentals={rentals.filter(r=>r.status==='pending')} onUpdate={load} /></div>}
      {selectedItem && <ItemDetailModal itemId={selectedItem} onClose={()=>setSelectedItem(null)} />}
    </div>
  );
}

/* ── My Listings ── */
export function MyListings({ onNav }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const { toast } = useAuth();
  const [rentals, setRentals] = useState([]);
  const load = () => { api.get('/items/my').then(r=>setItems(r.data)).catch(()=>{}); api.get('/rentals/requests').then(r=>setRentals(r.data)).catch(()=>{}); };
  useEffect(()=>{ load(); },[]);
  const del = async (id) => { if(!window.confirm('Delete this listing?')) return; try { await api.delete(`/items/${id}`); toast('Listing deleted','s'); load(); } catch { toast('Failed','e'); } };
  const pending = items.filter(i=>!i.approved).length;
  if (editing) return <AddEditItem onNav={onNav} editData={editing} onDone={()=>{ setEditing(null); load(); }} />;
  return (
    <div>
      <div className="ph"><div><div className="ph-title">My Listings</div><div className="ph-sub">{items.length} item{items.length!==1?'s':''}</div></div><button className="btn btn-primary btn-sm" onClick={()=>onNav('add-item')}>+ Add Item</button></div>
      {pending>0 && <div style={{background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.25)',borderRadius:14,padding:'13px 16px',marginBottom:18,display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:'1rem'}}>⏳</span><div><div style={{fontSize:'.88rem',fontWeight:600,color:'#fbbf24'}}>{pending} item{pending>1?'s':''} awaiting admin approval</div><div style={{fontSize:'.76rem',color:'var(--muted)',marginTop:1}}>Your listing will appear to renters once an admin approves it. This usually takes a few hours.</div></div></div>}
      {items.length===0 ? <EmptyState icon="📦" title="No listings yet" sub="List your first item and start earning" onAction={()=>onNav('add-item')} actionLabel="+ Add Item" />
        : <div className="ig">{items.map(i=>(
          <div key={i.id} style={{position:'relative'}}>
            <ItemCard item={i} onClick={setSelected} pendingRequests={rentals.filter(r=>r.itemId===i.id&&r.status==='pending').length} />
            <div style={{display:'flex',gap:7,padding:'0 16px 14px'}}>
              <button className="btn btn-ghost btn-xs" onClick={e=>{e.stopPropagation();setEditing(i);}}>Edit</button>
              <button className="btn btn-red btn-xs" onClick={e=>{e.stopPropagation();del(i.id);}}>Delete</button>
            </div>
          </div>
        ))}</div>}
      {selected && <ItemDetailModal itemId={selected} onClose={()=>setSelected(null)} />}
    </div>
  );
}

/* ── Add Item ── */
export function AddItem({ onNav }) { return <AddEditItem onNav={onNav} editData={null} onDone={()=>onNav('my-items')} />; }

function AddEditItem({ onNav, editData, onDone }) {
  const { user, toast } = useAuth();
  const isEdit = !!editData;
  const [form, setForm] = useState({
    name:editData?.name||'', description:editData?.description||'', category:editData?.category||'Electronics',
    price:editData?.price||'', unit:editData?.unit||'day', location:editData?.location||user.location||'',
    emoji:editData?.emoji||'📷', serialNumber:editData?.serialNumber||'', brandModel:editData?.brandModel||'',
    invoiceNo:editData?.invoiceNo||'', condition:editData?.condition||'', purchaseYear:editData?.purchaseYear||'', damage:editData?.damage||''
  });
  const [images, setImages] = useState(()=>{ try { return JSON.parse(editData?.images||'[]'); } catch { return []; } });
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const handleImgs = (files) => {
    const rem = 4-images.length;
    if(!rem){toast('Max 4 images allowed','e');return;}
    Array.from(files).slice(0,rem).forEach(f=>{ if(f.size>2*1024*1024){toast('Image too large (max 2MB)','e');return;} const r=new FileReader(); r.onload=ev=>setImages(p=>[...p,ev.target.result]); r.readAsDataURL(f); });
  };
  const submit = async () => {
    if(!form.name||!form.price){toast('Fill required fields','e');return;}
    if(!isEdit&&!form.condition){toast('Please select product condition','e');return;}
    setLoading(true);
    try {
      const body={...form,price:parseFloat(form.price),images:JSON.stringify(images)};
      if(isEdit){await api.put(`/items/${editData.id}`,body);toast('Updated!','s');}
      else{await api.post('/items',body);toast('Item submitted for admin approval 🎉','s');}
      onDone();
    } catch(e){toast(e.response?.data?.error||'Failed','e');}
    finally{setLoading(false);}
  };
  return (
    <div>
      <div className="ph"><div><div className="ph-title">{isEdit?'Edit Listing':'Add New Listing'}</div><div className="ph-sub">{isEdit?'Update your item details':'List your item for rent'}</div></div></div>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:32,maxWidth:600}}>
        <div className="fg"><label className="fl">Item Name</label><input className="fi" placeholder="e.g. Nikon DSLR Camera" value={form.name} onChange={e=>set('name',e.target.value)} /></div>
        <div className="fg">
          <label className="fl">Item Photos <span style={{color:'var(--muted)',textTransform:'none',fontWeight:400,letterSpacing:0}}>(up to 4 images)</span></label>
          <div onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--orange)'}} onDragLeave={e=>e.currentTarget.style.borderColor='var(--border2)'} onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--border2)';handleImgs(e.dataTransfer.files);}} onClick={()=>fileRef.current?.click()} style={{border:'2px dashed var(--border2)',borderRadius:14,padding:22,textAlign:'center',cursor:'pointer',background:'rgba(255,255,255,.02)'}}>
            <div style={{fontSize:'1.8rem',marginBottom:8}}>📸</div>
            <div style={{fontSize:'.88rem',color:'#fff',fontWeight:500}}>Click to upload or drag &amp; drop</div>
            <div style={{fontSize:'.76rem',color:'var(--muted)',marginTop:4}}>JPG, PNG, WebP · Max 2MB each</div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>handleImgs(e.target.files)} />
          </div>
          {images.length>0 && <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>{images.map((src,i)=><div key={i} style={{position:'relative',width:80,height:80,borderRadius:10,overflow:'hidden',border:'1px solid var(--border2)'}}><img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /><button onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:3,right:3,width:18,height:18,borderRadius:'50%',background:'rgba(0,0,0,.7)',border:'none',color:'#fff',fontSize:'.65rem',cursor:'pointer'}}>✕</button></div>)}</div>}
        </div>
        <div className="fg"><label className="fl">Choose Icon</label><div className="emoji-pick">{EMOJIS.map(e=><div key={e} className={`ep${form.emoji===e?' sel':''}`} onClick={()=>set('emoji',e)}>{e}</div>)}</div></div>
        <div className="frow">
          <div className="fg"><label className="fl">Category</label><select className="fsel" value={form.category} onChange={e=>set('category',e.target.value)}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="fg"><label className="fl">Price (₹)</label><input className="fi" type="number" placeholder="500" value={form.price} onChange={e=>set('price',e.target.value)} /></div>
        </div>
        <div className="frow">
          <div className="fg"><label className="fl">Per</label><select className="fsel" value={form.unit} onChange={e=>set('unit',e.target.value)}>{['day','hour','week'].map(u=><option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}</select></div>
          <div className="fg"><label className="fl">Location</label><input className="fi" placeholder="City, State" value={form.location} onChange={e=>set('location',e.target.value)} /></div>
        </div>
        <div className="fg"><label className="fl">Description</label><textarea className="fi" rows={3} placeholder="Describe your item, condition, accessories…" value={form.description} onChange={e=>set('description',e.target.value)} /></div>
        <div style={{background:'rgba(240,124,43,.05)',border:'1px solid rgba(240,124,43,.18)',borderRadius:14,padding:20,marginBottom:18}}>
          <div style={{fontSize:'.82rem',fontWeight:600,color:'var(--orange)',marginBottom:4}}>🔒 Verification Details — Fraud Prevention</div>
          <div style={{fontSize:'.76rem',color:'var(--muted)',marginBottom:14}}>Admin reviews these details before approving your listing.</div>
          <div className="fg"><label className="fl">Serial Number / IMEI</label><input className="fi" placeholder="Enter serial number or IMEI" value={form.serialNumber} onChange={e=>set('serialNumber',e.target.value)} /><div style={{fontSize:'.72rem',color:'var(--muted2)',marginTop:3}}>For phones: 15-digit IMEI. For cameras/electronics: body serial number.</div></div>
          <div className="fg"><label className="fl">Brand &amp; Model</label><input className="fi" placeholder="e.g. Sony Alpha A7 III" value={form.brandModel} onChange={e=>set('brandModel',e.target.value)} /></div>
          <div className="fg"><label className="fl">Purchase Invoice / Proof Number (optional)</label><input className="fi" placeholder="Invoice no. or purchase receipt reference" value={form.invoiceNo} onChange={e=>set('invoiceNo',e.target.value)} /></div>
        </div>
        <div className="frow">
          <div className="fg">
            <label className="fl">Product Condition <span style={{color:'#f87171'}}>*</span></label>
            <select className="fsel" value={form.condition} onChange={e=>set('condition',e.target.value)}>
              <option value="">Select condition</option>
              <option value="New">New (unused)</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good (minor wear)</option>
              <option value="Fair">Fair (visible use)</option>
            </select>
          </div>
          <div className="fg"><label className="fl">Purchase Year</label><input className="fi" type="number" min="2000" max="2025" placeholder="e.g. 2022" value={form.purchaseYear} onChange={e=>set('purchaseYear',e.target.value)} /></div>
        </div>
        <div className="fg"><label className="fl">Existing Damage / Defects</label><textarea className="fi" rows={2} placeholder="Describe any scratches, cracks, missing parts or existing damage…" value={form.damage} onChange={e=>set('damage',e.target.value)} /><div style={{fontSize:'.72rem',color:'var(--muted2)',marginTop:3}}>Be honest — renters will rate you on accuracy.</div></div>
        <div style={{display:'flex',gap:12,marginTop:6}}>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading?(isEdit?'Saving…':'Listing…'):(isEdit?'Save Changes':'List Item')}</button>
          <button className="btn btn-ghost" onClick={()=>onNav('my-items')}>Cancel</button>
        </div>
        {!isEdit && <div style={{fontSize:'.78rem',color:'var(--muted)',marginTop:12}}>📋 Your item will be reviewed by admin before going live.</div>}
      </div>
    </div>
  );
}

/* ── Requests Panel ── */
export function RequestsPanel() {
  const [rentals, setRentals] = useState([]);
  const [filter, setFilter] = useState('all');
  const load = () => api.get('/rentals/requests').then(r=>setRentals(r.data)).catch(()=>{});
  useEffect(()=>{load();},[]);
  const filtered = filter==='all' ? rentals : rentals.filter(r=>r.status===filter);
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Rental Requests</div><div className="ph-sub">Manage incoming requests</div></div></div>
      <div className="fbar">{['all','pending','approved','rejected','completed'].map(s=><button key={s} className={`btn btn-xs ${filter===s?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(s)} style={{textTransform:'capitalize'}}>{s}</button>)}</div>
      <RequestsList rentals={filtered} onUpdate={load} />
    </div>
  );
}

/* ── Earnings ── */
export function EarningsPanel() {
  const [rentals, setRentals] = useState([]);
  useEffect(()=>{ api.get('/rentals/requests').then(r=>setRentals(r.data)).catch(()=>{}); },[]);
  const approved = rentals.filter(r=>r.status==='approved'||r.status==='completed');
  const total = approved.reduce((s,r)=>s+Number(r.total),0);
  const pending = rentals.filter(r=>r.status==='pending').reduce((s,r)=>s+Number(r.total),0);
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Earnings</div><div className="ph-sub">Track your rental income</div></div></div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)',maxWidth:560}}>
        <div className="sc"><div className="sc-lbl">Total Earned</div><div className="sc-val" style={{color:'#4ade80'}}>₹{total.toLocaleString('en-IN')}</div></div>
        <div className="sc"><div className="sc-lbl">Pending</div><div className="sc-val" style={{color:'#fbbf24'}}>₹{pending.toLocaleString('en-IN')}</div></div>
        <div className="sc"><div className="sc-lbl">Transactions</div><div className="sc-val">{approved.length}</div></div>
      </div>
      <div className="ph-title" style={{fontSize:'1.1rem',marginBottom:14}}>Transaction History</div>
      {approved.length===0 ? <EmptyState icon="💰" title="No earnings yet" sub="Approved rentals will appear here" />
        : <div style={{display:'flex',flexDirection:'column',gap:9}}>{approved.map(r=><div key={r.id} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:12}}><div style={{width:34,height:34,borderRadius:10,background:'rgba(240,124,43,.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>{r.itemEmoji||'💰'}</div><div style={{flex:1}}><div style={{fontWeight:500,color:'#fff',fontSize:'.88rem'}}>{r.itemName} — {r.days} day(s)</div><div style={{fontSize:'.76rem',color:'var(--muted)'}}>{r.renterName} · {r.startDate} → {r.endDate}</div></div><div style={{fontFamily:"'Fraunces',serif",fontSize:'1.05rem',fontWeight:700,color:'#4ade80'}}>+₹{Number(r.total).toLocaleString('en-IN')}</div></div>)}</div>}
    </div>
  );
}

/* ── Calendar ── */
export function CalendarPanel() {
  const [rentals, setRentals] = useState([]);
  useEffect(()=>{ api.get('/rentals/requests').then(r=>setRentals(r.data.filter(r=>r.status==='approved'))).catch(()=>{}); },[]);
  const now=new Date(), y=now.getFullYear(), m=now.getMonth();
  const dim=new Date(y,m+1,0).getDate(), fd=new Date(y,m,1).getDay();
  const mName=now.toLocaleString('default',{month:'long'});
  const booked=new Set();
  rentals.forEach(r=>{ let d=new Date(r.startDate),end=new Date(r.endDate); while(d<=end){if(d.getFullYear()===y&&d.getMonth()===m)booked.add(d.getDate());d.setDate(d.getDate()+1);} });
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Availability Calendar</div><div className="ph-sub">{mName} {y}</div></div></div>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:28,maxWidth:440}}>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.1rem',fontWeight:700,color:'#fff',textAlign:'center',marginBottom:18}}>{mName} {y}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} style={{textAlign:'center',fontSize:'.68rem',fontWeight:600,color:'var(--muted2)',padding:'5px 0',textTransform:'uppercase'}}>{d}</div>)}
          {Array(fd).fill(null).map((_,i)=><div key={'e'+i} />)}
          {Array(dim).fill(null).map((_,i)=>{ const day=i+1,isB=booked.has(day),isT=day===now.getDate(); return <div key={day} style={{aspectRatio:'1',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.8rem',background:isB?'rgba(239,68,68,.12)':'transparent',color:isB?'#f87171':isT?'var(--orange)':'var(--text)',border:isT?'1px solid var(--orange)':'1px solid transparent'}}>{day}</div>; })}
        </div>
        <div style={{display:'flex',gap:14,marginTop:16,fontSize:'.78rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:10,height:10,borderRadius:3,background:'rgba(239,68,68,.15)'}} /><span style={{color:'var(--muted)'}}>Booked</span></div>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:10,height:10,borderRadius:3,border:'1px solid var(--orange)'}} /><span style={{color:'var(--muted)'}}>Today</span></div>
        </div>
      </div>
    </div>
  );
}

/* ── User Announcements ── */
export function UserAnnouncements() {
  const [anns, setAnns] = useState([]);
  useEffect(()=>{ api.get('/announcements').then(r=>setAnns(r.data)).catch(()=>{}); },[]);
  const colors={info:'rgba(96,165,250,.07)',warning:'rgba(251,191,36,.07)',success:'rgba(74,222,128,.07)'};
  const borders={info:'rgba(96,165,250,.22)',warning:'rgba(251,191,36,.22)',success:'rgba(74,222,128,.22)'};
  const textColors={info:'#60a5fa',warning:'#fbbf24',success:'#4ade80'};
  const icons={info:'📢',warning:'⚠️',success:'✅'};
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Announcements</div><div className="ph-sub">Platform news and updates from RentLoop admin</div></div></div>
      {anns.length===0 ? <EmptyState icon="📢" title="No announcements" sub="You'll see platform updates and news here" />
        : anns.map(a=>(
          <div key={a.id} style={{background:colors[a.type]||colors.info,border:`1px solid ${borders[a.type]||borders.info}`,borderRadius:16,padding:20,marginBottom:14}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
              <div style={{width:38,height:38,borderRadius:10,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>{icons[a.type]||'📢'}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Fraunces',serif",fontWeight:700,color:textColors[a.type]||textColors.info,fontSize:'1rem',marginBottom:5}}>{a.title}</div>
                <div style={{fontSize:'.88rem',color:'var(--muted)',lineHeight:1.6,marginBottom:8}}>{a.body}</div>
                <div style={{fontSize:'.74rem',color:'var(--muted2)'}}>📅 {a.createdAt} · Posted by {a.author}</div>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ── Review Modal ── */
function ReviewModal({ rental, onClose, onDone }) {
  const { toast } = useAuth();
  const [star, setStar] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!star) { toast('Select a rating','e'); return; }
    if (!comment.trim()) { toast('Write a comment','e'); return; }
    setLoading(true);
    try {
      await api.post('/reviews', {
        rentalId: rental.id,
        itemId: rental.itemId,
        ownerId: rental.ownerId,
        renterId: rental.renterId,
        rating: star,
        comment
      });
      toast('Review submitted! ⭐','s');
      onDone&&onDone();
      onClose();
    } catch(e) {
      toast(e.response?.data?.error||'Failed','e');
    } finally { setLoading(false); }
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={{fontSize:'2.8rem',marginBottom:10}}>{rental.itemEmoji||'⭐'}</div>
          <div className="modal-title" style={{fontSize:'1.35rem'}}>Rate the Renter</div>
          <div className="modal-sub" style={{marginBottom:0}}>How was your experience with {rental.renterName}?</div>
        </div>
        <div className="fg"><label className="fl">Rating</label>
          <div style={{display:'flex',gap:8,fontSize:'1.9rem',cursor:'pointer'}}>
            {[1,2,3,4,5].map(n=><span key={n} onClick={()=>setStar(n)} style={{color:n<=star?'#fbbf24':'var(--muted2)',transition:'all .12s',transform:n===star?'scale(1.3)':'scale(1)'}}>★</span>)}
          </div>
        </div>
        <div className="fg"><label className="fl">Comment</label><textarea className="fi" rows={3} placeholder="Share your experience…" value={comment} onChange={e=>setComment(e.target.value)} /></div>
        <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={submit} disabled={loading}>{loading?'Submitting…':'Submit Review'}</button>
      </div>
    </div>
  );
}
