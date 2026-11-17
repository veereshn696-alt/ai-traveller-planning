import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { Mail, Lock, User, AlertCircle, Loader } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const AuthPage = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1000000000000-dummygoogleclientid.apps.googleusercontent.com";
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Clear errors when toggling between login and register (deferred to avoid cascading render warning)
    Promise.resolve().then(() => {
      setError("");
      setFormData({ name: "", email: "", password: "" });
    });
  }, [isRegister]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { name, email, password } = formData;

    if (isRegister && !name) {
      setError("Please fill in your name");
      setLoading(false);
      return;
    }
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const response = await API.post(endpoint, formData);
      const data = response.data;

      // Log the user in context and store in local storage
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const response = await API.post("/auth/google-login", { token: credentialResponse.credential });
      const data = response.data;

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was cancelled or failed.");
  };

  return (
    <div className="auth-container">
      <div className="auth-glow-1"></div>
      <div className="auth-glow-2"></div>

      <div className="auth-card animate-scale-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <img src="/karnataka_tourism_logo.png" alt="Pravasi Logo" className="logo-img" />
            <span>Pravasi <span style={{ color: "var(--primary)", fontWeight: "800" }}>AI</span></span>
          </Link>
          <h2>{isRegister ? "Create your free account" : "Welcome back to Pravasi AI"}</h2>
          <p>{isRegister ? "Start generating bespoke, AI-guided schedules" : "Plan, explore, and resume your dream itineraries"}</p>
        </div>

        {error && (
          <div className="auth-error-box">
            <AlertCircle size={18} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg btn-icon" disabled={loading}>
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isRegister ? "Create Account" : "Sign In"}</span>
              </>
            )}
          </button>

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{
                flex: 1,
                padding: "8px 10px",
                fontSize: "12px",
                background: "rgba(99, 102, 241, 0.08)",
                borderColor: "rgba(99, 102, 241, 0.3)",
                color: "var(--text-light)"
              }}
              onClick={async () => {
                setLoading(true);
                setError("");
                try {
                  const res = await API.post("/auth/login", {
                    email: "demo@pravasi.com",
                    password: "password123",
                  });
                  login(res.data.token, res.data.user);
                  navigate("/dashboard");
                } catch (err) {
                  setError(err.response?.data?.message || "Demo login failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              ⚡ Quick Demo User
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{
                flex: 1,
                padding: "8px 10px",
                fontSize: "12px",
                background: "rgba(234, 88, 12, 0.08)",
                borderColor: "rgba(234, 88, 12, 0.3)",
                color: "var(--text-light)"
              }}
              onClick={async () => {
                setLoading(true);
                setError("");
                try {
                  const res = await API.post("/auth/login", {
                    email: "admin@pravasi.com",
                    password: "admin123",
                  });
                  login(res.data.token, res.data.user);
                  navigate("/admin");
                } catch (err) {
                  setError(err.response?.data?.message || "Admin login failed");
                } finally {
                  setLoading(false);
                }
              }}
            >
              👑 Admin Login
            </button>
          </div>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
          <div style={{ flexGrow: 1, height: "1px", background: "rgba(255,255,255,0.08)" }}></div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>or continue with</span>
          <div style={{ flexGrow: 1, height: "1px", background: "rgba(255,255,255,0.08)" }}></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_dark"
            shape="pill"
            width="360"
          />

          <button
            type="button"
            onClick={() => {
              const mockPayload = {
                name: "Google Explorer",
                email: "googleexplorer@example.com",
                sub: "google_mock_user_id_12345"
              };
              const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + 
                btoa(JSON.stringify(mockPayload)) + 
                ".mockSignature";
              handleGoogleSuccess({ credential: mockToken });
            }}
            className="btn btn-outline btn-sm"
            style={{
              width: "100%",
              maxWidth: "360px",
              borderColor: "rgba(99, 102, 241, 0.35)",
              borderRadius: "20px",
              padding: "9px 0",
              fontSize: "12px",
              color: "var(--text-muted)",
              marginTop: "4px"
            }}
          >
            🚀 Continue with Google (Bypass Popup)
          </button>
        </div>

        <div className="auth-footer">
          {isRegister ? (
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          ) : (
            <p>
              Don't have an account? <Link to="/register">Sign Up Free</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
