import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const EMOJIS=['📷','⛺','🔧','🚲','🚁','📽','🎸','🏄','🎿','🛶','🔬','🎮','📚','🎨','🪴','🎻','🧳','🛴','🎤'];
const CATS=['Electronics','Outdoors','Tools','Sports','Vehicles','Home & Garden','Music','Books','Fashion','Other'];

/* ── ItemCard ── */
export function ItemCard({ item, onClick, pendingRequests = 0, isOwner = false, onEdit, onDelete }) {
  const imgs = (() => { try { const p = JSON.parse(item.images || '[]'); return Array.isArray(p) ? p : []; } catch { return []; } })();

  // Map actual backend status to display label & badge class
  let statusLabel = 'Available';
  let statusClass = 'available';
  if (!item.approved) {
    statusLabel = 'Under Admin Review';
    statusClass = 'pending';
  } else if (item.status === 'rented') {
    statusLabel = 'Rented';
    statusClass = 'rented';
  } else if (item.status === 'suspended') {
    statusLabel = 'Suspended';
    statusClass = 'suspended';
  } else if (item.status === 'rejected') {
    statusLabel = 'Rejected';
    statusClass = 'rejected';
  } else if (item.status) {
    statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    statusClass = item.status.toLowerCase();
  }

  const hasRating = item.reviewCount != null && Number(item.reviewCount) > 0 && item.avgRating != null;

  return (
    <div className="icard" onClick={() => onClick && onClick(item.id)}>
      <div className="icard-img">
        {imgs.length > 0 ? (
          <img src={imgs[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: '2.5rem' }}>{item.emoji || '📦'}</div>
        )}
        <span className={`ibadge ${statusClass}`}>{statusLabel}</span>
      </div>
      <div className="icard-body">
        <div className="icard-name">{item.name}</div>
        <div className="icard-cat">{item.category}</div>
        
        {/* Rating Safety: Only display if valid reviewCount > 0 exists */}
        {hasRating ? (
          <div className="icard-rating-badge">
            <span>⭐</span>
            <span>{Number(item.avgRating).toFixed(1)}</span>
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({item.reviewCount})</span>
          </div>
        ) : (
          <div className="icard-rating-empty">No reviews yet</div>
        )}

        <div className="icard-meta-row">
          <div className="icard-price">₹{Number(item.price).toLocaleString('en-IN')}<span>/{item.unit || 'day'}</span></div>
          {item.location && <div className="icard-loc">📍 {item.location}</div>}
        </div>

        {!item.approved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.74rem', color: '#fbbf24', marginTop: 8, padding: '5px 9px', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 8 }}>
            ⏳ Under Admin Review
          </div>
        )}
        {isOwner && pendingRequests > 0 && (
          <div style={{ fontSize: '.75rem', color: '#fbbf24', marginTop: 6, fontWeight: 500 }}>
            ⏳ {pendingRequests} pending request{pendingRequests !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Owner controls only rendered when isOwner is true */}
      {isOwner && (onEdit || onDelete) && (
        <div className="icard-actions" onClick={e => e.stopPropagation()}>
          {onEdit && (
            <button type="button" className="btn btn-ghost btn-xs" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(item)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button type="button" className="btn btn-red btn-xs" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(item.id)}>
              Delete
            </button>
          )}
        </div>
      )}
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
    api.get(`/items/${itemId}`).then(r => setItem(r.data)).catch(() => {});
    api.get(`/reviews/item/${itemId}`).then(r => setReviews(r.data)).catch(() => {});
  }, [itemId]);

  const imgs = (() => { try { return JSON.parse(item?.images || '[]'); } catch { return []; } })();
  const today = new Date().toISOString().slice(0, 10);
  const days = startDate && endDate ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))) : 0;
  const total = days * Number(item?.price || 0);
  const hasReviews = reviews.length > 0;
  const avg = hasReviews ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const isRenter = user?.role === 'renter';

  const book = async () => {
    if (!startDate || !endDate) { toast('Please select start and end dates', 'e'); return; }
    if (days <= 0) { toast('End date must be after start date', 'e'); return; }
    setLoading(true);
    try {
      await api.post('/rentals', { itemId, startDate, endDate, message: msg });
      toast('Rental request sent to owner! 📨', 's');
      onBooked && onBooked();
      onClose();
    } catch (e) {
      toast(e.response?.data?.error || 'Booking request failed', 'e');
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="overlay">
        <div className="modal">
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>Loading item details…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal item-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Gallery */}
        <div className="modal-gallery">
          <div className="modal-main-img-stage">
            {imgs.length > 0 ? (
              <img src={imgs[mainImg] || imgs[0]} alt={item.name} />
            ) : (
              <div style={{ fontSize: '3.5rem' }}>{item.emoji || '📦'}</div>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="modal-thumb-strip">
              {imgs.map((src, i) => (
                <div
                  key={i}
                  className={`modal-thumb${i === mainImg ? ' active' : ''}`}
                  onClick={() => setMainImg(i)}
                >
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item Header */}
        <div className="im-name">{item.name}</div>
        <div className="dc-row" style={{ marginBottom: 14 }}>
          <div className="dc"><strong>{item.category}</strong></div>
          <div className="dc">₹<strong>{Number(item.price).toLocaleString('en-IN')}</strong>/{item.unit || 'day'}</div>
          {item.location && <div className="dc">📍 <strong>{item.location}</strong></div>}
          {hasReviews ? (
            <div className="dc">⭐ <strong>{avg}</strong> ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</div>
          ) : (
            <div className="dc" style={{ color: 'var(--muted)' }}>No reviews yet</div>
          )}
        </div>

        {/* Transparency Tags: Condition, Brand/Model, Damage */}
        {(item.condition || item.brandModel || item.damage) && (
          <div className="modal-tags-row">
            {item.condition && (
              <div className="modal-tag">
                <span>Condition:</span> <strong>{item.condition}</strong>
              </div>
            )}
            {item.brandModel && (
              <div className="modal-tag">
                <span>Model:</span> <strong>{item.brandModel}</strong>
              </div>
            )}
            {item.purchaseYear && (
              <div className="modal-tag">
                <span>Year:</span> <strong>{item.purchaseYear}</strong>
              </div>
            )}
          </div>
        )}

        {/* Disclosed Defects if any */}
        {item.damage && (
          <div style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: '.76rem', fontWeight: 600, color: '#fbbf24', marginBottom: 2 }}>⚠️ Disclosed Wear &amp; Damage</div>
            <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{item.damage}</div>
          </div>
        )}

        {/* Description */}
        {item.description && <div className="im-desc" style={{ marginBottom: 16 }}>{item.description}</div>}

        {/* Owner Info */}
        <div className="owner-row" style={{ marginBottom: 18 }}>
          <div className="av" style={{ background: '#F07C2B', width: 38, height: 38, fontSize: '.9rem' }}>👤</div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '.9rem' }}>Equipment Owner</div>
            <div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>📍 {item.location || 'Local area'}</div>
          </div>
        </div>

        {/* Rental Booking Box for Renter */}
        {isRenter && item.status === 'available' && (
          <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: 12, fontSize: '.92rem' }}>📅 Request Rental</div>
            <div className="date-row">
              <div>
                <label className="fl">Start Date</label>
                <input
                  className="fi"
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="fl">End Date</label>
                <input
                  className="fi"
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Estimated Total Calculation using existing formula */}
            {days > 0 && (
              <div className="modal-calc-card">
                <div>
                  <div className="modal-calc-lbl">Estimated Total</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted2)', marginTop: 2 }}>
                    {days} day{days !== 1 ? 's' : ''} × ₹{Number(item.price).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="modal-calc-val">₹{total.toLocaleString('en-IN')}</div>
              </div>
            )}

            <div className="fg" style={{ marginTop: 10 }}>
              <label className="fl">Message to Owner (optional)</label>
              <textarea
                className="fi"
                rows={2}
                placeholder="Hi, I'd like to rent your item for a project…"
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              onClick={book}
              disabled={loading}
            >
              {loading ? 'Sending Request…' : 'Send Rental Request'}
            </button>
          </div>
        )}

        {!user && (
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Sign In to Rent
          </button>
        )}

        {user?.id === item.ownerId && (
          <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '10px 14px', fontSize: '.84rem', color: 'var(--muted)', textAlign: 'center', marginBottom: 14 }}>
            This is your listing
          </div>
        )}

        {/* Reviews List */}
        {hasReviews && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: 10, fontSize: '.9rem' }}>
              Reviews ({reviews.length})
            </div>
            {reviews.slice(0, 4).map(r => (
              <div key={r.id} className="review-card">
                <div className="star-row" style={{ marginBottom: 6 }}>{'⭐'.repeat(r.rating)}</div>
                <div style={{ fontSize: '.84rem', color: 'var(--muted)', marginBottom: 6 }}>{r.comment}</div>
                <div style={{ fontSize: '.74rem', color: 'var(--muted2)' }}>{r.renterName} · {r.date}</div>
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

  const confirmPickup = async () => {
    setLoading(true);
    try {
      await api.patch(`/rentals/${rental.id}/pickup`, { pickedUp: true });
      setData(p => ({ ...p, pickedUp: true }));
      toast('Pickup confirmed ✅', 's');
      onUpdate();
    } catch {
      toast('Failed to confirm pickup', 'e');
    } finally {
      setLoading(false);
    }
  };

  const confirmReturn = async () => {
    setLoading(true);
    try {
      await api.patch(`/rentals/${rental.id}/return`);
      setData(p => ({ ...p, returned: true, status: 'completed' }));
      toast('Return confirmed — rental closed! 🎉', 's');
      onUpdate();
    } catch {
      toast('Failed to confirm return', 'e');
    } finally {
      setLoading(false);
    }
  };

  const code = rental.id ? rental.id.slice(-8).toUpperCase() : 'UNKNOWN';
  const rentalIdDisplay = `RENTAL-${code}`;

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>

        <div style={{ textAlign: 'center', padding: '6px 0 16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>📱</div>
          <div className="modal-title" style={{ fontSize: '1.25rem', marginBottom: 4 }}>QR Scan — Item Handover</div>
          <div className="modal-sub">Confirm pickup and return securely.</div>
        </div>

        {/* 2-Step Progress Stepper */}
        <div className="qr-stepper-v2">
          <div className={`qr-step-pill ${data.pickedUp ? 'done' : 'active'}`}>
            <span>{data.pickedUp ? '✓' : '①'}</span>
            <span>{data.pickedUp ? 'PICKED UP' : 'PICKUP'}</span>
          </div>
          <div className={`qr-step-divider ${data.pickedUp ? 'done' : ''}`} />
          <div className={`qr-step-pill ${data.returned ? 'done' : data.pickedUp ? 'active' : ''}`}>
            <span>{data.returned ? '✓' : '②'}</span>
            <span>{data.returned ? 'RETURNED' : 'RETURN'}</span>
          </div>
        </div>

        {/* Rental Summary */}
        <div className="qr-rental-summary">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.6rem', width: 44, height: 44, borderRadius: 10, background: 'rgba(240,124,43,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {rental.itemEmoji || '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rental.itemName}
              </div>
              <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginTop: 2 }}>
                📅 {rental.startDate} → {rental.endDate} · {rental.days} day(s)
              </div>
            </div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.15rem', fontWeight: 700, color: '#4ade80', flexShrink: 0 }}>
              ₹{Number(rental.total).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="av" style={{ background: rental.renterColor || '#555', width: 26, height: 26, fontSize: '.68rem' }}>
                {rental.renterName?.[0] || '?'}
              </div>
              <span style={{ color: '#fff' }}>{rental.renterName}</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--orange)', background: 'rgba(240,124,43,.08)', border: '1px solid rgba(240,124,43,.2)', borderRadius: 6, padding: '2px 8px' }}>
              {rentalIdDisplay}
            </div>
          </div>
        </div>

        {/* Action Panel based on state */}
        {!data.pickedUp ? (
          <div className="qr-action-panel pickup-mode">
            <div style={{ fontSize: '.9rem', color: '#fff', fontWeight: 600, marginBottom: 4 }}>Step 1 — Confirm Pickup</div>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 10 }}>
              Ask the renter to show their QR code. Verify that the rental ID matches.
            </div>
            <div className="qr-code-display">{rentalIdDisplay}</div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={confirmPickup}
              disabled={loading}
            >
              {loading ? 'Confirming…' : '✓ Confirm Item Picked Up'}
            </button>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5, marginTop: 10 }}>
              Tap only after you have physically handed the item to the renter and verified their QR code matches this rental ID
            </div>
          </div>
        ) : !data.returned ? (
          <div className="qr-action-panel return-mode">
            <div style={{ fontSize: '.9rem', color: '#fff', fontWeight: 600, marginBottom: 4 }}>Step 2 — Confirm Return</div>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 10 }}>
              Inspect the item condition before confirming the return.
            </div>
            <div className="qr-code-display">{rentalIdDisplay}</div>
            <button
              className="btn btn-green"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={confirmReturn}
              disabled={loading}
            >
              {loading ? 'Confirming…' : '✓ Confirm Item Returned'}
            </button>
            <div style={{ fontSize: '.74rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5, marginTop: 10 }}>
              Check the item condition before confirming. Once confirmed, the rental is closed and the security deposit is released
            </div>
          </div>
        ) : (
          <div className="qr-completed-state">
            <div className="qr-completed-icon">🎉</div>
            <div className="qr-completed-title">✓ Rental Completed</div>
            <div className="qr-completed-sub">Transaction successfully closed.</div>
            <div className="qr-completed-details">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--muted)' }}>Item</span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{rental.itemName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--muted)' }}>Rental period</span>
                <span style={{ color: '#fff' }}>{rental.startDate} → {rental.endDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--muted)' }}>Duration</span>
                <span style={{ color: '#fff' }}>{rental.days} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>Total</span>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>₹{Number(rental.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Renter Profile Modal (full, with real data) ── */
function RenterProfileModal({ rental, onClose, onAction, actionLoading }) {
  const [completedCount, setCompletedCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [renterReviews, setRenterReviews] = useState([]);
  const [renterStatus, setRenterStatus] = useState('active');

  useEffect(() => {
    // Fetch renter's booking history and reviews
    api.get('/admin/rentals').then(r => {
      const completed = r.data.filter(x => x.renterId === rental.renterId && (x.status === 'approved' || x.status === 'completed'));
      setCompletedCount(completed.length);
    }).catch(() => {});
    api.get('/admin/reviews').then(r => {
      const revs = r.data.filter(x => x.renterId === rental.renterId);
      setRenterReviews(revs);
      if (revs.length) setAvgRating((revs.reduce((s, x) => s + x.rating, 0) / revs.length).toFixed(1));
    }).catch(() => {});
    api.get('/admin/users').then(r => {
      const u = r.data.find(x => x.id === rental.renterId);
      if (u) setRenterStatus(u.status);
    }).catch(() => {});
  }, [rental.renterId]);

  const sb = renterStatus === 'verified' ? 'ab-blue' : renterStatus === 'suspended' ? 'ab-red' : 'ab-green';

  const handleApprove = () => {
    onAction(rental.id, 'approved');
  };

  const handleReject = () => {
    if (window.confirm("Are you sure you want to reject this rental request?")) {
      onAction(rental.id, 'rejected');
    }
  };

  const isApproving = actionLoading === `${rental.id}-approved`;
  const isRejecting = actionLoading === `${rental.id}-rejected`;

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal renter-profile-v2" style={{ maxWidth: 480 }}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="av" style={{ background: rental.renterColor || '#555', width: 56, height: 56, fontSize: '1.5rem', margin: '0 auto 10px' }}>
            {rental.renterName?.[0] || '?'}
          </div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
            {rental.renterName}
          </div>
          <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 2 }}>Member since —</div>
          <span className={`abadge ${sb}`} style={{ marginTop: 6, display: 'inline-block' }}>● {renterStatus}</span>
        </div>

        <div className="trust-summary-grid">
          <div className="trust-metric-card">
            <div className="trust-metric-val">{completedCount}</div>
            <div className="trust-metric-lbl">Completed Rentals</div>
          </div>
          <div className="trust-metric-card">
            <div className="trust-metric-val" style={{ color: avgRating ? '#fbbf24' : '#fff' }}>
              {avgRating ? `⭐ ${avgRating}` : '—'}
            </div>
            <div className="trust-metric-lbl">Average Rating</div>
          </div>
          <div className="trust-metric-card">
            <div className="trust-metric-val">{renterReviews.length}</div>
            <div className="trust-metric-lbl">Reviews Received</div>
          </div>
        </div>

        {renterReviews.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '.84rem', fontWeight: 600, color: '#fff', marginBottom: 9 }}>Reviews about this renter</div>
            {renterReviews.slice(0, 3).map(rv => (
              <div key={rv.id} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: 11, marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 500, color: '#fff' }}>Owner</span>
                  <span className="star-row" style={{ fontSize: '.82rem' }}>{'⭐'.repeat(rv.rating)}</span>
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{rv.comment}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: 13, textAlign: 'center', marginBottom: 16, fontSize: '.84rem', color: 'var(--muted)' }}>
            No reviews yet — this is a new renter
          </div>
        )}

        <div className="current-request-card">
          <div className="current-request-head">Current Rental Request</div>
          {[
            ['Item', `${rental.itemEmoji || '📦'} ${rental.itemName}`],
            ['Period', `${rental.startDate} → ${rental.endDate} · ${rental.days} days`],
            ['Total', `₹${Number(rental.total).toLocaleString('en-IN')}`]
          ].map(([k, v], i, arr) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '5px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ color: k === 'Total' ? '#4ade80' : '#fff', fontWeight: k === 'Total' ? 600 : 400 }}>{v}</span>
            </div>
          ))}
        </div>

        {rental.status === 'pending' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-red"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleReject}
              disabled={isRejecting || isApproving}
            >
              {isRejecting ? 'Rejecting…' : '✕ Reject Request'}
            </button>
            <button
              className="btn btn-green"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? 'Approving…' : '✓ Approve Request'}
            </button>
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
  const [actionLoading, setActionLoading] = useState(null);

  const action = async (id, status) => {
    setActionLoading(`${id}-${status}`);
    try {
      await api.patch(`/rentals/${id}/status`, { status });
      toast(status === 'approved' ? 'Request approved! ✅' : 'Request rejected', status === 'approved' ? 's' : '');
      if (renterModal && renterModal.id === id) {
        setRenterModal(null);
      }
      onUpdate();
    } catch {
      toast('Action failed', 'e');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (r) => {
    if (window.confirm('Are you sure you want to reject this rental request?')) {
      action(r.id, 'rejected');
    }
  };

  if (!rentals.length) return <EmptyState icon="📋" title="No requests" sub="Rental requests will appear here" />;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rentals.map(r => {
          let statusText = r.status;
          let statusClass = 'st-pending';
          if (r.status === 'pending') {
            statusText = '● Awaiting Your Decision';
            statusClass = 'st-pending';
          } else if (r.status === 'approved') {
            if (!r.pickedUp) {
              statusText = '● Approved — Ready for item handover';
              statusClass = 'st-approved-pickup';
            } else if (r.pickedUp && !r.returned) {
              statusText = '● Picked Up — Active with Renter';
              statusClass = 'st-picked-up';
            } else {
              statusText = '● Rental Completed';
              statusClass = 'st-completed';
            }
          } else if (r.status === 'completed') {
            statusText = '● Rental Completed';
            statusClass = 'st-completed';
          } else if (r.status === 'rejected') {
            statusText = '✕ Request Declined';
            statusClass = 'st-rejected';
          }

          const isApproving = actionLoading === `${r.id}-approved`;
          const isRejecting = actionLoading === `${r.id}-rejected`;

          return (
            <div key={r.id} className={`req-card-v2 ${r.status === 'pending' ? 'st-pending-card' : ''}`}>
              {/* Header: Item, Meta, Status */}
              <div className="req-header">
                <div className="req-item-block">
                  <div className="req-item-thumb">
                    {r.itemEmoji || '📦'}
                  </div>
                  <div>
                    <div className="req-item-title">{r.itemName || 'Item'}</div>
                    <div className="req-meta">
                      <span>📅 {r.startDate} → {r.endDate}</span>
                      <span>·</span>
                      <span>{r.days} day(s)</span>
                      <span>·</span>
                      <span className="req-total">Total ₹{Number(r.total).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div className={`req-status-pill ${statusClass}`}>
                  {statusText}
                </div>
              </div>

              {/* Optional Renter Message */}
              {r.message && r.message.trim() && (
                <div className="req-message">
                  "{r.message}"
                </div>
              )}

              {/* Renter Mini-Profile Box */}
              <div className="req-renter-box">
                <div className="req-renter-left">
                  <div className="av" style={{ background: r.renterColor || '#555', width: 34, height: 34, fontSize: '.8rem', flexShrink: 0 }}>
                    {r.renterName?.[0] || '?'}
                  </div>
                  <div>
                    <div className="req-renter-name">{r.renterName || 'Renter'}</div>
                    <div className="req-renter-sub">Renter · Verified Member</div>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setRenterModal(r)}
                >
                  View Profile
                </button>
              </div>

              {/* Actions Bar */}
              <div className="req-actions-bar">
                {r.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-red btn-xs"
                      onClick={() => handleReject(r)}
                      disabled={isRejecting || isApproving}
                    >
                      {isRejecting ? 'Rejecting…' : 'Reject'}
                    </button>
                    <button
                      className="btn btn-green btn-xs"
                      onClick={() => action(r.id, 'approved')}
                      disabled={isApproving || isRejecting}
                    >
                      {isApproving ? 'Approving…' : '✓ Approve'}
                    </button>
                  </>
                )}

                {r.status === 'approved' && (
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => setQrModal(r)}
                  >
                    📱 Scan / Verify QR
                  </button>
                )}

                {(r.status === 'approved' || r.status === 'completed') && !r.isOwnerReviewed && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setReviewRental(r)}
                  >
                    Review Renter
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {renterModal && (
        <RenterProfileModal
          rental={renterModal}
          onClose={() => setRenterModal(null)}
          onAction={action}
          actionLoading={actionLoading}
        />
      )}
      {qrModal && (
        <OwnerQRModal
          rental={qrModal}
          onClose={() => setQrModal(null)}
          onUpdate={() => { onUpdate(); setQrModal(null); }}
        />
      )}
      {reviewRental && (
        <ReviewModal
          rental={reviewRental}
          onClose={() => setReviewRental(null)}
          onDone={onUpdate}
        />
      )}
    </>
  );
}

/* ── Conditions Definition ── */
const CONDITIONS = [
  { val: 'New', title: 'New', desc: 'Unused / original packaging' },
  { val: 'Like New', title: 'Like New', desc: 'Barely used, flawless condition' },
  { val: 'Good', title: 'Good', desc: 'Minor cosmetic wear, fully works' },
  { val: 'Fair', title: 'Fair', desc: 'Visible wear/marks, fully functional' }
];

/* ── Owner Overview ── */
export function OwnerOverview({ onNav }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => {
    api.get('/items/my').then(r => setItems(r.data)).catch(() => {});
    api.get('/rentals/requests').then(r => setRentals(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const earned = rentals.filter(r => r.status === 'approved' || r.status === 'completed').reduce((s, r) => s + Number(r.total), 0);
  const pending = rentals.filter(r => r.status === 'pending').length;

  const hasFirstListing = items.length > 0;
  const hasFirstRequest = rentals.length > 0;
  const hasCompletedRental = rentals.some(r => r.status === 'completed' || r.returned);

  if (editing) {
    return <AddEditItem onNav={onNav} editData={editing} onDone={() => { setEditing(null); load(); }} />;
  }

  return (
    <div>
      <AnnouncementBanner />
      <div className="ph">
        <div>
          <div className="ph-title">Good day, {user.firstName} 👋</div>
          <div className="ph-sub">Here's your listing overview and equipment performance</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNav('add-item')}>+ Add Item</button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="sc">
          <div className="sc-lbl">Listings</div>
          <div className="sc-val">{items.length}</div>
        </div>
        <div className="sc">
          <div className="sc-lbl">Pending</div>
          <div className="sc-val" style={{ color: '#fbbf24' }}>{pending}</div>
        </div>
        <div className="sc">
          <div className="sc-lbl">Earned</div>
          <div className="sc-val" style={{ color: '#4ade80' }}>₹{earned.toLocaleString('en-IN')}</div>
        </div>
        <div className="sc">
          <div className="sc-lbl">Total Rentals</div>
          <div className="sc-val">{rentals.length}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button type="button" className="quick-act-btn" onClick={() => onNav('add-item')}>
          <span className="quick-act-icon">➕</span>
          <div style={{ textAlign: 'left' }}>
            <div>+ Add Item</div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 400 }}>List new gear for rent</div>
          </div>
        </button>
        <button type="button" className="quick-act-btn" onClick={() => onNav('requests')}>
          <span className="quick-act-icon">📋</span>
          <div style={{ textAlign: 'left' }}>
            <div>View Requests</div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 400 }}>{pending > 0 ? `${pending} pending approval` : 'Manage all bookings'}</div>
          </div>
        </button>
        <button type="button" className="quick-act-btn" onClick={() => onNav('calendar')}>
          <span className="quick-act-icon">📅</span>
          <div style={{ textAlign: 'left' }}>
            <div>Availability Calendar</div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 400 }}>Dates & booking schedule</div>
          </div>
        </button>
      </div>

      {/* Getting Started Checklist (Derived from REAL application data) */}
      <div className="checklist-card">
        <div className="checklist-title">
          <span>🚀</span> Getting Started with RentLoop
        </div>
        <div className="checklist-sub">Complete these milestones to maximize your equipment rental earnings</div>
        <div className="check-item done">
          <div className="check-icon">✓</div>
          <div><strong>Account created</strong> — Registered and verified on RentLoop</div>
        </div>
        <div className={`check-item ${hasFirstListing ? 'done' : 'pending'}`}>
          <div className="check-icon">{hasFirstListing ? '✓' : '○'}</div>
          <div><strong>First listing added</strong> — {hasFirstListing ? `${items.length} item${items.length > 1 ? 's' : ''} listed` : 'Add your first piece of equipment to start earning'}</div>
        </div>
        <div className={`check-item ${hasFirstRequest ? 'done' : 'pending'}`}>
          <div className="check-icon">{hasFirstRequest ? '✓' : '○'}</div>
          <div><strong>Receive your first rental request</strong> — {hasFirstRequest ? `${rentals.length} request${rentals.length > 1 ? 's' : ''} received` : 'Renters nearby will request your listed items'}</div>
        </div>
        <div className={`check-item ${hasCompletedRental ? 'done' : 'pending'}`}>
          <div className="check-icon">{hasCompletedRental ? '✓' : '○'}</div>
          <div><strong>Complete your first rental</strong> — {hasCompletedRental ? 'Rental successfully closed and verified' : 'Scan QR code at pickup and return to complete transactions'}</div>
        </div>
      </div>

      {/* Marketplace Tips */}
      <div className="marketplace-tips">
        <div className="tips-title">💡 Marketplace Tips for Equipment Owners</div>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-bullet">•</span>
            <div><strong>Take clear, well-lit photos:</strong> Show front, back, accessories, and serial number. Good photos increase booking conversion by 3x.</div>
          </div>
          <div className="tip-item">
            <span className="tip-bullet">•</span>
            <div><strong>Disclose cosmetic marks honestly:</strong> Mention existing scratches or wear in your description so renters review you 5-stars for accuracy.</div>
          </div>
          <div className="tip-item">
            <span className="tip-bullet">•</span>
            <div><strong>Set competitive local rates:</strong> Competitive daily rates in your area attract repeat and long-term bookings.</div>
          </div>
        </div>
      </div>

      {/* Listings section */}
      <div style={{ marginBottom: 20 }}>
        <div className="ph-title" style={{ fontSize: '1.1rem', marginBottom: 14 }}>Your Listings</div>
        {items.length === 0 ? (
          <EmptyState icon="📦" title="No listings yet" sub="Add your first item to start earning" onAction={() => onNav('add-item')} actionLabel="+ Add Item" />
        ) : (
          <div className="ig">
            {items.slice(0, 4).map(i => (
              <ItemCard
                key={i.id}
                item={i}
                onClick={setSelectedItem}
                isOwner={true}
                onEdit={() => setEditing(i)}
                pendingRequests={rentals.filter(r => r.itemId === i.id && r.status === 'pending').length}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests section */}
      {pending > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="ph-title" style={{ fontSize: '1.1rem', marginBottom: 14 }}>Pending Requests</div>
          <RequestsList rentals={rentals.filter(r => r.status === 'pending')} onUpdate={load} />
        </div>
      )}

      {selectedItem && <ItemDetailModal itemId={selectedItem} onClose={() => setSelectedItem(null)} />}
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

  const load = () => {
    api.get('/items/my').then(r => setItems(r.data)).catch(() => {});
    api.get('/rentals/requests').then(r => setRentals(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/items/${id}`);
      toast('Listing deleted', 's');
      load();
    } catch {
      toast('Failed to delete item', 'e');
    }
  };

  const pending = items.filter(i => !i.approved).length;
  if (editing) return <AddEditItem onNav={onNav} editData={editing} onDone={() => { setEditing(null); load(); }} />;

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">My Listings</div>
          <div className="ph-sub">{items.length} item{items.length !== 1 ? 's' : ''} in your inventory</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNav('add-item')}>+ Add Item</button>
      </div>

      {pending > 0 && (
        <div style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 14, padding: '13px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1rem' }}>⏳</span>
          <div>
            <div style={{ fontSize: '.88rem', fontWeight: 600, color: '#fbbf24' }}>{pending} item{pending > 1 ? 's' : ''} awaiting admin approval</div>
            <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginTop: 1 }}>Your listing will appear to renters once an admin approves it. This usually takes a few hours.</div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon="📦" title="No listings yet" sub="List your first item and start earning" onAction={() => onNav('add-item')} actionLabel="+ Add Item" />
      ) : (
        <div className="ig">
          {items.map(i => (
            <ItemCard
              key={i.id}
              item={i}
              onClick={setSelected}
              pendingRequests={rentals.filter(r => r.itemId === i.id && r.status === 'pending').length}
              isOwner={true}
              onEdit={() => setEditing(i)}
              onDelete={() => del(i.id)}
            />
          ))}
        </div>
      )}

      {selected && <ItemDetailModal itemId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ── Add Item ── */
export function AddItem({ onNav }) { return <AddEditItem onNav={onNav} editData={null} onDone={() => onNav('my-items')} />; }

function AddEditItem({ onNav, editData, onDone }) {
  const { user, toast } = useAuth();
  const isEdit = !!editData;
  const [form, setForm] = useState({
    name: editData?.name || '',
    description: editData?.description || '',
    category: editData?.category || 'Electronics',
    price: editData?.price || '',
    unit: editData?.unit || 'day',
    location: editData?.location || user?.location || '',
    emoji: editData?.emoji || '📷',
    serialNumber: editData?.serialNumber || '',
    brandModel: editData?.brandModel || '',
    invoiceNo: editData?.invoiceNo || '',
    condition: editData?.condition || '',
    purchaseYear: editData?.purchaseYear || '',
    damage: editData?.damage || ''
  });

  const [images, setImages] = useState(() => {
    try {
      const parsed = JSON.parse(editData?.images || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImgs = (files) => {
    const rem = 4 - images.length;
    if (!rem) {
      toast('Max 4 images allowed', 'e');
      return;
    }
    const fileArray = Array.from(files).slice(0, rem);
    fileArray.forEach(f => {
      if (f.size > 2 * 1024 * 1024) {
        toast(`"${f.name}" exceeds 2MB limit`, 'e');
        return;
      }
      const r = new FileReader();
      r.onload = ev => {
        setImages(prev => {
          if (prev.length >= 4) return prev;
          return [...prev, ev.target.result];
        });
      };
      r.readAsDataURL(f);
    });
  };

  // Live Pricing Preview calculation
  const numPrice = parseFloat(form.price) || 0;

  // Listing Completeness Meter calculation
  const calcCompleteness = () => {
    let score = 0;
    if (form.name.trim()) score += 15;
    if (numPrice > 0) score += 15;
    if (images.length >= 1) score += (images.length > 1 ? 20 : 15);
    if (form.condition) score += 15;
    if (form.category) score += 10;
    if (form.location.trim()) score += 10;
    if (form.description.trim()) score += 10;
    if (form.serialNumber.trim() || form.brandModel.trim()) score += 5;
    score = Math.min(100, score);

    let tip = '';
    if (images.length === 0) tip = 'Tip: Add at least 1 cover photo to attract renters.';
    else if (!form.name.trim()) tip = 'Tip: Enter a descriptive item name.';
    else if (!numPrice) tip = 'Tip: Set competitive rental pricing.';
    else if (!form.condition) tip = 'Tip: Select the product condition.';
    else if (!form.description.trim()) tip = 'Tip: Add a detailed description to boost renter confidence.';
    else if (!form.brandModel.trim()) tip = 'Tip: Add brand & model for faster admin verification.';
    else if (images.length < 3) tip = 'Tip: Adding 3+ photos increases booking inquiries.';
    else tip = 'Great job! Your listing has all recommended details.';

    return { score, tip };
  };

  const { score: completenessScore, tip: completenessTip } = calcCompleteness();

  const submit = async () => {
    if (!form.name.trim() || !form.price) {
      toast('Please enter item name and price', 'e');
      return;
    }
    if (!isEdit && !form.condition) {
      toast('Please select product condition', 'e');
      return;
    }
    setLoading(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        images: JSON.stringify(images)
      };
      if (isEdit) {
        await api.put(`/items/${editData.id}`, body);
        toast('Listing updated successfully!', 's');
      } else {
        await api.post('/items', body);
        toast('Item submitted for admin approval 🎉', 's');
      }
      onDone();
    } catch (e) {
      toast(e.response?.data?.error || 'Operation failed', 'e');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">{isEdit ? 'Edit Listing' : 'Add New Listing'}</div>
          <div className="ph-sub">{isEdit ? 'Update your item details and pricing' : 'List your equipment for rent on RentLoop'}</div>
        </div>
      </div>

      <div style={{ maxWidth: 680 }}>
        {/* SECTION 1: Basic Information */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="form-section-title">
              <span>1. Basic Information</span>
              <span className="form-section-badge">Required</span>
            </div>
            <div className="form-section-sub">Tell renters what you're offering.</div>
          </div>

          <div className="fg">
            <label className="fl">Item Name <span style={{ color: '#f87171' }}>*</span></label>
            <input
              className="fi"
              placeholder="e.g. Sony Alpha A7 III Camera with 28-70mm Lens"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">
              Item Photos <span style={{ color: 'var(--muted)', textTransform: 'none', fontWeight: 400 }}>(up to 4 images)</span>
            </label>
            {/* 4-slot Photo Grid */}
            <div
              className="photo-grid"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleImgs(e.dataTransfer.files); }}
            >
              {[0, 1, 2, 3].map(slotIndex => {
                const imgSrc = images[slotIndex];
                if (imgSrc) {
                  return (
                    <div key={slotIndex} className="photo-slot has-image">
                      <img src={imgSrc} alt={`Upload ${slotIndex + 1}`} />
                      {slotIndex === 0 && <span className="photo-cover-badge">★ Cover Photo</span>}
                      <button
                        type="button"
                        className="photo-remove-btn"
                        title="Remove photo"
                        onClick={e => {
                          e.stopPropagation();
                          setImages(p => p.filter((_, idx) => idx !== slotIndex));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                }
                return (
                  <div
                    key={slotIndex}
                    className="photo-slot add-slot"
                    onClick={() => fileRef.current?.click()}
                  >
                    <span style={{ fontSize: '1.4rem', marginBottom: 2 }}>+</span>
                    <span style={{ fontSize: '.72rem', fontWeight: 500 }}>
                      {slotIndex === 0 ? 'Cover Photo' : 'Add Photo'}
                    </span>
                  </div>
                );
              })}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => handleImgs(e.target.files)}
            />
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4 }}>
              First photo will be used as your listing cover. JPG, PNG, WebP · Max 2MB each.
            </div>
          </div>

          <div className="frow">
            <div className="fg">
              <label className="fl">Category</label>
              <select className="fsel" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Choose Fallback Icon</label>
              <div className="emoji-pick" style={{ marginTop: 2 }}>
                {EMOJIS.slice(0, 10).map(e => (
                  <div key={e} className={`ep${form.emoji === e ? ' sel' : ''}`} onClick={() => set('emoji', e)}>{e}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="fg">
            <label className="fl">Description</label>
            <textarea
              className="fi"
              rows={3}
              placeholder="Describe your item, included accessories, usage guidelines, and condition…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 2: Rental Details */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="form-section-title">
              <span>2. Rental Details</span>
              <span className="form-section-badge">Pricing &amp; Pickup</span>
            </div>
            <div className="form-section-sub">Set competitive pricing and pickup location.</div>
          </div>

          <div className="frow">
            <div className="fg">
              <label className="fl">Price (₹) <span style={{ color: '#f87171' }}>*</span></label>
              <input
                className="fi"
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={form.price}
                onChange={e => set('price', e.target.value)}
              />
            </div>
            <div className="fg">
              <label className="fl">Rental Unit</label>
              <select className="fsel" value={form.unit} onChange={e => set('unit', e.target.value)}>
                <option value="day">Day</option>
                <option value="hour">Hour</option>
                <option value="week">Week</option>
              </select>
            </div>
          </div>

          <div className="fg">
            <label className="fl">Pickup Location</label>
            <input
              className="fi"
              placeholder="e.g. Madhapur, Hyderabad"
              value={form.location}
              onChange={e => set('location', e.target.value)}
            />
          </div>

          {/* Frontend-only live pricing preview */}
          {numPrice > 0 && (
            <div className="pricing-preview">
              {form.unit === 'day' && (
                <>
                  <div className="pricing-preview-item">
                    <span className="pricing-preview-lbl">Daily Rate</span>
                    <span className="pricing-preview-val">₹{numPrice.toLocaleString('en-IN')} / day</span>
                  </div>
                  <div className="pricing-preview-item">
                    <span className="pricing-preview-lbl">Estimated Weekly</span>
                    <span className="pricing-preview-val">₹{(numPrice * 7).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pricing-preview-item">
                    <span className="pricing-preview-lbl">Estimated Monthly</span>
                    <span className="pricing-preview-val">₹{(numPrice * 30).toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
              {form.unit === 'hour' && (
                <>
                  <div className="pricing-preview-item">
                    <span className="pricing-preview-lbl">Hourly Rate</span>
                    <span className="pricing-preview-val">₹{numPrice.toLocaleString('en-IN')} / hr</span>
                  </div>
                  <div className="pricing-preview-item">
                    <span className="pricing-preview-lbl">Estimated 8-Hour Day</span>
                    <span className="pricing-preview-val">₹{(numPrice * 8).toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
              {form.unit === 'week' && (
                <>
                  <div className="pricing-preview-item">
                    <span className="pricing-preview-lbl">Weekly Rate</span>
                    <span className="pricing-preview-val">₹{numPrice.toLocaleString('en-IN')} / week</span>
                  </div>
                  <div className="pricing-preview-item">
                    <span className="pricing-preview-lbl">Daily Equivalent</span>
                    <span className="pricing-preview-val">₹{Math.round(numPrice / 7).toLocaleString('en-IN')} / day</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Item Condition */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="form-section-title">
              <span>3. Item Condition</span>
              <span className="form-section-badge">Transparency</span>
            </div>
            <div className="form-section-sub">Be honest about the condition. Renters will review the accuracy of your listing.</div>
          </div>

          <div className="fg">
            <label className="fl">Product Condition <span style={{ color: '#f87171' }}>*</span></label>
            <div className="condition-grid">
              {CONDITIONS.map(c => (
                <div
                  key={c.val}
                  className={`condition-card${form.condition === c.val ? ' active' : ''}`}
                  onClick={() => set('condition', c.val)}
                >
                  <div className="condition-title">{c.title}</div>
                  <div className="condition-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="frow">
            <div className="fg">
              <label className="fl">Purchase Year</label>
              <input
                className="fi"
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                placeholder="e.g. 2023"
                value={form.purchaseYear}
                onChange={e => set('purchaseYear', e.target.value)}
              />
            </div>
          </div>

          <div className="fg">
            <label className="fl">Existing Damage / Defects</label>
            <textarea
              className="fi"
              rows={2}
              placeholder="Describe any existing scratches, cracks, missing caps or wear…"
              value={form.damage}
              onChange={e => set('damage', e.target.value)}
            />
            <div style={{ fontSize: '.72rem', color: 'var(--muted2)', marginTop: 3 }}>
              Be honest — renters will rate your listing on accuracy.
            </div>
          </div>
        </div>

        {/* SECTION 4: Ownership & Verification */}
        <div className="form-section" style={{ background: 'rgba(240,124,43,.03)', borderColor: 'rgba(240,124,43,.2)' }}>
          <div className="form-section-head">
            <div className="form-section-title" style={{ color: 'var(--orange)' }}>
              <span>🔒 4. Ownership &amp; Verification</span>
            </div>
            <div className="form-section-sub">
              These details help RentLoop verify your item and prevent fraudulent listings. Your listing will be reviewed by an admin before it becomes available for rent.
            </div>
          </div>

          <div className="fg">
            <label className="fl">Serial Number / IMEI</label>
            <input
              className="fi"
              placeholder="Enter serial number or IMEI"
              value={form.serialNumber}
              onChange={e => set('serialNumber', e.target.value)}
            />
            <div style={{ fontSize: '.72rem', color: 'var(--muted2)', marginTop: 3 }}>
              For phones: 15-digit IMEI. For cameras/electronics: body serial number.
            </div>
          </div>

          <div className="fg">
            <label className="fl">Brand &amp; Model</label>
            <input
              className="fi"
              placeholder="e.g. Sony Alpha A7 III"
              value={form.brandModel}
              onChange={e => set('brandModel', e.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">Purchase Invoice / Proof Number (optional)</label>
            <input
              className="fi"
              placeholder="Invoice no. or purchase receipt reference"
              value={form.invoiceNo}
              onChange={e => set('invoiceNo', e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 5: Review & Submission */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="form-section-title">
              <span>5. Review &amp; Submission</span>
            </div>
            <div className="form-section-sub">Review your listing completeness and submit for verification.</div>
          </div>

          {/* Stepper track */}
          <div className="stepper-track">
            <div className="stepper-step">
              <div className="stepper-num">1</div>
              <div>
                <div className="stepper-label">Submit Listing</div>
                <div className="stepper-sub">You fill details</div>
              </div>
            </div>
            <div className="stepper-arrow">→</div>
            <div className="stepper-step">
              <div className="stepper-num">2</div>
              <div>
                <div className="stepper-label">Admin Review</div>
                <div className="stepper-sub">Safety check</div>
              </div>
            </div>
            <div className="stepper-arrow">→</div>
            <div className="stepper-step">
              <div className="stepper-num">3</div>
              <div>
                <div className="stepper-label">Approved</div>
                <div className="stepper-sub">Status updated</div>
              </div>
            </div>
            <div className="stepper-arrow">→</div>
            <div className="stepper-step">
              <div className="stepper-num">4</div>
              <div>
                <div className="stepper-label">Visible to Renters</div>
                <div className="stepper-sub">Start earning</div>
              </div>
            </div>
          </div>

          {/* Completeness Meter */}
          <div className="completeness-meter">
            <div className="completeness-head">
              <span className="completeness-label">Listing Completeness</span>
              <span className="completeness-percent">{completenessScore}%</span>
            </div>
            <div className="completeness-bar">
              <div
                className="completeness-fill"
                style={{
                  width: `${completenessScore}%`,
                  backgroundColor: completenessScore >= 80 ? '#4ade80' : completenessScore >= 50 ? 'var(--orange)' : '#fbbf24'
                }}
              />
            </div>
            <div className="completeness-tip">{completenessTip}</div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={submit}
              disabled={loading}
            >
              {loading ? (isEdit ? 'Saving…' : 'Submitting…') : (isEdit ? 'Save Changes' : 'List Item')}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onNav('my-items')}
            >
              Cancel
            </button>
          </div>

          {!isEdit && (
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 12 }}>
              📋 Your item will be reviewed by admin before becoming visible to renters in browse.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Requests Panel ── */
export function RequestsPanel() {
  const [rentals, setRentals] = useState([]);
  const [filter, setFilter] = useState('all');
  const load = () => api.get('/rentals/requests').then(r => setRentals(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const counts = {
    all: rentals.length,
    pending: rentals.filter(r => r.status === 'pending').length,
    approved: rentals.filter(r => r.status === 'approved').length,
    rejected: rentals.filter(r => r.status === 'rejected').length,
    completed: rentals.filter(r => r.status === 'completed').length,
  };

  const filtered = filter === 'all' ? rentals : rentals.filter(r => r.status === filter);

  const tabs = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'pending', label: `Pending (${counts.pending})` },
    { key: 'approved', label: `Approved (${counts.approved})` },
    { key: 'rejected', label: `Rejected (${counts.rejected})` },
    { key: 'completed', label: `Completed (${counts.completed})` },
  ];

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">Rental Requests</div>
          <div className="ph-sub">Manage incoming requests & item handovers</div>
        </div>
      </div>
      <div className="fbar">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`btn btn-xs ${filter === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
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
