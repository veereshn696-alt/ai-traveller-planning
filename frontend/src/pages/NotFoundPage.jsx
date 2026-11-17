import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="auth-container" style={{ minHeight: "calc(100vh - 160px)" }}>
      <div className="auth-glow-1"></div>
      <div className="auth-glow-2"></div>

      <div className="auth-card animate-scale-in" style={{ textAlign: "center", padding: "50px 40px" }}>
        <div style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "var(--border-glow)",
          border: "1px solid var(--border-glow-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          color: "var(--primary)"
        }}>
          <Compass size={44} className="animate-spin-slow" />
        </div>

        <h1 style={{ fontSize: "72px", fontWeight: "800", lineHeight: "1", color: "var(--primary)" }}>404</h1>
        <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "16px 0 10px" }}>Lost in Transit?</h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "30px", lineHeight: "1.5" }}>
          We couldn't map the coordinates for the page you requested. Let's steer your coordinates back to known territories.
        </p>

        <Link to="/dashboard" className="btn btn-primary btn-block btn-icon">
          <Home size={18} />
          <span>Back to Safety</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
