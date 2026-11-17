import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { Compass, Calendar, Wallet, Briefcase, Eye, Trash2, Search, SlidersHorizontal, PlusCircle, AlertCircle } from "lucide-react";

const SavedTrips = () => {
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
  const [search, setSearch] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("All");

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
    event.preventDefault();
    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }

    try {
      await API.delete(`/trips/${tripId}`);
      setTrips((prev) => prev.filter((trip) => trip._id !== tripId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete trip.");
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.destination.toLowerCase().includes(search.toLowerCase());
    const matchesStyle = selectedStyle === "All" || trip.travelStyle === selectedStyle;
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="dashboard-container">
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <header className="dashboard-header animate-slide-up">
        <div className="header-info">
          <h1>Saved Trips</h1>
          <p>Browse, manage, and inspect all itineraries you've designed with Karnataka Tourism AI.</p>
        </div>
        <Link to="/create-trip" className="btn btn-primary btn-icon">
          <PlusCircle size={18} />
          <span>Plan A New Journey</span>
        </Link>
      </header>

      {error && (
        <div className="dashboard-error-box animate-scale-in" style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#fca5a5", padding: "12px", borderRadius: "10px", marginBottom: "20px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <section className="search-filter-section" style={{
        display: "flex",
        gap: "20px",
        marginBottom: "30px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        {/* Search */}
        <div className="input-with-icon" style={{ flexGrow: 1, minWidth: "260px" }}>
          <Search className="input-icon" size={18} />
          <input
            type="text"
            placeholder="Search by destination city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(16, 20, 39, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "12px 12px 12px 42px",
              borderRadius: "10px",
              color: "var(--text-primary)"
            }}
          />
        </div>

        {/* Style Selection */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <SlidersHorizontal size={16} style={{ color: "var(--text-secondary)" }} />
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            style={{
              background: "rgba(16, 20, 39, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "12px 16px",
              borderRadius: "10px",
              color: "var(--text-primary)",
              cursor: "pointer"
            }}
          >
            <option value="All">All Travel Styles</option>
            <option value="Budget">Budget</option>
            <option value="Standard">Standard</option>
            <option value="Luxury">Luxury</option>
            <option value="Adventure">Adventure</option>
            <option value="Family">Family</option>
          </select>
        </div>
      </section>

      {/* Results grid */}
      <section className="dashboard-content">
        {loading ? (
          <div className="trips-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="trip-card skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-sub"></div>
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="empty-state animate-scale-in">
            <div className="empty-state-icon">
              <Compass size={60} />
            </div>
            <h3>No matching trips found</h3>
            <p>Try clearing your search query or choosing a different travel style filter.</p>
          </div>
        ) : (
          <div className="trips-grid">
            {filteredTrips.map((trip, idx) => (
              <div
                key={trip._id}
                className="trip-card animate-scale-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => navigate(`/trip/${trip._id}`)}
              >
                <div className="trip-card-banner">
                  <span className="card-badge">✈️</span>
                </div>

                <div className="trip-card-body">
                  <h3>{trip.destination}</h3>
                  <h4 className="trip-title-text">{trip.itinerary?.tripTitle || `${trip.travelStyle} Plan`}</h4>

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
                </div>

                <div className="trip-card-footer">
                  <Link to={`/trip/${trip._id}`} className="btn btn-outline btn-sm btn-icon">
                    <Eye size={14} />
                    <span>Open Itinerary</span>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(trip._id, e)}
                    className="btn btn-delete btn-sm btn-icon-only"
                    title="Delete Plan"
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

export default SavedTrips;
