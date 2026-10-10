import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loginUser, registerUser } from './utils/api';
import Brand from './components/Brand';
import Navbar from './components/Navbar';
import { ArrowRight } from './components/PropertyIcons';
import { propertyOptions } from './data/propertyOptions';
import PropertyChoicePage from './pages/PropertyChoicePage';
import './style.css';

const filterConfig = {
  Rent: {
    priceLabel: 'Monthly rent', prices: ['Any monthly rent', 'Under 20,000', '20,000 - 40,000', '40,000+'],
    typeLabel: 'Furnishing', types: ['Any furnishing', 'Fully furnished', 'Semi furnished', 'Unfurnished'],
  },
  Buy: {
    priceLabel: 'Property price', prices: ['Any price', 'Under 75 Lakh', '75 Lakh - 1 Cr', '1 Cr+'],
    typeLabel: 'Property type', types: ['All property types', 'Apartment', 'Independent house', 'Villa'],
  },
  Commercial: {
    priceLabel: 'Monthly rent', prices: ['Any monthly rent', 'Under 30,000', '30,000 - 75,000', '75,000+'],
    typeLabel: 'Space type', types: ['All commercial spaces', 'Office', 'Shop', 'Warehouse'],
  },
};

function AuthModal({ mode, setMode, close, onAuthenticated }) {
  const register = mode === 'register';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });

  const updateField = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = register
        ? await registerUser({ ...form, terms_conditions: true })
        : await loginUser({ email: form.email, password: form.password });
      onAuthenticated(response.data.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return <div className="modal-backdrop" onMouseDown={close}>
    <section className="auth-modal" onMouseDown={event => event.stopPropagation()}>
      <button className="close-modal" onClick={close} aria-label="Close">x</button>
      <Brand />
      <h2>{register ? 'Create your account' : 'Welcome back'}</h2>
      <p>{register ? 'Register to save properties and contact owners directly.' : 'Login to choose how you want to get started.'}</p>
      <form onSubmit={submit}>
        {register && <label>Full name<input required name="fullName" value={form.fullName} onChange={updateField} placeholder="Your full name" /></label>}
        <label>Email address<input required name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" /></label>
        {register && <label>Mobile number<input required name="phone" type="tel" pattern="[0-9]{10}" value={form.phone} onChange={updateField} placeholder="10-digit mobile number" /></label>}
        <label>Password<input required name="password" type="password" minLength="6" value={form.password} onChange={updateField} placeholder="Minimum 6 characters" /></label>
        {register && <label className="check"><input required type="checkbox" /> I agree to the Terms and Privacy Policy.</label>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={loading}>{loading ? 'Please wait...' : register ? 'Create account' : 'Login'}</button>
      </form>
      <button className="switch-auth" onClick={() => setMode(register ? 'login' : 'register')}>
        {register ? 'Already have an account? Login' : 'New to NoBroker? Register'}
      </button>
    </section>
  </div>;
}

function App() {
  const [tab, setTab] = useState('Rent');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(filterConfig.Rent.prices[0]);
  const [bhk, setBhk] = useState('Any BHK');
  const [propertyType, setPropertyType] = useState(filterConfig.Rent.types[0]);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState('');

  const notify = text => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const changeTab = nextTab => {
    setTab(nextTab);
    setPrice(filterConfig[nextTab].prices[0]);
    setPropertyType(filterConfig[nextTab].types[0]);
  };

  const selectCategory = action => {
    if (action === 'List') {
      notify('Start listing your property - it is free.');
      return;
    }
    changeTab(action);
    document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const search = () => notify(`Searching ${tab.toLowerCase()} homes${location ? ` near ${location}` : ''}.`);
  const logout = () => { setUser(null); notify('You have been logged out.'); };
  const choosePath = action => notify(action === 'List' ? 'Your property listing journey is ready to begin.' : `Opening ${action.toLowerCase()} home options.`);

  if (user) {
    return <><PropertyChoicePage user={user} onLogout={logout} onChoice={choosePath} />{notice && <div className="toast">{notice}</div>}</>;
  }

  return <>
    <header className="nav">
      <a href="#top" aria-label="NoBroker home"><Brand /></a>
      <nav><a href="#journey">Rent</a><a href="#journey">Buy</a><a href="#owners">Commercial</a></nav>
      <div className="nav-actions">
        <button className="login" onClick={() => setAuth('login')}>Login</button>
        <button className="register" onClick={() => setAuth('register')}>Register</button>
        <button className="post" onClick={() => selectCategory('List')}>Post Your Property</button>
      </div>
    </header>
    <Navbar onLoginClick={loggedInUser => { setUser(loggedInUser); }} onLogout={logout} />
    <main id="top">
      <section className="hero"><div className="hero-content">
        <p className="kicker">INDIA'S NO.1 PROPERTY PLATFORM</p>
        <h1>Find your next home with <em>zero brokerage.</em></h1>
        <p>Explore verified properties and connect directly with owners.</p>
        <div className="search-box" id="search">
          <div className="tabs">{['Rent', 'Buy', 'Commercial'].map(option => <button className={tab === option ? 'active' : ''} onClick={() => changeTab(option)} key={option}>{option}</button>)}</div>
          <div className="search-row"><label><span>Location</span><input value={location} onChange={event => setLocation(event.target.value)} placeholder="Search city, locality or landmark" /></label><button onClick={search}>Search properties</button></div>
        </div>
        <div className="stats"><span><b>10,000+</b> verified homes</span><span><b>0</b> brokerage fee</span><span><b>4.7/5</b> customer rating</span></div>
      </div></section>
      <section className="filter-wrap" aria-label={`${tab} filters`}><div className="filters">
        <strong>{tab} filters</strong>
        <label className="filter-label">{filterConfig[tab].priceLabel}<select value={price} onChange={event => setPrice(event.target.value)}>{filterConfig[tab].prices.map(option => <option key={option}>{option}</option>)}</select></label>
        {tab !== 'Commercial' && <label className="filter-label">BHK<select value={bhk} onChange={event => setBhk(event.target.value)}>{['Any BHK', '1 BHK', '2 BHK', '3 BHK', '4 BHK+'].map(option => <option key={option}>{option}</option>)}</select></label>}
        <label className="filter-label">{filterConfig[tab].typeLabel}<select value={propertyType} onChange={event => setPropertyType(event.target.value)}>{filterConfig[tab].types.map(option => <option key={option}>{option}</option>)}</select></label>
        <button className="clear" onClick={() => { setLocation(''); setPrice(filterConfig[tab].prices[0]); setBhk('Any BHK'); setPropertyType(filterConfig[tab].types[0]); }}>Clear all</button>
      </div></section>
      <section className="journey-section" id="journey"><div className="section-heading"><div><p className="kicker">START YOUR JOURNEY</p><h2>What brings you here?</h2></div></div><div className="category-grid">{propertyOptions.map(option => <button className="category-card" onClick={() => selectCategory(option.action)} key={option.title}><span className="category-icon">{option.icon}</span><h3>{option.title}</h3><p>{option.text}</p><span className="arrow"><ArrowRight /></span></button>)}</div></section>
      <section className="owner-banner" id="owners"><div><p className="kicker">ARE YOU A PROPERTY OWNER?</p><h2>Your property deserves the right audience.</h2><p>List your property for free and connect directly with genuine seekers.</p><button onClick={() => selectCategory('List')}>List your property <ArrowRight /></button></div><div className="banner-art">HOME</div></section>
    </main>
    <footer><Brand /><p>India's property platform connecting owners and seekers directly.</p><div className="footer-links"><a>About us</a><a>Careers</a><a>Help center</a><a>Terms and privacy</a></div><small>Copyright 2026 NoBroker-inspired UI demo.</small></footer>
    {auth && <AuthModal mode={auth} setMode={setAuth} close={() => setAuth(null)} onAuthenticated={loggedInUser => { setUser(loggedInUser); setAuth(null); }} />}
    {notice && <div className="toast">{notice}</div>}
  </>;
}

createRoot(document.getElementById('app')).render(<App />);
