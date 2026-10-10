import Brand from '../components/Brand';
import { ArrowRight } from '../components/PropertyIcons';
import { propertyOptions } from '../data/propertyOptions';

export default function PropertyChoicePage({ user, onChoice, onLogout }) {
  return <div className="choice-page">
    <header className="nav choice-nav">
      <a href="#top" aria-label="NoBroker home"><Brand /></a>
      <div className="profile-actions">
        <span>Welcome, {user.fullName || user.email}</span>
        <button className="login" onClick={onLogout}>Logout</button>
      </div>
    </header>
    <main className="choice-main">
      <p className="kicker">YOUR PROPERTY JOURNEY</p>
      <h1>How can we help today?</h1>
      <p className="choice-copy">Choose an option to continue with verified homes and direct owner connections.</p>
      <div className="choice-grid">
        {propertyOptions.map(option => <button className="choice-card" onClick={() => onChoice(option.action)} key={option.title}>
          <span className="choice-image-wrap"><img className="choice-image" src={option.image} alt="" /></span>
          <span className="choice-card-content">
            <span className="category-icon">{option.icon}</span>
            <h2>{option.title}</h2>
            <p>{option.text}</p>
            <span className="choice-action">Get started <ArrowRight /></span>
          </span>
        </button>)}
      </div>
    </main>
  </div>;
}
