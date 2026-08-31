import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

const services = [
  ['🚔','Police Protection','Local law enforcement and emergency response.'],['🚒','Fire Department','Stations, equipment, and rapid emergency response.'],['🛣️','Roads','Repair, resurfacing, bridges, and local transit.'],['💡','Street Lighting','Safer streets, signals, and neighborhood lighting.'],['📚','Schools & Libraries','Education, after-school programs, and libraries.'],['🐾','Animal Shelters','Animal control, rescue, adoption, and pet welfare.']
];

function PlaidButton({ label = 'Connect an Existing Account' }) {
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('');
  const { open, ready } = usePlaidLink({
    token,
    onSuccess: async (public_token) => {
      const response = await fetch('/api/plaid/exchange-public-token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({public_token})});
      const result = await response.json();
      setStatus(result.connected ? 'Account authorized securely.' : result.error || 'Connection could not be completed.');
    },
    onExit: () => setStatus('Bank connection closed.'),
  });
  async function connect() {
    setStatus('Starting secure connection…');
    const response = await fetch('/api/plaid/create-link-token',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    const result = await response.json();
    if (!response.ok) return setStatus(result.error || 'Plaid is not configured yet.');
    setToken(result.link_token);
  }
  useEffect(()=>{ if(token && ready) open(); },[token,ready,open]);
  return <div><button className="secondary" onClick={connect}>{label}</button>{status && <p className="status">{status}</p>}</div>;
}

function ApplicationDisclaimer({ partner, close }) {
  const [accepted, setAccepted] = useState(false);
  return <div className="overlay application-overlay" onMouseDown={e=>e.target===e.currentTarget&&close()}>
    <section className="modal disclaimer-modal" role="dialog" aria-modal="true" aria-labelledby="application-disclaimer-title">
      <header>
        <button className="close" onClick={close} aria-label="Close">×</button>
        <span>COUNTYCOUNT DISCLOSURE</span>
        <h2 id="application-disclaimer-title">Before You Explore Financial Options</h2>
        <p>Please review and acknowledge this information before continuing.</p>
      </header>
      <div className="modal-body disclaimer-copy">
        <h3>You are leaving CountyCount</h3>
        <p>The financial institution may not be located in your home county. Credit cards, auto loans, home loans, personal loans, business loans, and other products may be available through the institution. Major taxable purchases made in your home county can still help support local services and causes.</p>
        <p>Available products, points, rewards, eligibility, rates, fees, and approval are determined solely by the financial institution and are not guaranteed by CountyCount.</p>
        <p>Connecting through Plaid is optional and does not constitute a credit-card or loan application. Plaid securely connects eligible existing accounts with your permission; it does not issue cards, make loans, determine approval, or provide points or rewards. Tax allocation and local benefits vary by purchase and location.</p>
        <p>CountyCount is an independent initiative and is not a bank, credit union, lender, government agency, or financial advisor.</p>
        <div className="plaid disclaimer-plaid"><strong>Optional: connect an existing account</strong><p>You may securely connect an eligible account before continuing, or skip this step and go directly to the financial institution.</p><PlaidButton label="Connect with Plaid (Optional)" /></div>
        <label className="acknowledge">
          <input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} />
          <span>I understand this disclosure and that Plaid connection is optional.</span>
        </label>
        <div className="disclaimer-actions">
          <button className="secondary" onClick={close}>Cancel</button>
          <a
            className={`button ${accepted?'':'disabled'}`}
            href={accepted ? partner.applicationUrl : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!accepted}
            onClick={e=>{if(!accepted)e.preventDefault();}}
          >
            Explore Options at {partner.name}
          </a>
        </div>
      </div>
    </section>
  </div>;
}

function PartnerModal({ close }) {
  const [partners,setPartners]=useState(null);
  const [selectedPartner,setSelectedPartner]=useState(null);
  useEffect(()=>{fetch('/api/financial-partners').then(r=>r.json()).then(setPartners).catch(()=>setPartners([]));},[]);
  return <>
    <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&close()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="partner-title">
        <header><button className="close" onClick={close} aria-label="Close">×</button><span>COUNTYCOUNT PARTNERS</span><h2 id="partner-title">Choose a Financial Partner</h2><p>Review verified terms directly with each independent financial institution.</p></header>
        <div className="modal-body">
          {partners===null?<p>Loading partner institutions…</p>:partners.length===0?<p>No partner institutions are available right now.</p>:partners.map(p=><article className="partner" key={p.id}><div className="bank-icon">{p.logoEmoji}</div><div><h3>{p.name}</h3><p>{p.description}</p><small>Annual fee: {p.annualFee} · Minimum deposit: {p.minDeposit}</small></div><button className="button" onClick={()=>setSelectedPartner(p)}>Explore Cards & Loans</button></article>)}
          <div className="plaid"><strong>Optional account connection</strong><p>Securely connect an eligible existing account through Plaid. This is not a credit or loan application.</p><PlaidButton label="Connect with Plaid (Optional)" /></div>
          <p className="fine-print">CountyCount is not a bank, credit union, lender, or financial adviser. Applications, approvals, rates, fees, rewards, and account servicing are handled by the selected financial institution.</p>
        </div>
      </section>
    </div>
    {selectedPartner&&<ApplicationDisclaimer partner={selectedPartner} close={()=>setSelectedPartner(null)} />}
  </>;
}

export default function App(){
 const [modal,setModal]=useState(false);
 return <><nav><a className="brand" href="#top"><b>C</b> CountyCount</a><div><a href="#how">How It Works</a><a href="#services">Services</a><a href="#impact">Impact</a><button onClick={()=>setModal(true)}>Get Started</button></div></nav>
 <main id="top"><section className="hero"><div><span className="eyebrow">CALIFORNIA AWARENESS CAMPAIGN</span><h1>Make Your Money <em>Count in the County</em> You Live In.</h1><p>CountyCount reminds California residents to shop for taxable goods close to home—helping local sales-tax revenue support community services.</p><div className="actions"><button onClick={()=>setModal(true)}>Explore Account Options</button><a href="#how">See How It Works</a></div><ul><li>All 58 California counties</li><li>Independent financial partners</li><li>Clear terms before you apply</li></ul></div><aside><span>SHOP LOCAL</span><strong>Keep tax dollars working close to home.</strong><p>Your purchases help shape the community where you live.</p></aside></section>
 <section className="intro"><span className="eyebrow">WHAT IS COUNTYCOUNT?</span><h2>Your spending shapes your community.</h2><p>CountyCount is an independent awareness campaign encouraging residents to consider local businesses when making taxable purchases. Sales-tax rules and allocations vary by location, so we link residents to official information and clearly identified financial partners.</p></section>
 <section id="how" className="section tinted"><span className="eyebrow">HOW IT WORKS</span><h2>Simple. Local. Powerful.</h2><div className="steps">{[['01','Shop locally','Choose businesses in your home county when practical.'],['02','Connect or apply','Use an existing account through Plaid or review a partner option.'],['03','Verify purchases','Eligible posted purchases can be matched to your home county.'],['04','See local impact','Learn how spending decisions support nearby communities.']].map(x=><article key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>
 <section id="services" className="section"><span className="eyebrow">COUNTY SERVICES</span><h2>What local revenue can help support.</h2><div className="services">{services.map(x=><article key={x[1]}><i>{x[0]}</i><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>
 <section id="impact" className="impact"><span className="eyebrow">WHY LOCATION MATTERS</span><h2>Small choices can strengthen local communities.</h2><p>CountyCount will publish sourced California data here as verified county and state information becomes available.</p><button onClick={()=>setModal(true)}>Get Started</button></section></main>
 <footer className="site-footer"><div><strong>CountyCount</strong><span>A DBA of Lazy Man Ventures LLC</span></div><div><a href="#how">How It Works</a><a href="mailto:hello@countycount.com">Contact</a></div><p>CountyCount is an independent consumer-awareness and lead-generation platform, not a government agency or financial institution. Financial products are subject to partner terms and approval.</p></footer>{modal&&<PartnerModal close={()=>setModal(false)}/>}</>;
}
