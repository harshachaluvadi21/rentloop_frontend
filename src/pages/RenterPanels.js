import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ItemCard, EmptyState, ItemDetailModal } from './OwnerPanels';

const CATS=['Electronics','Outdoors','Tools','Sports','Vehicles','Home & Garden','Music','Books','Fashion','Other'];

/* ── Renter Overview ── */
export function RenterOverview({ onNav }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState(null);
  const load = () => { api.get('/rentals/my-bookings').then(r=>setBookings(r.data)).catch(()=>{}); api.get('/items/browse').then(r=>setAvailable(r.data)).catch(()=>{}); };
  useEffect(()=>{ load(); },[]);
  const active = bookings.filter(r=>r.status==='approved').length;
  const spent = bookings.filter(r=>r.status==='approved'||r.status==='completed').reduce((s,r)=>s+Number(r.total),0);
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Hi, {user.firstName} 👋</div><div className="ph-sub">Find your next rental</div></div></div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="sc"><div className="sc-lbl">My Bookings</div><div className="sc-val">{bookings.length}</div></div>
        <div className="sc"><div className="sc-lbl">Active</div><div className="sc-val" style={{color:'#4ade80'}}>{active}</div></div>
        <div className="sc"><div className="sc-lbl">Total Spent</div><div className="sc-val">₹{spent.toLocaleString('en-IN')}</div></div>
      </div>
      <div><div className="ph-title" style={{fontSize:'1.1rem',marginBottom:14}}>Available Near You</div>
        {available.length===0 ? <div style={{color:'var(--muted)',fontSize:'.88rem',textAlign:'center',padding:24}}>No items available yet</div>
          : <div className="ig">{available.slice(0,6).map(i=><ItemCard key={i.id} item={i} onClick={setSelected} />)}</div>}
      </div>
      {selected && <ItemDetailModal itemId={selected} onClose={()=>setSelected(null)} onBooked={load} />}
    </div>
  );
}

/* ── Browse Items ── */
export function BrowseItems() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const load = (q=query,c=cat) => { setLoading(true); const p={}; if(q)p.query=q; if(c!=='all')p.category=c; api.get('/items/browse',{params:p}).then(r=>setItems(r.data)).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);
  return (
    <div>
      <div className="ph"><div><div className="ph-title">Browse Items</div><div className="ph-sub">{items.length} available</div></div></div>
      <div className="fbar">
        <input className="finput" placeholder="🔍 Search items…" value={query} style={{flex:1,maxWidth:300}} onChange={e=>{setQuery(e.target.value);load(e.target.value,cat);}} />
        <select className="fselect" value={cat} onChange={e=>{setCat(e.target.value);load(query,e.target.value);}}>
          <option value="all">All Categories</option>
          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {loading ? <div style={{textAlign:'center',padding:40,color:'var(--muted)'}}>Loading…</div>
        : items.length===0 ? <EmptyState icon="🔍" title="No items found" sub="Try adjusting your search" />
        : <div className="ig">{items.map(i=><ItemCard key={i.id} item={i} onClick={setSelected} />)}</div>}
      {selected && <ItemDetailModal itemId={selected} onClose={()=>setSelected(null)} onBooked={()=>load()} />}
    </div>
  );
}

/* ── My Bookings ── */
export function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [qrRental, setQrRental] = useState(null);
  const [reviewRental, setReviewRental] = useState(null);
  const today = new Date().toISOString().slice(0,10);
  const load = () => api.get('/rentals/my-bookings').then(r=>setBookings(r.data)).catch(()=>{});
  useEffect(()=>{ load(); },[]);
  const statusClass = s => ({pending:'rs-p',approved:'rs-a',rejected:'rs-r',completed:'rs-c',cancelled:'rs-r'}[s]||'rs-p');
  return (
    <div>
      <div className="ph"><div><div className="ph-title">My Bookings</div><div className="ph-sub">{bookings.length} booking{bookings.length!==1?'s':''}</div></div></div>
      {bookings.length===0 ? <EmptyState icon="📋" title="No bookings yet" sub="Browse items and make your first rental" />
        : (
          <div className="rlist">
            {bookings.map(r=>{
              const isOverdue = r.status==='approved' && r.endDate<today;
              return (
                <div key={r.id} className="rcard" style={{borderColor:isOverdue?'rgba(248,113,113,.35)':undefined,flexWrap:'wrap',gap:10}}>
                  <div className="ri" style={{background:'rgba(37,99,168,.1)'}}>{r.itemEmoji||'📦'}</div>
                  <div style={{flex:1,minWidth:180}}>
                    <div className="r-title">{r.itemName}{r.ownerName?' — by '+r.ownerName:''}</div>
                    <div className="r-meta">📅 {r.startDate} → {r.endDate} · {r.days} day(s) · ₹{Number(r.total).toLocaleString('en-IN')}</div>
                    {r.status==='approved' && (
                      <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
                        <span style={{fontSize:'.72rem',padding:'2px 8px',borderRadius:'100px',border:'1px solid',background:r.pickedUp?'rgba(74,222,128,.1)':'rgba(255,255,255,.04)',color:r.pickedUp?'#4ade80':'var(--muted)',borderColor:r.pickedUp?'rgba(74,222,128,.25)':'var(--border)'}}>{r.pickedUp?'✓ Picked up':'⬡ Not picked up'}</span>
                        <span style={{fontSize:'.72rem',padding:'2px 8px',borderRadius:'100px',border:'1px solid',background:r.returned?'rgba(74,222,128,.1)':'rgba(255,255,255,.04)',color:r.returned?'#4ade80':'var(--muted)',borderColor:r.returned?'rgba(74,222,128,.25)':'var(--border)'}}>{r.returned?'✓ Returned':'⬡ Not returned'}</span>
                      </div>
                    )}
                    {isOverdue && <div style={{fontSize:'.74rem',color:'#f87171',marginTop:3}}>⚠ Overdue — please return the item</div>}
                  </div>
                  <span className={`rs ${statusClass(r.status)}`}>{isOverdue?'overdue':r.status}</span>
                  {r.status==='approved' && <button className="btn btn-ghost btn-xs" onClick={()=>setQrRental(r)}>📱 QR</button>}
                  {(r.status==='approved' || r.status==='completed') && !r.isRenterReviewed && <button className="btn btn-ghost btn-xs" onClick={()=>setReviewRental(r)}>Review</button>}
                </div>
              );
            })}
          </div>
        )
      }
      {qrRental && <QRModal rental={qrRental} onClose={()=>setQrRental(null)} />}
      {reviewRental && <ReviewModal rental={reviewRental} onClose={()=>setReviewRental(null)} onDone={load} />}
    </div>
  );
}

