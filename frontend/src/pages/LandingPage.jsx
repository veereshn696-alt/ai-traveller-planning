import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Compass, Sparkles, Hotel, ListChecks, ArrowRight, ShieldCheck, Zap } from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="landing-container">
      {/* Background glowing decorations */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="badge-icon" />
          <span>Pravasi: Official Karnataka Tourism AI Portal</span>
        </div>
        <h1 className="hero-title">
          One State. Many Worlds. <br />
          <span className="gradient-text">Pravasi AI Assistant</span>
        </h1>
        <p className="hero-subtitle">
          Say goodbye to hours of planning. Pravasi, the official Karnataka Tourism AI assistant, crafts custom, comprehensive daily itineraries, hotel recommendations, packing lists, and budget estimates tailored entirely to your interests and budget in seconds.
        </p>
        <div className="hero-ctas">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg btn-icon">
              <span>Go to Dashboard</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg btn-icon">
                <span>Start Planning Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Floating preview card mockup */}
        <div className="hero-preview-container animate-fade-in-up">
          <div className="hero-preview-card">
            <div className="card-header-bar">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
              <span className="card-header-title">Itinerary Preview - Hampi, Karnataka 🇮🇳</span>
            </div>
            <div className="preview-content">
              <div className="preview-header">
                <h3>Hampi Heritage Discovery</h3>
                <span className="preview-badge">3 Days • Heritage • Explorer</span>
              </div>
              <div className="preview-timeline">
                <div className="preview-timeline-item">
                  <div className="time-indicator">09:00 AM</div>
                  <div className="activity-detail">
                    <h4>Virupaksha Temple & Hampi Bazaar</h4>
                    <p>Wander the ancient pillared market streets, explore Hampi's active historic temple, and watch the river sunset.</p>
                  </div>
                </div>
                <div className="preview-timeline-item">
                  <div className="time-indicator">01:30 PM</div>
                  <div className="activity-detail">
                    <h4>Vittala Temple & Stone Chariot</h4>
                    <p>Witness the iconic stone chariot structure, marvel at the musical pillars, and take a local coracle boat ride.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2>Crafted for Effortless Exploration</h2>
          <p>Everything you need to create, manage, and experience a perfectly planned vacation.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Compass className="feature-icon" />
            </div>
            <h3>Custom Daily Schedules</h3>
            <p>Every morning, afternoon, and evening is plotted with details, time markers, and estimated activity costs.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Hotel className="feature-icon" />
            </div>
            <h3>Curated Stays</h3>
            <p>Get matched with highly rated accommodation recommendations styled for your specific travel budget tier.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ListChecks className="feature-icon" />
            </div>
            <h3>Smart Packing & Tips</h3>
            <p>Receive smart packing lists matching your itinerary and important cultural safety tips for your destination.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap className="feature-icon" />
            </div>
            <h3>Real-Time AI Generation</h3>
            <p>Generates rich, contextual plans dynamically in seconds using state-of-the-art LLMs.</p>
          </div>
        </div>
      </section>

      {/* Trust banner */}
      <section className="trust-banner">
        <div className="trust-content">
          <ShieldCheck className="trust-icon" />
          <span>Your travel plans are stored securely in your dashboard for lifetime access, entirely free.</span>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
