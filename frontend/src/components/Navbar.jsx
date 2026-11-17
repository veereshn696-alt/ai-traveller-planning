import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  LogIn, 
  UserPlus, 
  Briefcase, 
  MessageSquare, 
  User, 
  ShieldAlert 
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/karnataka_tourism_logo.png" alt="Pravasi Logo" className="logo-img" />
          <span>Pravasi <span style={{ color: "var(--primary)", fontWeight: "800" }}>AI</span></span>
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/saved-trips"
                className={`nav-link ${isActive("/saved-trips") ? "active" : ""}`}
              >
                <Briefcase size={18} />
                <span>My Trips</span>
              </Link>
              
              <Link
                to="/create-trip"
                className={`nav-link ${isActive("/create-trip") ? "active" : ""}`}
              >
                <PlusCircle size={18} />
                <span>Plan Trip</span>
              </Link>
              
              <Link
                to="/chat"
                className={`nav-link ${isActive("/chat") ? "active" : ""}`}
              >
                <MessageSquare size={18} />
                <span>Chat</span>
              </Link>
              
              <Link
                to="/profile"
                className={`nav-link ${isActive("/profile") ? "active" : ""}`}
              >
                <User size={18} />
                <span>Profile</span>
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={`nav-link admin-nav-link ${isActive("/admin") ? "active" : ""}`}
                  style={{ color: "var(--accent)" }}
                >
                  <ShieldAlert size={18} />
                  <span>Admin</span>
                </Link>
              )}

              <div className="user-profile-menu">
                <span className="welcome-text">Hi, {user.name}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm btn-icon">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
              >
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm btn-icon">
                <UserPlus size={16} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
