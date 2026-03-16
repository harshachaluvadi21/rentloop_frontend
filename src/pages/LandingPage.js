import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import api from '../utils/api';

const TICKER_ITEMS = [
  {emoji:'📷',name:'DSLR Camera',loc:'Kukatpally',price:'₹750/day'},
  {emoji:'🔧',name:'Power Drill Set',loc:'Madhapur',price:'₹180/day'},
  {emoji:'⛺',name:'Camping Tent',loc:'Ameerpet',price:'₹300/day'},
  {emoji:'🚁',name:'4K Drone',loc:'Gachibowli',price:'₹1100/day'},
  {emoji:'🎸',name:'Acoustic Guitar',loc:'Begumpet',price:'₹250/day'},
  {emoji:'📽',name:'Projector & Screen',loc:'Banjara Hills',price:'₹550/day'},
  {emoji:'🚲',name:'Mountain Bicycle',loc:'Secunderabad',price:'₹400/day'},
  {emoji:'🔊',name:'PA Speaker',loc:'Kondapur',price:'₹900/day'},
  {emoji:'🎥',name:'GoPro Hero 11',loc:'Uppal',price:'₹600/day'},
  {emoji:'🪑',name:'Tables & Chairs',loc:'LB Nagar',price:'₹500/day'},
  {emoji:'🎮',name:'Gaming Console',loc:'Dilsukhnagar',price:'₹350/day'},
  {emoji:'🧳',name:'Travel Luggage Set',loc:'KPHB',price:'₹150/day'},
];

const CAT_DATA = [
  {emoji:'📷',name:'Electronics',color:'rgba(37,99,168,.15)'},
  {emoji:'⛺',name:'Outdoors',color:'rgba(46,125,79,.15)'},
  {emoji:'🔧',name:'Tools',color:'rgba(240,124,43,.15)'},
  {emoji:'🚲',name:'Sports',color:'rgba(91,63,166,.15)'},
  {emoji:'🎸',name:'Music',color:'rgba(29,158,117,.15)'},
  {emoji:'🪑',name:'Home & Garden',color:'rgba(251,191,36,.12)'},
  {emoji:'📚',name:'Books',color:'rgba(168,85,247,.15)'},
  {emoji:'🧳',name:'Fashion',color:'rgba(236,72,153,.15)'},
];

const TYPED_WORDS = ['Cameras.','Tools.','Tents.','Drones.','Guitars.','Projectors.','Anything.'];

function useTypewriter() {
  const [text, setText] = useState('');
  const state = useRef({ wi:0, ci:0, deleting:false });
  useEffect(() => {
    let timer;
    const type = () => {
      const { wi, ci, deleting } = state.current;
      const word = TYPED_WORDS[wi];
      if (!deleting) {
        setText(word.slice(0, ci + 1));
        state.current.ci++;
        if (state.current.ci === word.length) { state.current.deleting = true; timer = setTimeout(type, 1800); return; }
      } else {
        setText(word.slice(0, ci - 1));
        state.current.ci--;
        if (state.current.ci === 0) { state.current.deleting = false; state.current.wi = (wi + 1) % TYPED_WORDS.length; }
      }
      timer = setTimeout(type, state.current.deleting ? 60 : 110);
    };
    timer = setTimeout(type, 800);
    return () => clearTimeout(timer);
  }, []);
  return text;
}

