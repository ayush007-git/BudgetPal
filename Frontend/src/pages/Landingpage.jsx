import { useNavigate } from 'react-router-dom';
import '../style/mainpage.css'; 
import logoImage from '../assets/logo.jpeg';
import dashboardImage from '../assets/dashboard.jpeg'; 

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">
            <div className="logo-icon">
                <img src={logoImage} alt="BudgetPal Logo" className="logo-image" />
            </div>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                BudgetPal
            </h2>
        </div>

        <nav className="nav-menu">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>

        <div className="nav-buttons">
          <button 
            onClick={handleSignUp}
            className="nav-btn login-btn"
          >
            Sign Up
          </button>
          <button 
            onClick={handleSignIn}
            className="nav-btn signup-btn"
          >
            Sign In
          </button>
        </div>
      </header>
      <main className="landing-main">
        <div className="hero-section">
          <h1 className="hero-title">
            Split Bills<br />
            Stress-Free
          </h1>
          
          <p className="hero-subtitle">
            BudgetPal makes group expense tracking simple, transparent, and hassle-free. Perfect for roommates, trips, and team events.
          </p>

          <button onClick={handleGetStarted} className="cta-primary">
            Get Started here
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="cta-arrow"
            >
              <path 
                d="M5 12h14m-7-7 7 7-7 7" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="illustration-section">
          <div className="illustration-container">
            <div className="mock-dashboard">
              <div className="dashboard-header">
                <div className="window-controls">
                  <div className="window-dot dot-red"></div>
                  <div className="window-dot dot-yellow"></div>
                  <div className="window-dot dot-green"></div>
                </div>
                <div className="dashboard-amount">$31.34 due</div>
              </div>
              
              <div className="dashboard-image-area">
                <img 
                  src={dashboardImage} 
                  alt="Dashboard Preview" 
                  className="dashboard-preview-image"
                />
              </div>
              
              <div className="people-section">
                <div className="person">
                  <div className="person-avatar person-1">
                    <div className="person-head"></div>
                  </div>
                </div>
                <div className="person">
                  <div className="person-avatar person-2">
                    <div className="person-head"></div>
                  </div>
                </div>
                <div className="person">
                  <div className="person-avatar person-3">
                    <div className="person-head"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="plant-1"></div>
            <div className="plant-2"></div>
          </div>
        </div>
      </main>
      <div className="floating-element float-1"></div>
      <div className="floating-element float-2"></div>
      <div className="floating-element float-3"></div>
      <button className="mobile-menu-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{color: 'white'}}>
          <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};

export default LandingPage;