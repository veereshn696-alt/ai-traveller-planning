import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { User, Mail, Lock, KeyRound, AlertCircle, CheckCircle2, Loader, ShieldAlert } from "lucide-react";

const ProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await API.put("/users/profile", {
        name: formData.name,
        email: formData.email,
      });

      // Update local storage and auth context with updated details
      const storedToken = localStorage.getItem("token");
      login(storedToken, response.data.user);

      setSuccess("Profile details updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await API.put("/users/profile", {
        password: passwordData.password,
      });

      setPasswordData({ password: "", confirmPassword: "" });
      setSuccess("Password changed successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: "calc(100vh - 140px)", display: "block", maxWidth: "800px", margin: "0 auto" }}>
      <div className="auth-glow-1"></div>
      <div className="auth-glow-2"></div>

      <header className="dashboard-header animate-slide-up" style={{ marginBottom: "32px", textAlign: "left" }}>
        <div className="header-info">
          <h1>Account Settings</h1>
          <p>Update your personal details, email address, or update account security details.</p>
        </div>
      </header>

      {error && (
        <div className="auth-error-box animate-scale-in" style={{ marginBottom: "24px" }}>
          <AlertCircle size={18} className="error-icon" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-error-box animate-scale-in" style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#a7f3d0",
          marginBottom: "24px"
        }}>
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        
        {/* Profile Info Form */}
        <div className="auth-card animate-scale-in" style={{ maxWidth: "100%", padding: "30px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <User size={18} style={{ color: "var(--primary)" }} />
            <span>Profile Details</span>
          </h3>

          <form className="auth-form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Account Role</label>
              <div className="input-with-icon">
                <ShieldAlert className="input-icon" size={16} style={{ color: user?.role === "admin" ? "var(--accent)" : "var(--text-muted)" }} />
                <input
                  type="text"
                  value={user?.role?.toUpperCase() || "USER"}
                  disabled
                  style={{ opacity: 0.6, background: "rgba(255, 255, 255, 0.02)" }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-sm" disabled={loading}>
              {loading ? <Loader className="animate-spin" size={16} /> : <span>Update Profile</span>}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="auth-card animate-scale-in" style={{ maxWidth: "100%", padding: "30px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <KeyRound size={18} style={{ color: "var(--accent)" }} />
            <span>Change Password</span>
          </h3>

          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-outline btn-block btn-sm" disabled={loading} style={{ border: "1px solid var(--accent-glow)" }}>
              {loading ? <Loader className="animate-spin" size={16} /> : <span style={{ color: "var(--accent)" }}>Update Password</span>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