export default function LandingPage() {
  const [authModal, setAuthModal] = useState(null);
  const [stats, setStats] = useState({ items: 0, users: 0, rentals: 0 });
  const typedText = useTypewriter();

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: 0.1 });
    setTimeout(() => {
      document.querySelectorAll('.fu').forEach(el => { obs.observe(el); el.classList.add('vis'); });
    }, 100);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    api.get('/public/stats').then(r => {
      setStats({
        items: r.data.totalItems,
        users: r.data.totalUsers,
        rentals: r.data.completedRentals
      });
    }).catch(() => {});
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="land-wrap">
      <Navbar onOpenAuth={m => setAuthModal(m)} />
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}

      {/* ── HERO ── */}
      <section style={{minHeight:'calc(100vh - 64px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'60px 24px 40px',position:'relative',overflow:'hidden'}}>
        <div className="land-grid" />
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />

        <div className="fu fd1" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(240,124,43,.1)',border:'1px solid rgba(240,124,43,.22)',borderRadius:100,padding:'5px 16px',fontSize:'.74rem',fontWeight:700,color:'var(--orange)',marginBottom:24,textTransform:'uppercase',letterSpacing:'.06em'}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'var(--orange)',animation:'blink .8s step-end infinite'}} />
          Peer-to-Peer Rental Platform · Hyderabad
        </div>

        <h1 className="fu fd2" style={{fontFamily:"'Fraunces',serif",fontSize:'clamp(3rem,8vw,6rem)',fontWeight:900,lineHeight:1.0,letterSpacing:'-.04em',color:'#fff',maxWidth:860,marginBottom:18}}>
          Rent <em style={{fontStyle:'italic',fontWeight:300,color:'var(--orange)'}}>{typedText}</em><span className="cursor" /><br />
          From Anyone.
        </h1>

        <p className="fu fd3" style={{fontSize:'1.08rem',color:'var(--muted)',maxWidth:480,lineHeight:1.7,marginBottom:36}}>
          RentLoop connects neighbours in Hyderabad to rent tools, cameras, camping gear, event equipment and more — safely and affordably.
        </p>

        <div className="fu fd4" style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',marginBottom:56}}>
          <button className="btn btn-primary btn-pulse" style={{padding:'15px 34px',fontSize:'1rem'}} onClick={() => setAuthModal('register')}>Start Renting Free</button>
          <button className="btn btn-ghost" style={{padding:'15px 34px',fontSize:'1rem'}} onClick={() => setAuthModal('login')}>Sign In</button>
        </div>

        {/* Stats row */}
        <div className="fu fd5" style={{display:'flex',gap:48,flexWrap:'wrap',justifyContent:'center',marginBottom:56}}>
          {[
            [stats.items > 0 ? stats.items+'+' : '0+', 'Items Listed'],
            [stats.users > 0 ? (stats.users > 999 ? (stats.users/1000).toFixed(1)+'K+' : stats.users+'+') : '0+', 'Members'],
            [stats.rentals > 0 ? (stats.rentals > 999 ? (stats.rentals/1000).toFixed(1)+'K+' : stats.rentals+'+') : '0+', 'Completed Rentals'],
            ['₹0', 'Listing Fee'],
          ].map(([v,l]) => (
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:'2rem',fontWeight:700,color:'#fff'}}>{v}</div>
              <div style={{fontSize:'.72rem',color:'var(--muted2)',textTransform:'uppercase',letterSpacing:'.08em',marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Floating item preview cards */}
        <div className="fu fd6" style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',maxWidth:680}}>
          {[
            {emoji:'📷',name:'DSLR Camera',loc:'Kukatpally · ₹750/day',delay:'0s'},
            {emoji:'🔧',name:'Power Drill Set',loc:'Madhapur · ₹180/day',delay:'-.9s'},
            {emoji:'⛺',name:'Camping Tent',loc:'Ameerpet · ₹300/day',delay:'-1.8s'},
            {emoji:'🚁',name:'4K Drone',loc:'Gachibowli · ₹1100/day',delay:'-2.7s'},
          ].map(c => (
            <div key={c.name} className="float-card afc" style={{animationDelay:c.delay}}>
              <span style={{fontSize:'1.6rem'}}>{c.emoji}</span>
              <div>
                <div style={{fontSize:'.84rem',fontWeight:600,color:'#fff'}}>{c.name}</div>
                <div style={{fontSize:'.72rem',color:'var(--muted)'}}>{c.loc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="scroll-ind"><span>Scroll to explore</span><div className="scroll-arrow" /></div>
      </section>

      {/* ── TICKER ── */}
      <div style={{padding:'20px 0',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,.015)'}}>
        <div className="ticker-wrap">
          <div className="ticker">
            {doubled.map((t, i) => (
              <div key={i} className="titem">
                <span style={{fontSize:'1.2rem'}}>{t.emoji}</span>
                <div>
                  <div style={{fontSize:'.82rem',fontWeight:600,color:'#fff'}}>{t.name}</div>
                  <div style={{fontSize:'.7rem',color:'var(--muted)'}}>{t.loc} · {t.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="lsec fu fd2">
        <div style={{textAlign:'center',marginBottom:40}}>
          <div className="lsec-lbl">Browse by Category</div>
          <div className="lsec-title" style={{textAlign:'center'}}>Everything you need,<br /><em style={{fontStyle:'italic',fontWeight:300,color:'var(--orange)'}}>just around the corner</em></div>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center',marginBottom:36}}>
          {CAT_DATA.map(c => (
            <div key={c.name} className="cat-pill" style={{background:c.color,borderColor:'transparent'}} onClick={() => setAuthModal('register')}>
              <span style={{fontSize:'1rem'}}>{c.emoji}</span>{c.name}
            </div>
          ))}
        </div>
        <div style={{textAlign:'center'}}><button className="btn btn-ghost" onClick={() => setAuthModal('register')} style={{padding:'12px 28px'}}>List Your Items →</button></div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{background:'linear-gradient(180deg,transparent,rgba(255,255,255,.015),transparent)',padding:'1px 0'}}>
        <div className="lsec">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center'}}>
            <div className="fu fd1">
              <div className="lsec-lbl">How it works</div>
              <div className="lsec-title">Rent in 3 simple steps</div>
              <div className="lsec-sub" style={{marginBottom:32}}>No deposits, no complicated process. Find what you need and book in minutes.</div>
              <div style={{display:'flex',flexDirection:'column',gap:24}}>
                {[
                  ['1','Browse & Find','Search items near you in Hyderabad by category, price or location.','fd3'],
                  ['2','Request & Confirm','Send a rental request with your dates. Owner reviews and approves.','fd4'],
                  ['3','Pickup with QR','Use your QR code for secure pickup and return. Leave a review when done.','fd5'],
                ].map(([n,t,d,fd]) => (
                  <div key={n} className={`fu ${fd}`} style={{display:'flex',alignItems:'flex-start',gap:16}}>
                    <div className="step-num">{n}</div>
                    <div>
                      <div style={{fontWeight:600,color:'#fff',marginBottom:4}}>{t}</div>
                      <div style={{fontSize:'.85rem',color:'var(--muted)',lineHeight:1.6}}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="fu fd2" style={{display:'flex',flexDirection:'column',gap:14}}>
              <div className="how-card"><div className="how-num">01</div><div style={{fontSize:'1.5rem',marginBottom:10}}>🔍</div><div style={{fontWeight:600,color:'#fff',marginBottom:5}}>Smart Search</div><div style={{fontSize:'.84rem',color:'var(--muted)',lineHeight:1.5}}>Filter by category, distance, price range and availability calendar.</div></div>
              <div className="how-card" style={{marginLeft:24}}><div className="how-num">02</div><div style={{fontSize:'1.5rem',marginBottom:10}}>📱</div><div style={{fontWeight:600,color:'#fff',marginBottom:5}}>QR Verification</div><div style={{fontSize:'.84rem',color:'var(--muted)',lineHeight:1.5}}>Each rental gets a unique QR code. Owner scans to confirm pickup and return.</div></div>
              <div className="how-card"><div className="how-num">03</div><div style={{fontSize:'1.5rem',marginBottom:10}}>⭐</div><div style={{fontWeight:600,color:'#fff',marginBottom:5}}>Trusted Reviews</div><div style={{fontSize:'.84rem',color:'var(--muted)',lineHeight:1.5}}>Build your reputation with every rental. See ratings before you trust.</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="lsec">
        <div style={{textAlign:'center',marginBottom:48}} className="fu fd1">
          <div className="lsec-lbl">Platform Features</div>
          <div className="lsec-title" style={{textAlign:'center'}}>Built for trust &amp; simplicity</div>
        </div>
        <div className="feat-grid">
          {[
            ['fi-o','🏷','List Anything','Tools, cameras, gear, instruments, furniture — if you own it, list it free.','fd2'],
            ['fi-g','🔍','Browse & Rent','Filter by category, location and price. Book instantly with date selection.','fd3'],
            ['fi-b','📷','Photo Verification','Owners upload real photos. Admins verify listings before they go live.','fd4'],
            ['fi-p','📱','QR Pickup & Return','Secure, verified handover with QR codes. No disputes over who returned what.','fd5'],
            ['fi-t','💰','Earn from Idle Items','Turn things collecting dust into income. Track all your earnings in one place.','fd6'],
            ['fi-y','⭐','Reviews & Ratings','Every rental builds community trust. Moderated by admins to keep it genuine.','fd7'],
          ].map(([cls,icon,title,desc,fd]) => (
            <div key={title} className={`feat-card fu ${fd}`}>
              <div className={`feat-icon ${cls}`}>{icon}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:7}}>{title}</div>
              <div style={{fontSize:'.84rem',color:'var(--muted)',lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOR OWNERS / RENTERS ── */}
      <div className="lsec fu fd2">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div style={{background:'linear-gradient(135deg,rgba(46,125,79,.1),rgba(46,125,79,.04))',border:'1px solid rgba(46,125,79,.25)',borderRadius:22,padding:36}}>
            <div style={{fontSize:'2.4rem',marginBottom:14}}>🏷</div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.4rem',fontWeight:700,color:'#fff',marginBottom:8}}>For Item Owners</div>
            <div style={{fontSize:'.88rem',color:'var(--muted)',lineHeight:1.7,marginBottom:22}}>List your items, set your price, and earn money from things you already own. Full control over availability and who rents from you.</div>
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:9,marginBottom:24}}>
              {['Free to list any item','Set your own price & availability','Review renters before approving','QR-based secure handover','Track earnings in real time'].map(f => (
                <li key={f} style={{display:'flex',alignItems:'center',gap:9,fontSize:'.84rem',color:'rgba(232,228,220,.75)'}}><span style={{color:'#4ade80'}}>✓</span>{f}</li>
              ))}
            </ul>
            <button className="btn btn-green" style={{width:'100%',justifyContent:'center'}} onClick={() => setAuthModal('register')}>Start Listing →</button>
          </div>
          <div style={{background:'linear-gradient(135deg,rgba(37,99,168,.1),rgba(37,99,168,.04))',border:'1px solid rgba(37,99,168,.25)',borderRadius:22,padding:36}}>
            <div style={{fontSize:'2.4rem',marginBottom:14}}>🔍</div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.4rem',fontWeight:700,color:'#fff',marginBottom:8}}>For Renters</div>
            <div style={{fontSize:'.88rem',color:'var(--muted)',lineHeight:1.7,marginBottom:22}}>Rent what you need, when you need it — without buying. Find trusted items from people nearby in Hyderabad.</div>
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:9,marginBottom:24}}>
              {['Browse hundreds of categories','Filter by area in Hyderabad','See owner ratings & reviews','QR code for easy pickup','No hidden fees'].map(f => (
                <li key={f} style={{display:'flex',alignItems:'center',gap:9,fontSize:'.84rem',color:'rgba(232,228,220,.75)'}}><span style={{color:'#60a5fa'}}>✓</span>{f}</li>
              ))}
            </ul>
            <button className="btn btn-blue" style={{width:'100%',justifyContent:'center'}} onClick={() => setAuthModal('register')}>Start Renting →</button>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="lsec" style={{paddingTop:0}}>
        <div className="land-cta-box fu fd1">
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:'clamp(2rem,5vw,3rem)',fontWeight:900,color:'#fff',marginBottom:12,letterSpacing:'-.02em'}}>Ready to loop in?</div>
            <div style={{fontSize:'1rem',color:'var(--muted)',maxWidth:440,margin:'0 auto 32px',lineHeight:1.7}}>Join thousands of people in Hyderabad already renting smarter — not buying.</div>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:24}}>
              <button className="btn btn-primary btn-pulse" style={{padding:'15px 36px',fontSize:'1rem'}} onClick={() => setAuthModal('register')}>Create Free Account</button>
              <button className="btn btn-ghost" style={{padding:'15px 36px',fontSize:'1rem'}} onClick={() => setAuthModal('login')}>Sign In</button>
            </div>
            <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
              {['Free to join','No listing fees','Admin verified listings'].map(t => (
                <div key={t} style={{display:'flex',alignItems:'center',gap:6,fontSize:'.78rem',color:'var(--muted2)'}}><span style={{color:'#4ade80'}}>✓</span> {t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="land-footer">
        <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.1rem',fontWeight:900,color:'#fff'}}>Rent<span style={{color:'var(--orange)'}}>Loop</span></div>
        <div style={{fontSize:'.8rem',color:'var(--muted2)'}}>Peer-to-peer rentals · Hyderabad</div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          <span style={{fontSize:'.78rem',color:'var(--muted2)',cursor:'pointer'}} onClick={() => setAuthModal('register')}>Get Started</span>
          <span style={{fontSize:'.78rem',color:'var(--muted2)',cursor:'pointer'}} onClick={() => setAuthModal('login')}>Sign In</span>
        </div>
      </div>
    </div>
  );
}
