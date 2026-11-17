import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { 
  ShieldAlert, 
  Users, 
  Compass, 
  TrendingUp, 
  Loader, 
  Trash2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, tripsRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users"),
        API.get("/admin/trips"),
      ]);

      setStats(statsRes.data);
      setUsersList(usersRes.data);
      setTripsList(tripsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      Promise.resolve().then(() => {
        fetchData();
      });
    }
  }, [user]);

  const handleDeleteUser = async (targetUserId) => {
    if (targetUserId === user.id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? All their trips, itineraries, and chats will be permanently deleted!")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      const response = await API.delete(`/admin/users/${targetUserId}`);
      setSuccess(response.data.message);
      fetchData(); // Refresh list and stats
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip itinerary?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await API.delete(`/trips/${tripId}`);
      setSuccess("Trip deleted successfully.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete trip.");
    }
  };

  if (loading && !stats) {
    return (
      <div className="trip-details-loading-container">
        <Loader className="spinner-icon animate-spin" size={60} style={{ color: "var(--accent)" }} />
        <h2>Opening Administrator Control Center...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <header className="dashboard-header animate-slide-up" style={{ marginBottom: "36px" }}>
        <div className="header-info" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "var(--accent-glow)",
            padding: "10px",
            borderRadius: "10px",
            color: "var(--accent)"
          }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1>Admin Control Panel</h1>
            <p>Access overall MERN system metrics, supervise user databases, and moderate planned itineraries.</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="auth-error-box animate-scale-in" style={{ marginBottom: "24px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-error-box animate-scale-in" style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#a7f3d0",
          value: "1",
          marginBottom: "24px"
        }}>
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{success}</span>
        </div>
      )}

      {/* Stats row */}
      {stats && (
        <section className="stats-cards-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          marginBottom: "40px"
        }}>
          <div className="feature-card" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="feature-icon-wrapper" style={{ margin: 0, width: "48px", height: "48px", background: "rgba(139, 92, 246, 0.1)" }}>
              <Users size={22} style={{ color: "var(--secondary)" }} />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total System Users</span>
              <h3 style={{ fontSize: "28px", fontWeight: "800" }}>{stats.totalUsers}</h3>
            </div>
          </div>

          <div className="feature-card" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="feature-icon-wrapper" style={{ margin: 0, width: "48px", height: "48px" }}>
              <Compass size={22} className="feature-icon" />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Generated Trips</span>
              <h3 style={{ fontSize: "28px", fontWeight: "800" }}>{stats.totalTrips}</h3>
            </div>
          </div>

          <div className="feature-card" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="feature-icon-wrapper" style={{ margin: 0, width: "48px", height: "48px", background: "rgba(16, 185, 129, 0.1)" }}>
              <TrendingUp size={22} style={{ color: "var(--success)" }} />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Stored Itineraries</span>
              <h3 style={{ fontSize: "28px", fontWeight: "800" }}>{stats.totalItineraries}</h3>
            </div>
          </div>
        </section>
      )}

      {/* Users and Trips Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
        
        {/* Users Table */}
        <section className="feature-card" style={{ padding: "30px", overflowX: "auto" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} style={{ color: "var(--primary)" }} />
            <span>Manage System Users ({usersList.length})</span>
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "600px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--text-secondary)", textAlign: "left" }}>
                <th style={{ padding: "12px 8px" }}>Name</th>
                <th style={{ padding: "12px 8px" }}>Email</th>
                <th style={{ padding: "12px 8px" }}>Role</th>
                <th style={{ padding: "12px 8px" }}>Registered At</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr) => (
                <tr key={usr._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "14px 8px", fontWeight: "600" }}>{usr.name}</td>
                  <td style={{ padding: "14px 8px", color: "var(--text-secondary)" }}>{usr.email}</td>
                  <td style={{ padding: "14px 8px" }}>
                    <span className="badge" style={{
                      background: usr.role === "admin" ? "var(--accent-glow)" : "rgba(255, 255, 255, 0.03)",
                      color: usr.role === "admin" ? "var(--accent)" : "var(--text-secondary)",
                      border: usr.role === "admin" ? "1px solid rgba(245, 158, 11, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)"
                    }}>
                      {usr.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "14px 8px", color: "var(--text-muted)" }}>
                    {usr.createdAt || usr.timestamp ? new Date(usr.createdAt || usr.timestamp).toLocaleDateString() : "N/A"}
                  </td>
                  <td style={{ padding: "14px 8px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDeleteUser(usr._id)}
                      disabled={usr._id === user.id}
                      className="btn btn-delete btn-sm btn-icon-only"
                      style={{ opacity: usr._id === user.id ? 0.3 : 1 }}
                      title={usr._id === user.id ? "Cannot delete yourself" : "Delete User & Data"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Trips Table */}
        <section className="feature-card" style={{ padding: "30px", overflowX: "auto" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Compass size={18} style={{ color: "var(--accent)" }} />
            <span>Manage System Trips ({tripsList.length})</span>
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "700px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--text-secondary)", textAlign: "left" }}>
                <th style={{ padding: "12px 8px" }}>User</th>
                <th style={{ padding: "12px 8px" }}>Destination</th>
                <th style={{ padding: "12px 8px" }}>Days</th>
                <th style={{ padding: "12px 8px" }}>Budget</th>
                <th style={{ padding: "12px 8px" }}>Style</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tripsList.map((trp) => (
                <tr key={trp._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "14px 8px", fontWeight: "500" }}>
                    {trp.userId?.name || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Deleted User</span>}
                    <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>{trp.userId?.email || ""}</span>
                  </td>
                  <td style={{ padding: "14px 8px", fontWeight: "600" }}>{trp.destination}</td>
                  <td style={{ padding: "14px 8px" }}>{trp.days} Days</td>
                  <td style={{ padding: "14px 8px", color: "var(--text-secondary)" }}>₹{trp.budget?.toLocaleString()}</td>
                  <td style={{ padding: "14px 8px" }}>
                    <span className="badge badge-outline" style={{ fontSize: "11px" }}>{trp.travelStyle}</span>
                  </td>
                  <td style={{ padding: "14px 8px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDeleteTrip(trp._id)}
                      className="btn btn-delete btn-sm btn-icon-only"
                      title="Delete Trip Plan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;