/* ── QR Modal (renter shows to owner) ── */
function QRModal({ rental, onClose }) {
  const qrData = encodeURIComponent(JSON.stringify({rentalId:rental.id,itemId:rental.itemId,start:rental.startDate,end:rental.endDate}));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&bgcolor=13151C&color=F07C2B&qzone=2`;
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:440}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{textAlign:'center',padding:'8px 0 18px'}}>
          <div style={{fontSize:'2rem',marginBottom:10}}>📱</div>
          <div className="modal-title" style={{fontSize:'1.35rem',marginBottom:4}}>Rental QR Code</div>
          <div className="modal-sub">Show this to the owner for item pickup &amp; return</div>
        </div>
        <div style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:16,padding:24,textAlign:'center',marginBottom:18}}>
          <img src={qrUrl} alt="QR Code" style={{width:180,height:180,borderRadius:12,marginBottom:16}} onError={e=>{ e.target.style.display='none'; }} />
          <div style={{fontFamily:'monospace',fontSize:'.78rem',color:'var(--orange)',background:'rgba(240,124,43,.08)',border:'1px solid rgba(240,124,43,.2)',borderRadius:8,padding:'6px 12px',display:'inline-block',letterSpacing:'.05em'}}>RENTAL-{rental.id?.slice(-8).toUpperCase()}</div>
        </div>
        {[['Item',rental.itemEmoji+' '+rental.itemName],['Owner',rental.ownerName||'—'],['Rental period',`${rental.startDate} → ${rental.endDate}`],['Total',`₹${Number(rental.total).toLocaleString('en-IN')}`]].map(([k,v],i,arr)=>(
          <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:'.84rem',padding:'8px 0',borderBottom:i<arr.length-1?'1px solid var(--border)':'none'}}>
            <span style={{color:'var(--muted)'}}>{k}</span>
            <span style={{color:k==='Total'?'#4ade80':'#fff',fontWeight:k==='Total'?600:400}}>{v}</span>
          </div>
        ))}
        <div style={{marginTop:14,background:'rgba(96,165,250,.06)',border:'1px solid rgba(96,165,250,.2)',borderRadius:12,padding:'12px 14px',fontSize:'.8rem',color:'rgba(96,165,250,.9)',lineHeight:1.6}}>
          📌 <strong>How to use:</strong> Show this QR to the owner when picking up the item. The owner scans it to confirm pickup. Show again when returning to confirm return and close the rental.
        </div>
      </div>
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
    try { await api.post('/reviews',{rentalId:rental.id,itemId:rental.itemId,ownerId:rental.ownerId,rating:star,comment}); toast('Review submitted! ⭐','s'); onDone&&onDone(); onClose(); }
    catch(e) { toast(e.response?.data?.error||'Failed','e'); }
    finally { setLoading(false); }
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={{fontSize:'2.8rem',marginBottom:10}}>{rental.itemEmoji||'⭐'}</div>
          <div className="modal-title" style={{fontSize:'1.35rem'}}>Leave a Review</div>
          <div className="modal-sub" style={{marginBottom:0}}>How was renting {rental.itemName}?</div>
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

/* ── My Reviews ── */
export function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  useEffect(()=>{ api.get('/reviews/my').then(r=>setReviews(r.data)).catch(()=>{}); },[]);
  const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : 0;
  return (
    <div>
      <div className="ph"><div><div className="ph-title">{user.role==='owner'?'Reviews Received':'My Reviews'}</div><div className="ph-sub">{reviews.length} review{reviews.length!==1?'s':''}{reviews.length>0?` · ⭐ ${avg} avg`:''}</div></div></div>
      {reviews.length===0 ? <EmptyState icon="⭐" title="No reviews yet" sub={user.role==='owner'?'Reviews from renters will appear here':'Complete a rental to leave a review'} />
        : reviews.map(r=>(
          <div key={r.id} className="review-card">
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:9}}>
              <div className="av" style={{background:r.renterColor||'#555',width:34,height:34}}>{r.renterName?.[0]||'?'}</div>
              <div><div style={{fontWeight:600,color:'#fff',fontSize:'.88rem'}}>{r.renterName}</div><div style={{fontSize:'.74rem',color:'var(--muted)'}}>{r.itemName} · {r.date}</div></div>
              <div className="star-row" style={{marginLeft:'auto',fontSize:'.9rem'}}>{'⭐'.repeat(r.rating)}</div>
            </div>
            <div style={{fontSize:'.84rem',color:'var(--muted)',lineHeight:1.5}}>{r.comment}</div>
          </div>
        ))
      }
    </div>
  );
}
