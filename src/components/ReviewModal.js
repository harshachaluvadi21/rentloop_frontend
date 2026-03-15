import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ReviewModal({ rental, onClose, onDone }) {
  const { toast } = useAuth();
  const [star, setStar] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!star) { toast('Select a rating', 'e'); return; }
    if (!comment.trim()) { toast('Write a comment', 'e'); return; }
    setLoading(true);
    try {
      await api.post('/reviews', { rentalId: rental.id, itemId: rental.itemId, ownerId: rental.ownerId, renterId: rental.renterId, rating: star, comment });
      toast('Review submitted! ⭐', 's');
      onDone && onDone();
      onClose();
    } catch(e) {
      toast(e.response?.data?.error || 'Failed to submit', 'e');
    } finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ fontSize:'2.8rem', marginBottom:10 }}>{rental.itemEmoji || '⭐'}</div>
          <div className="modal-title" style={{ fontSize:'1.35rem' }}>Leave a Review</div>
          <div className="modal-sub" style={{ marginBottom:0 }}>How was renting {rental.itemName}?</div>
        </div>
        <div className="fg">
          <label className="fl">Rating</label>
          <div style={{ display:'flex', gap:8, fontSize:'1.9rem', cursor:'pointer' }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} onClick={() => setStar(n)}
                style={{ color: n<=star?'#fbbf24':'var(--muted2)', transition:'all .12s', transform: n===star?'scale(1.3)':'scale(1)' }}>★</span>
            ))}
          </div>
        </div>
        <div className="fg">
          <label className="fl">Comment</label>
          <textarea className="fi" rows={3} placeholder="Share your experience…" value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={submit} disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
