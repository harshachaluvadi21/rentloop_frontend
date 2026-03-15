import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProfilePanel from './ProfilePanel';
import { OwnerOverview, MyListings, AddItem, RequestsPanel, EarningsPanel, CalendarPanel, UserAnnouncements } from './OwnerPanels';
import { RenterOverview, BrowseItems, MyBookings, MyReviews } from './RenterPanels';

const iHome=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const iBox=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const iPlus=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const iClip=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const iCal=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const iMoney=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const iSearch=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const iStar=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const iUser=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const iMega=()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;

export default function Dashboard() {
  const { user }=useAuth();
  const [panel,setPanel]=useState('overview');
  const isOwner=user.role==='owner';
  const ownerLinks=[{icon:iHome(),lbl:'Overview',p:'overview'},{icon:iBox(),lbl:'My Listings',p:'my-items'},{icon:iPlus(),lbl:'Add Item',p:'add-item'},{icon:iClip(),lbl:'Requests',p:'requests'},{icon:iCal(),lbl:'Availability',p:'calendar'},{icon:iMoney(),lbl:'Earnings',p:'earnings'},{icon:iMega(),lbl:'Announcements',p:'user-announcements'}];
  const renterLinks=[{icon:iHome(),lbl:'Overview',p:'overview'},{icon:iSearch(),lbl:'Browse Items',p:'browse'},{icon:iClip(),lbl:'My Bookings',p:'bookings'},{icon:iStar(),lbl:'Reviews',p:'reviews'},{icon:iMega(),lbl:'Announcements',p:'user-announcements'}];
  const links=isOwner?ownerLinks:renterLinks;
  const renderPanel=()=>{
    if(isOwner){
      if(panel==='overview') return <OwnerOverview onNav={setPanel} />;
      if(panel==='my-items') return <MyListings onNav={setPanel} />;
      if(panel==='add-item') return <AddItem onNav={setPanel} />;
      if(panel==='requests') return <RequestsPanel />;
      if(panel==='calendar') return <CalendarPanel />;
      if(panel==='earnings') return <EarningsPanel />;
      if(panel==='user-announcements') return <UserAnnouncements />;
      if(panel==='profile') return <ProfilePanel />;
    } else {
      if(panel==='overview') return <RenterOverview onNav={setPanel} />;
      if(panel==='browse') return <BrowseItems />;
      if(panel==='bookings') return <MyBookings />;
      if(panel==='reviews') return <MyReviews />;
      if(panel==='user-announcements') return <UserAnnouncements />;
      if(panel==='profile') return <ProfilePanel />;
    }
    return null;
  };
  return (
    <div>
      <Navbar />
      <div className="dash">
        <div className="sidebar">
          <div style={{padding:'8px 11px 18px',borderBottom:'1px solid var(--border)',marginBottom:10}}>
            <div style={{fontSize:'.74rem',color:'var(--muted2)',marginBottom:3}}>Signed in as</div>
            <div style={{fontWeight:600,color:'#fff',fontSize:'.88rem'}}>{user.firstName} {user.lastName}</div>
            <div style={{fontSize:'.74rem',color:'var(--muted)',marginTop:1}}>{isOwner?'Item Owner':'Renter'} · {user.location}</div>
          </div>
          {links.map(l=><button key={l.p} className={`sbb${panel===l.p?' act':''}`} onClick={()=>setPanel(l.p)}>{l.icon}{l.lbl}</button>)}
          <div style={{flex:1}} />
          <button className={`sbb${panel==='profile'?' act':''}`} onClick={()=>setPanel('profile')}>{iUser()}Profile</button>
        </div>
        <div className="mc">{renderPanel()}</div>
      </div>
    </div>
  );
}
