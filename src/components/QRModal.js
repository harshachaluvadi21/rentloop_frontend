import React from 'react';

export default function QRModal({ rental, onClose }) {
  if (!rental) return null;
  const qrData = encodeURIComponent(JSON.stringify({ rentalId: rental.id, itemId: rental.itemId, start: rental.startDate, end: rental.endDate }));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&bgcolor=13151C&color=F07C2B&qzone=2`;

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:440 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ textAlign:'center', padding:'8px 0 18px' }}>
          <div style={{ fontSize:'2rem', marginBottom:10 }}>📱</div>
          <div className="modal-title" style={{ fontSize:'1.35rem', marginBottom:4 }}>Rental QR Code</div>
          <div className="modal-sub">Show this to the owner for item pickup &amp; return</div>
        </div>
        <div style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:16, padding:24, textAlign:'center', marginBottom:18 }}>
          <img src={qrUrl} alt="QR Code" style={{ width:180, height:180, borderRadius:12, marginBottom:16 }}
            onError={e => e.target.outerHTML = '<div style="width:180px;height:180px;margin:0 auto 16px;background:var(--card3);border-radius:12px;display:flex;align-items:center;justify-content:center;border:2px dashed var(--border2)"><div style="font-size:2.5rem">⬛</div></div>'} />
          <div style={{ fontFamily:'monospace', fontSize:'.78rem', color:'var(--orange)', background:'rgba(240,124,43,.08)', border:'1px solid rgba(240,124,43,.2)', borderRadius:8, padding:'6px 12px', display:'inline-block', letterSpacing:'.05em' }}>
            RENTAL-{rental.id?.slice(-8).toUpperCase()}
          </div>
        </div>
        {[
          ['Item', rental.itemEmoji + ' ' + rental.itemName],
          ['Owner', rental.ownerName],
          ['Rental period', `${rental.startDate} → ${rental.endDate}`],
          ['Total', `₹${Number(rental.total).toLocaleString('en-IN')}`],
        ].map(([k,v],i,arr) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'.84rem', padding:'8px 0', borderBottom: i<arr.length-1?'1px solid var(--border)':'none' }}>
            <span style={{ color:'var(--muted)' }}>{k}</span>
            <span style={{ color: k==='Total'?'#4ade80':'#fff', fontWeight: k==='Total'?600:400 }}>{v}</span>
          </div>
        ))}
        <div style={{ marginTop:16, background:'rgba(96,165,250,.06)', border:'1px solid rgba(96,165,250,.2)', borderRadius:12, padding:'12px 14px', fontSize:'.8rem', color:'rgba(96,165,250,.9)', lineHeight:1.6 }}>
          📌 <strong>How to use:</strong> Show this QR to the owner when picking up the item. The owner scans it to confirm pickup. Show again when returning.
        </div>
      </div>
    </div>
  );
}
