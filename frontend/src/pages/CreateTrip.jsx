import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { Compass, Calendar, ArrowLeft, ArrowRight, Sparkles, Loader, MapPin } from "lucide-react";
import confetti from "canvas-confetti";

const MIN_BUDGET_PER_DAY = {
  "Budget": 1000,
  "Adventure": 2000,
  "Standard": 3000,
  "Family": 4000,
  "Luxury": 10000
};

const parseCost = (costStr) => {
  if (!costStr) return 0;
  const cleaned = costStr.replace(/,/g, "");
  const matches = [...cleaned.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
  if (matches.length === 0) return 0;
  return Math.max(...matches);
};

const loadingTexts = [
  "Consulting AI travel guides...",
  "Curating hotel recommendations for your style...",
  "Drafting day-by-day sightseeing checklist...",
  "Finding authentic local food spots...",
  "Structuring the budget breakdown...",
  "Adding safety guidelines & packing lists..."
];

const CreateTrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [transportOptions, setTransportOptions] = useState([]);
  const [transportLoading, setTransportLoading] = useState(false);
  const [transportError, setTransportError] = useState("");

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const [formData, setFormData] = useState({
    destination: "",
    startLocation: "Bengaluru",
    days: 5,
    budget: 25000,
    travelStyle: "Standard",
    interests: [],
  });

  const [error, setError] = useState("");

  const travelStyles = [
    { title: "Budget", desc: "Hostels, free sights, street eats", icon: "💰" },
    { title: "Standard", desc: "Comfortable stays, popular spots, nice cafes", icon: "💵" },
    { title: "Luxury", desc: "5-star resorts, private guides, fine dining", icon: "💎" },
    { title: "Adventure", desc: "Hiking, trails, adrenaline & sports", icon: "🏔️" },
    { title: "Family", desc: "Kid-friendly attractions, relaxed schedules", icon: "👪" },
  ];

  const interestOptions = [
    "Nature", "Adventure", "Foodie", "History", "Culture", "Shopping", "Nightlife", "Relaxation", "Art & Design", "Photography"
  ];

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const isSelected = prev.interests.includes(interest);
      const newInterests = isSelected
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: newInterests };
    });
  };

  const handleNext = async () => {
    setError("");
    if (step === 1) {
      if (!formData.startLocation.trim()) {
        setError("Please specify your starting location");
        return;
      }
      if (!formData.destination.trim()) {
        setError("Please specify your destination");
        return;
      }
      
      setTransportLoading(true);
      setTransportError("");
      try {
        const response = await API.post("/trips/transport-options", {
          startLocation: formData.startLocation,
          destination: formData.destination
        });
        setTransportOptions(response.data);
        if (response.data && response.data.length > 0) {
          setSelectedTransport(response.data[0]); // pre-select first option
        }
        setStep(2); // Only advance to step 2 on successful load
      } catch (err) {
        console.error("Error fetching transport options:", err);
        setTransportError("Could not fetch real-time transport options. Please try again.");
        setError("Could not fetch real-time transport options. Please try again.");
      } finally {
        setTransportLoading(false);
      }
      return;
    }
    if (step === 2) {
      if (!selectedTransport) {
        setError("Please select a mode of transport");
        return;
      }
    }
    if (step === 3) {
      if (!formData.budget || formData.budget <= 0) {
        setError("Please enter a valid travel budget");
        return;
      }
      const chosenTransportCost = selectedTransport ? parseCost(selectedTransport.cost) : 0;
      const minPerDay = MIN_BUDGET_PER_DAY[formData.travelStyle] || 1000;
      const requiredMin = minPerDay * formData.days + chosenTransportCost;
      if (Number(formData.budget) < requiredMin) {
        setError(`For a ${formData.days}-day ${formData.travelStyle} style trip (with ₹${chosenTransportCost.toLocaleString()} transport), a minimum budget of ₹${requiredMin.toLocaleString()} is recommended.`);
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError("");
    const chosenTransportCost = selectedTransport ? parseCost(selectedTransport.cost) : 0;
    const minPerDay = MIN_BUDGET_PER_DAY[formData.travelStyle] || 1000;
    const requiredMin = minPerDay * formData.days + chosenTransportCost;
    if (Number(formData.budget) < requiredMin) {
      setError(`For a ${formData.days}-day ${formData.travelStyle} style trip (with ₹${chosenTransportCost.toLocaleString()} transport), a minimum budget of ₹${requiredMin.toLocaleString()} is recommended.`);
      return;
    }
    setLoading(true);

    try {
      // Create trip endpoint triggers generation & saves user itinerary
      const response = await API.post("/trips", {
        destination: formData.destination,
        startLocation: formData.startLocation,
        days: formData.days,
        budget: formData.budget,
        travelStyle: formData.travelStyle,
        interests: formData.interests,
        selectedTransport: selectedTransport,
      });

      const data = response.data;

      // Confetti burst for user delight!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      navigate(`/trip/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate trip. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="planner-container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content animate-scale-in">
            <div className="loading-spinner-wrapper">
              <Compass className="spinner-icon animate-spin-slow" size={60} />
            </div>
            <h2>Generating Your Itinerary</h2>
            <p className="loading-subtitle">Our travel AI is planning your trip. This takes a few seconds...</p>
            <div className="progress-bar-container">
              <div className="progress-bar-fill animate-loading"></div>
            </div>
            <p className="rotating-text animate-pulse">{loadingTexts[loadingTextIndex]}</p>
          </div>
        </div>
      )}

      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="planner-card animate-scale-in">
        {/* Step Indicator */}
        <div className="step-indicator">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`step-dot-wrapper ${step >= s ? "active" : ""} ${step === s ? "current" : ""}`}
            >
              <div className="step-dot">{s}</div>
              <span className="step-label">
                {s === 1 ? "Destination" : s === 2 ? "Transport" : s === 3 ? "Budget & Style" : "Interests"}
              </span>
            </div>
          ))}
          <div className="step-connector-bar">
            <div
              className="step-connector-fill"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="planner-error-box">
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Destination & Days */}
        {step === 1 && (
          <div className="step-content animate-slide-up">
            <div className="step-header">
              <h2>Where do you want to explore?</h2>
              <p>Type in your destination and choose the number of days for your trip.</p>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Starting Location (Origin)</label>
              <div className="input-with-icon" style={{ marginTop: "8px" }}>
                <MapPin className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Mumbai, Delhi"
                  value={formData.startLocation}
                  onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "14px 14px 14px 44px",
                    borderRadius: "12px",
                    color: "var(--text-primary)"
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "30px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Dream Destination</label>
              <div className="input-with-icon" style={{ marginTop: "8px" }}>
                <Compass className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="e.g. Goa, Kyoto, Rome, Paris"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "14px 14px 14px 44px",
                    borderRadius: "12px",
                    color: "var(--text-primary)"
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-value">
                <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Trip Duration (Days)</label>
                <span className="badge badge-accent" style={{ fontSize: "13px" }}>{formData.days} Days</span>
              </div>
              <div className="range-selector-wrapper" style={{ marginTop: "8px" }}>
                <Calendar className="range-icon" size={20} />
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                  className="custom-range"
                />
              </div>
              <div className="range-markers">
                <span>1 Day</span>
                <span>5 Days</span>
                <span>10 Days</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Transport Mode Selection */}
        {step === 2 && (
          <div className="step-content animate-slide-up">
            <div className="step-header">
              <h2>Select your preferred mode of transport</h2>
              <p>Real-time options from <strong>{formData.startLocation}</strong> to <strong>{formData.destination}</strong>.</p>
            </div>

            {transportLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                <Compass className="spinner-icon animate-spin-slow" size={40} style={{ color: "var(--primary)" }} />
                <p style={{ marginTop: "12px", color: "var(--text-secondary)", fontSize: "14px" }}>Calculating routes and travel costs...</p>
              </div>
            ) : transportError ? (
              <div className="planner-error-box" style={{ margin: "20px 0" }}>
                <span>{transportError}</span>
                <button 
                  type="button" 
                  onClick={() => handleNext()} 
                  className="btn btn-outline btn-sm" 
                  style={{ marginTop: "10px", width: "max-content", alignSelf: "center" }}
                >
                  🔄 Retry
                </button>
              </div>
            ) : (
              <div className="selector-section">
                <h3>Available Transport Modes</h3>
                <div className="cards-grid" style={{ gridTemplateColumns: "1fr", gap: "12px" }}>
                  {transportOptions.map((option) => {
                    const isSelected = selectedTransport?.mode === option.mode;
                    return (
                      <div
                        key={option.mode}
                        className={`choice-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedTransport(option)}
                        style={{ 
                          padding: "16px 20px", 
                          display: "flex", 
                          flexDirection: "row", 
                          alignItems: "center", 
                          gap: "16px",
                          textAlign: "left",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ fontSize: "32px" }}>
                          {option.mode.split(" ")[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 4px", color: "var(--text-primary)" }}>
                            {option.mode.substring(option.mode.indexOf(" ") + 1) || option.mode}
                          </h4>
                          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "0 0 2px" }}>
                            {option.details}
                          </p>
                          <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "0" }}>
                            🕒 Travel Time: {option.timings}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="badge badge-accent" style={{ fontSize: "14px", fontWeight: "700", padding: "6px 12px" }}>
                            {option.cost}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Budget & Travel Style */}
        {step === 3 && (
          <div className="step-content animate-slide-up">
            <div className="step-header">
              <h2>Select your budget and travel style</h2>
              <p>These details help us customize activities, restaurants, and accommodation choices.</p>
            </div>

            <div className="form-group" style={{ marginBottom: "32px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Trip Budget (₹)</label>
              <div className="input-with-icon" style={{ marginTop: "8px" }}>
                <span className="input-icon" style={{ fontSize: "18px", left: "16px", fontWeight: "600" }}>₹</span>
                <input
                  type="number"
                  placeholder="e.g. 20000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "14px 14px 14px 44px",
                    borderRadius: "12px",
                    color: "var(--text-primary)"
                  }}
                  required
                />
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span>💡 Suggested base minimum for {formData.days} days ({formData.travelStyle} style):</span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    ₹{(formData.days * (MIN_BUDGET_PER_DAY[formData.travelStyle] || 1000)).toLocaleString()}
                  </strong>
                </span>
                {selectedTransport && (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span>🚇 Selected transport fare ({selectedTransport.mode}):</span>
                    <strong style={{ color: "var(--primary)" }}>
                      + ₹{parseCost(selectedTransport.cost).toLocaleString()}
                    </strong>
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: "5px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "5px", marginTop: "2px" }}>
                  <span>Total recommended minimum:</span>
                  <strong style={{ color: "var(--accent)", fontSize: "14px" }}>
                    ₹{(formData.days * (MIN_BUDGET_PER_DAY[formData.travelStyle] || 1000) + (selectedTransport ? parseCost(selectedTransport.cost) : 0)).toLocaleString()}
                  </strong>
                </span>
              </p>
            </div>

            <div className="selector-section">
              <h3>Travel Style</h3>
              <div className="cards-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))" }}>
                {travelStyles.map((style) => (
                  <div
                    key={style.title}
                    className={`choice-card ${formData.travelStyle === style.title ? "selected" : ""}`}
                    onClick={() => setFormData({ ...formData, travelStyle: style.title })}
                    style={{ padding: "18px 12px" }}
                  >
                    <span className="card-emoji" style={{ fontSize: "28px" }}>{style.icon}</span>
                    <h4 style={{ fontSize: "14px", margin: "6px 0 2px" }}>{style.title}</h4>
                    <p style={{ fontSize: "10px", lineHeight: "1.2" }}>{style.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Interests (Optional Enrichment) */}
        {step === 4 && (
          <div className="step-content animate-slide-up">
            <div className="step-header">
              <h2>Select your travel interests (Optional)</h2>
              <p>Add specific interests to refine your sightseeing guides.</p>
            </div>

            <div className="interests-selection-wrapper">
              <div className="tags-container">
                {interestOptions.map((opt) => {
                  const isSelected = formData.interests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`tag-btn ${isSelected ? "active" : ""}`}
                      onClick={() => handleInterestToggle(opt)}
                    >
                      {isSelected && <Sparkles size={14} className="tag-sparkle" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="planner-footer">
          {step > 1 ? (
            <button type="button" onClick={handlePrev} className="btn btn-outline btn-icon" disabled={transportLoading}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div></div> // Spacer
          )}

          {step < 4 ? (
            <button 
              type="button" 
              onClick={handleNext} 
              className="btn btn-primary btn-icon"
              disabled={transportLoading}
            >
              {transportLoading && step === 1 ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="btn btn-primary btn-accent btn-icon btn-lg" disabled={loading}>
              <Sparkles size={18} className="animate-pulse" />
              <span>Generate Itinerary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
