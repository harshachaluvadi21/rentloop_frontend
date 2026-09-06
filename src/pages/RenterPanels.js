import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ItemCard, EmptyState, ItemDetailModal } from './OwnerPanels';

const CATS = ['Electronics', 'Outdoors', 'Tools', 'Sports', 'Vehicles', 'Home & Garden', 'Music', 'Books', 'Fashion', 'Other'];

/* ── Renter Overview ── */
export function RenterOverview({ onNav }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => {
    api.get('/rentals/my-bookings').then(r => setBookings(r.data)).catch(() => {});
    api.get('/items/browse').then(r => setAvailable(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const active = bookings.filter(r => r.status === 'approved').length;
  const spent = bookings.filter(r => r.status === 'approved' || r.status === 'completed').reduce((s, r) => s + Number(r.total), 0);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">Hi, {user.firstName} 👋</div>
          <div className="ph-sub">Find and rent quality equipment near you</div>
        </div>
      </div>

      {/* Real Statistics derived from existing data */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="sc">
          <div className="sc-lbl">My Bookings</div>
          <div className="sc-val">{bookings.length}</div>
        </div>
        <div className="sc">
          <div className="sc-lbl">Active</div>
          <div className="sc-val" style={{ color: '#4ade80' }}>{active}</div>
        </div>
        <div className="sc">
          <div className="sc-lbl">Total Spent</div>
          <div className="sc-val">₹{spent.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Empty State / Call to Action when renter has 0 bookings */}
      {bookings.length === 0 && (
        <div className="renter-welcome-card">
          <div>
            <div className="renter-welcome-title">Ready to rent something?</div>
            <div className="renter-welcome-sub">
              Find cameras, camping gear, tools, instruments and more from verified owners in your area.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNav('browse')}
          >
            🔍 Browse Items
          </button>
        </div>
      )}

      {/* How RentLoop Works Section */}
      <div style={{ marginBottom: 28 }}>
        <div className="ph-title" style={{ fontSize: '1.05rem', marginBottom: 12 }}>
          How RentLoop Works
        </div>
        <div className="how-it-works-grid">
          <div className="how-step-card">
            <div className="how-step-head">
              <div className="how-step-num">1</div>
              <div className="how-step-icon">🔍</div>
            </div>
            <div className="how-step-title">Find an item</div>
            <div className="how-step-desc">Browse local gear with verified owners and clear pricing.</div>
          </div>
          <div className="how-step-card">
            <div className="how-step-head">
              <div className="how-step-num">2</div>
              <div className="how-step-icon">📅</div>
            </div>
            <div className="how-step-title">Request your rental</div>
            <div className="how-step-desc">Pick your dates and submit your booking request to the owner.</div>
          </div>
          <div className="how-step-card">
            <div className="how-step-head">
              <div className="how-step-num">3</div>
              <div className="how-step-icon">📱</div>
            </div>
            <div className="how-step-title">Meet owner &amp; verify</div>
            <div className="how-step-desc">Show your QR code at pickup to verify item handover.</div>
          </div>
          <div className="how-step-card">
            <div className="how-step-head">
              <div className="how-step-num">4</div>
              <div className="how-step-icon">⭐</div>
            </div>
            <div className="how-step-title">Return &amp; review</div>
            <div className="how-step-desc">Return gear on time, scan QR return, and review your experience.</div>
          </div>
        </div>
      </div>

      {/* Available Near You Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="ph-title" style={{ fontSize: '1.1rem' }}>Available Near You</div>
          {available.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => onNav('browse')}
            >
              View All ({available.length}) →
            </button>
          )}
        </div>
        {available.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '.88rem', textAlign: 'center', padding: 28, background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)' }}>
            No items available right now. Check back soon!
          </div>
        ) : (
          <div className="marketplace-grid">
            {available.slice(0, 8).map(i => (
              <ItemCard key={i.id} item={i} onClick={setSelected} isOwner={false} />
            ))}
          </div>
        )}
      </div>

      {selected && <ItemDetailModal itemId={selected} onClose={() => setSelected(null)} onBooked={load} />}
    </div>
  );
}

/* ── Browse Items ── */
export function BrowseItems() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [selectedLoc, setSelectedLoc] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = (q = query, c = cat) => {
    setLoading(true);
    const p = {};
    if (q) p.query = q;
    if (c !== 'all') p.category = c;
    api.get('/items/browse', { params: p })
      .then(r => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Location filter safely derived from actual loaded items
  const availableLocations = Array.from(new Set(items.map(i => i.location).filter(Boolean))).sort();

  // Client-side filtering on existing data
  const filteredItems = items.filter(item => {
    if (selectedLoc !== 'all' && item.location !== selectedLoc) return false;
    const price = Number(item.price || 0);
    if (selectedPrice === 'under500' && price >= 500) return false;
    if (selectedPrice === '500to1500' && (price < 500 || price > 1500)) return false;
    if (selectedPrice === 'above1500' && price <= 1500) return false;
    return true;
  });

  // Client-side sorting on existing data
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
    if (sortOption === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
    if (sortOption === 'most-reviewed') return Number(b.reviewCount || 0) - Number(a.reviewCount || 0);
    if (sortOption === 'newest' && a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  const clearFilters = () => {
    setQuery('');
    setCat('all');
    setSelectedLoc('all');
    setSelectedPrice('all');
    setSortOption('default');
    load('', 'all');
  };

  const hasActiveFilters = query || cat !== 'all' || selectedLoc !== 'all' || selectedPrice !== 'all' || sortOption !== 'default';

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">Browse Items</div>
          <div className="ph-sub">Find equipment near you for your creative and outdoor projects</div>
        </div>
      </div>

      {/* Marketplace Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <span className="filter-search-icon">🔍</span>
          <input
            className="filter-search-input"
            placeholder="Search items by name, category, or location…"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              load(e.target.value, cat);
            }}
          />
        </div>

        {/* Category Filter */}
        <select
          className="filter-select-wrap"
          value={cat}
          onChange={e => {
            setCat(e.target.value);
            load(query, e.target.value);
          }}
        >
          <option value="all">All Categories</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Location Filter derived from actual items */}
        {availableLocations.length > 0 && (
          <select
            className="filter-select-wrap"
            value={selectedLoc}
            onChange={e => setSelectedLoc(e.target.value)}
          >
            <option value="all">All Locations</option>
            {availableLocations.map(loc => <option key={loc} value={loc}>📍 {loc}</option>)}
          </select>
        )}

        {/* Price Filter */}
        <select
          className="filter-select-wrap"
          value={selectedPrice}
          onChange={e => setSelectedPrice(e.target.value)}
        >
          <option value="all">Any Price</option>
          <option value="under500">Under ₹500</option>
          <option value="500to1500">₹500 – ₹1,500</option>
          <option value="above1500">₹1,500+</option>
        </select>

        {/* Sort Options */}
        <select
          className="filter-select-wrap"
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="most-reviewed">Most Reviewed</option>
          <option value="newest">Newest</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={clearFilters}
            style={{ height: 38 }}
          >
            ✕ Reset
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading items…</div>
      ) : sortedItems.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No items found"
          sub="Try another search or category"
          onAction={clearFilters}
          actionLabel="Clear Filters"
        />
      ) : (
        <div className="marketplace-grid">
          {sortedItems.map(i => (
            <ItemCard key={i.id} item={i} onClick={setSelected} isOwner={false} />
          ))}
        </div>
      )}

      {selected && <ItemDetailModal itemId={selected} onClose={() => setSelected(null)} onBooked={() => load()} />}
    </div>
  );
}

/* ── My Bookings ── */
export function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('all');
  const [qrRental, setQrRental] = useState(null);
  const [reviewRental, setReviewRental] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  const load = () => api.get('/rentals/my-bookings').then(r => setBookings(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  // Filter tabs
  const filteredBookings = bookings.filter(b => {
    if (tab === 'all') return true;
    if (tab === 'active') return b.status === 'approved';
    if (tab === 'pending') return b.status === 'pending';
    if (tab === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">My Bookings</div>
          <div className="ph-sub">Manage your active, upcoming, and completed equipment rentals</div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="fbar" style={{ marginBottom: 18 }}>
        {[
          ['all', `All (${bookings.length})`],
          ['active', `Active (${bookings.filter(r => r.status === 'approved').length})`],
          ['pending', `Pending (${bookings.filter(r => r.status === 'pending').length})`],
          ['completed', `Completed (${bookings.filter(r => r.status === 'completed').length})`]
        ].map(([val, label]) => (
          <button
            key={val}
            type="button"
            className={`btn btn-xs ${tab === val ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(val)}
          >
            {label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="You haven't booked anything yet"
          sub="Find something useful near you from verified equipment owners"
        />
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)' }}>
          No bookings found in this section.
        </div>
      ) : (
        <div>
          {filteredBookings.map(r => {
            // Safety flags derived strictly from existing backend rental properties
            const isOverdue = r.status === 'approved' && !r.returned && r.endDate < today;
            const isPending = r.status === 'pending';
            const isApproved = r.status === 'approved';
            const isCompleted = r.status === 'completed';
            const isRejected = r.status === 'rejected';

            // Lifecycle status display
            let statusText = r.status;
            let statusPillClass = 'st-pending';

            if (isOverdue) {
              statusText = '⚠ Overdue — Return Item';
              statusPillClass = 'st-overdue';
            } else if (isPending) {
              statusText = '⏳ Waiting for owner approval';
              statusPillClass = 'st-pending';
            } else if (isApproved) {
              if (r.pickedUp && !r.returned) {
                statusText = '📦 Active Rental — In your possession';
                statusPillClass = 'st-approved';
              } else {
                statusText = '✓ Rental approved — Ready for pickup';
                statusPillClass = 'st-approved';
              }
            } else if (isCompleted) {
              statusText = '🎉 Rental completed';
              statusPillClass = 'st-completed';
            } else if (isRejected) {
              statusText = '✕ Request declined';
              statusPillClass = 'st-rejected';
            }

            return (
              <div
                key={r.id}
                className={`booking-card-rich${isOverdue ? ' is-overdue' : ''}`}
              >
                <div className="booking-top-row">
                  <div className="booking-item-info">
                    <div className="booking-thumb">
                      {r.itemEmoji || '📦'}
                    </div>
                    <div>
                      <div className="booking-title">{r.itemName}</div>
                      <div className="booking-owner-sub">
                        Listed by <strong style={{ color: '#fff' }}>{r.ownerName || 'Equipment Owner'}</strong>
                      </div>
                      <div className="booking-meta-line">
                        <span>📅 {r.startDate} → {r.endDate}</span>
                        <span>·</span>
                        <span>{r.days} day{r.days !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span className="booking-total-price">₹{Number(r.total).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-status-box">
                    <span className={`booking-status-pill ${statusPillClass}`}>
                      {statusText}
                    </span>
                    {r.status === 'approved' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: '.72rem', padding: '2px 8px', borderRadius: '100px', border: '1px solid', background: r.pickedUp ? 'rgba(74,222,128,.1)' : 'rgba(255,255,255,.04)', color: r.pickedUp ? '#4ade80' : 'var(--muted)', borderColor: r.pickedUp ? 'rgba(74,222,128,.25)' : 'var(--border)' }}>
                          {r.pickedUp ? '✓ Picked up' : '○ Not picked up'}
                        </span>
                        <span style={{ fontSize: '.72rem', padding: '2px 8px', borderRadius: '100px', border: '1px solid', background: r.returned ? 'rgba(74,222,128,.1)' : 'rgba(255,255,255,.04)', color: r.returned ? '#4ade80' : 'var(--muted)', borderColor: r.returned ? 'rgba(74,222,128,.25)' : 'var(--border)' }}>
                          {r.returned ? '✓ Returned' : '○ Not returned'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prominent Actions Bar */}
                <div className="booking-actions-row">
                  {/* QR Pickup: When approved and not yet returned */}
                  {r.status === 'approved' && !r.returned && (
                    <button
                      type="button"
                      className="qr-prominent-btn"
                      onClick={() => setQrRental(r)}
                    >
                      📱 View Pickup QR
                    </button>
                  )}

                  {/* Review Button: Safe display only when eligible and not yet reviewed */}
                  {(r.status === 'approved' || r.status === 'completed') && !r.isRenterReviewed && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => setReviewRental(r)}
                    >
                      ⭐ Write Review
                    </button>
                  )}

                  {r.isRenterReviewed && (
                    <span style={{ fontSize: '.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✓ Review submitted
                    </span>
                  )}

                  <div style={{ marginLeft: 'auto', fontSize: '.74rem', color: 'var(--muted2)', fontFamily: 'monospace' }}>
                    ID: {r.id?.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {qrRental && <QRModal rental={qrRental} onClose={() => setQrRental(null)} />}
      {reviewRental && <ReviewModal rental={reviewRental} onClose={() => setReviewRental(null)} onDone={load} />}
    </div>
  );
}

/* ── QR Modal (renter shows to owner) ── */
function QRModal({ rental, onClose }) {
  const qrData = encodeURIComponent(JSON.stringify({ rentalId: rental.id, itemId: rental.itemId, start: rental.startDate, end: rental.endDate }));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&bgcolor=13151C&color=F07C2B&qzone=2`;
  const code = rental.id?.slice(-8).toUpperCase();

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ textAlign: 'center', padding: '8px 0 18px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>📱</div>
          <div className="modal-title" style={{ fontSize: '1.35rem', marginBottom: 4 }}>Rental QR Code</div>
          <div className="modal-sub">Show this to the owner for item pickup &amp; return</div>
        </div>

        <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 18 }}>
          <img
            src={qrUrl}
            alt="QR Code"
            style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 16 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '.84rem', color: 'var(--orange)', background: 'rgba(240,124,43,.08)', border: '1px solid rgba(240,124,43,.2)', borderRadius: 8, padding: '6px 14px', display: 'inline-block', letterSpacing: '.05em' }}>
              RENTAL-{code}
            </div>
          </div>
        </div>

        {[
          ['Item', (rental.itemEmoji || '📦') + ' ' + rental.itemName],
          ['Owner', rental.ownerName || '—'],
          ['Rental Period', `${rental.startDate} → ${rental.endDate} (${rental.days} days)`],
          ['Total Amount', `₹${Number(rental.total).toLocaleString('en-IN')}`]
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ color: 'var(--muted)' }}>{k}</span>
            <span style={{ color: k === 'Total Amount' ? '#4ade80' : '#fff', fontWeight: k === 'Total Amount' ? 600 : 400 }}>{v}</span>
          </div>
        ))}

        <div style={{ marginTop: 16, background: 'rgba(96,165,250,.06)', border: '1px solid rgba(96,165,250,.2)', borderRadius: 12, padding: '12px 14px', fontSize: '.78rem', color: 'rgba(96,165,250,.9)', lineHeight: 1.6 }}>
          📌 <strong>How it works:</strong> Show this QR to the owner when picking up the item. The owner scans it to confirm pickup. Show again when returning to confirm return and close the transaction.
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
    if (!star) { toast('Please select a star rating', 'e'); return; }
    if (!comment.trim()) { toast('Please write a brief comment', 'e'); return; }
    setLoading(true);
    try {
      await api.post('/reviews', {
        rentalId: rental.id,
        itemId: rental.itemId,
        ownerId: rental.ownerId,
        rating: star,
        comment
      });
      toast('Review submitted! Thank you ⭐', 's');
      onDone && onDone();
      onClose();
    } catch (e) {
      toast(e.response?.data?.error || 'Review submission failed', 'e');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>{rental.itemEmoji || '⭐'}</div>
          <div className="modal-title" style={{ fontSize: '1.35rem' }}>Leave a Review</div>
          <div className="modal-sub">How was your rental experience with {rental.itemName}?</div>
        </div>

        <div className="fg">
          <label className="fl">Your Rating</label>
          <div style={{ display: 'flex', gap: 8, fontSize: '2rem', cursor: 'pointer', justifyContent: 'center', margin: '6px 0 12px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <span
                key={n}
                onClick={() => setStar(n)}
                style={{
                  color: n <= star ? '#fbbf24' : 'var(--muted2)',
                  transition: 'transform .12s, color .12s',
                  transform: n === star ? 'scale(1.25)' : 'scale(1)'
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="fg">
          <label className="fl">Comment &amp; Feedback</label>
          <textarea
            className="fi"
            rows={3}
            placeholder="Describe the condition of the equipment, communication with the owner, and handover experience…"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}

/* ── My Reviews ── */
export function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/reviews/my').then(r => setReviews(r.data)).catch(() => {});
  }, []);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">{user.role === 'owner' ? 'Reviews Received' : 'My Reviews'}</div>
          <div className="ph-sub">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            {reviews.length > 0 ? ` · ⭐ ${avg} average rating` : ''}
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="You haven't reviewed a rental yet"
          sub={user.role === 'owner' ? 'Reviews from renters will appear here' : 'Complete a rental to leave a review and share feedback'}
        />
      ) : (
        reviews.map(r => (
          <div key={r.id} className="review-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <div className="av" style={{ background: r.renterColor || '#555', width: 34, height: 34 }}>
                {r.renterName?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '.88rem' }}>{r.renterName}</div>
                <div style={{ fontSize: '.74rem', color: 'var(--muted)' }}>{r.itemName} · {r.date}</div>
              </div>
              <div className="star-row" style={{ marginLeft: 'auto', fontSize: '.9rem' }}>
                {'⭐'.repeat(r.rating)}
              </div>
            </div>
            <div style={{ fontSize: '.84rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {r.comment}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
