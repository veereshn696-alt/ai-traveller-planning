import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { 
  Compass, 
  Calendar, 
  Wallet, 
  Eye, 
  Trash2, 
  PlusCircle, 
  AlertCircle, 
  Briefcase, 
  TrendingUp 
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrips = async () => {
    try {
      const response = await API.get("/trips");
      setTrips(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load saved trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        fetchTrips();
      });
    }
  }, [user]);

  const handleDelete = async (tripId, event) => {
    event.preventDefault(); // Prevent navigating to details page
    if (!window.confirm("Are you sure you want to delete this trip itinerary?")) {
      return;
    }

    try {
      await API.delete(`/trips/${tripId}`);
      setTrips((prev) => prev.filter((trip) => trip._id !== tripId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete trip. Please try again.");
    }
  };

  // Stats derivations
  const totalTrips = trips.length;
  const savedItineraries = trips.filter(t => t.itinerary).length;
  // Mock upcoming calculation (e.g. 40% of trips)
  const upcomingTrips = totalTrips > 0 ? Math.ceil(totalTrips * 0.4) : 0;

  return (
    <div className="dashboard-container">
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Dashboard Header */}
      <header className="dashboard-header animate-slide-up">
        <div className="header-info">
          <h1>Welcome, {user?.name || "Explorer"}!</h1>
          <p>Review your stats, take quick actions, or plan a new travel schedule.</p>
        </div>
        <Link to="/create-trip" className="btn btn-primary btn-icon animate-pulse">
          <PlusCircle size={18} />
          <span>Plan A New Journey</span>
        </Link>
      </header>

      {error && (
        <div className="dashboard-error-box animate-scale-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <section className="stats-cards-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
        marginBottom: "40px"
      }}>
        <div className="feature-card" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="feature-icon-wrapper" style={{ margin: 0, width: "48px", height: "48px" }}>
            <Compass size={22} className="feature-icon" />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>Total Trips</span>
            <h3 style={{ fontSize: "28px", fontWeight: "800", marginTop: "2px" }}>{totalTrips}</h3>
          </div>
        </div>

        <div className="feature-card" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="feature-icon-wrapper" style={{ margin: 0, width: "48px", height: "48px", background: "rgba(245, 158, 11, 0.1)" }}>
            <Calendar size={22} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>Upcoming Trips</span>
            <h3 style={{ fontSize: "28px", fontWeight: "800", marginTop: "2px" }}>{upcomingTrips}</h3>
          </div>
        </div>

        <div className="feature-card" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="feature-icon-wrapper" style={{ margin: 0, width: "48px", height: "48px", background: "rgba(16, 185, 129, 0.1)" }}>
            <TrendingUp size={22} style={{ color: "var(--success)" }} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>Saved Itineraries</span>
            <h3 style={{ fontSize: "28px", fontWeight: "800", marginTop: "2px" }}>{savedItineraries}</h3>
          </div>
        </div>
      </section>

      {/* Quick Actions Panel */}
      <section className="quick-actions-section" style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Quick Actions</h2>
        <div className="actions-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          <Link to="/create-trip" className="choice-card" style={{ padding: "24px 16px", textDecoration: "none" }}>
            <span className="card-emoji" style={{ fontSize: "32px" }}>✈️</span>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginTop: "6px" }}>Create Trip</h4>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Plan a new AI itinerary</p>
          </Link>

          <Link to="/saved-trips" className="choice-card" style={{ padding: "24px 16px", textDecoration: "none" }}>
            <span className="card-emoji" style={{ fontSize: "32px" }}>🎒</span>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginTop: "6px" }}>View Trips</h4>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Explore saved travel logs</p>
          </Link>

          <Link to="/profile" className="choice-card" style={{ padding: "24px 16px", textDecoration: "none" }}>
            <span className="card-emoji" style={{ fontSize: "32px" }}>👤</span>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginTop: "6px" }}>Profile</h4>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Manage profile & security</p>
          </Link>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="dashboard-content">
        <h2>Your Saved Itineraries</h2>

        {loading ? (
          /* Loading Placeholder Grid */
          <div className="trips-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="trip-card skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-sub"></div>
                <div className="skeleton-text skeleton-line"></div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty State Layout */
          <div className="empty-state animate-scale-in">
            <div className="empty-state-icon">
              <Compass size={60} className="animate-spin-slow" />
            </div>
            <h3>No Adventures Planned Yet</h3>
            <p>You haven't generated any AI itineraries. Click the button below to start creating custom plans for your upcoming vacations!</p>
            <Link to="/create-trip" className="btn btn-primary btn-icon">
              <PlusCircle size={18} />
              <span>Create First Trip Plan</span>
            </Link>
          </div>
        ) : (
          /* Trips Grid */
          <div className="trips-grid">
            {trips.map((trip, idx) => (
              <div
                key={trip._id}
                className="trip-card animate-scale-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => navigate(`/trip/${trip._id}`)}
              >
                <div className="trip-card-banner">
                  <span className="card-badge">🌍</span>
                </div>

                <div className="trip-card-body">
                  <h3>{trip.destination}</h3>
                  <h4 className="trip-title-text">{trip.itinerary?.tripTitle || `${trip.travelStyle} Trip`}</h4>

                  <div className="trip-meta-specs">
                    <span className="meta-item">
                      <Calendar size={14} />
                      <span>{trip.days} Days</span>
                    </span>
                    <span className="meta-item">
                      <Wallet size={14} />
                      <span>₹{trip.budget.toLocaleString()}</span>
                    </span>
                    <span className="meta-item">
                      <Briefcase size={14} />
                      <span>{trip.travelStyle}</span>
                    </span>
                  </div>

                  <div className="card-interest-badges">
                    {trip.interests && trip.interests.slice(0, 3).map((interest) => (
                      <span key={interest} className="badge badge-sm badge-outline">
                        {interest}
                      </span>
                    ))}
                    {trip.interests && trip.interests.length > 3 && (
                      <span className="badge badge-sm badge-outline">+{trip.interests.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="trip-card-footer">
                  <Link to={`/trip/${trip._id}`} className="btn btn-outline btn-sm btn-icon">
                    <Eye size={14} />
                    <span>View Itinerary</span>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(trip._id, e)}
                    className="btn btn-delete btn-sm btn-icon-only"
                    title="Delete Itinerary"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
