import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { 
  Compass, 
  Calendar, 
  Wallet, 
  Printer, 
  LayoutDashboard, 
  ChevronRight, 
  CheckSquare, 
  Square, 
  CloudSun, 
  Share2, 
  Check, 
  Calculator, 
  MapPin
} from "lucide-react";

const ActivityPhoto = ({ title, destination }) => {
  const [imgUrl, setImgUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPhoto = async () => {
      try {
        const cleanTitle = (title || "")
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim();
        const cleanDest = (destination || "")
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim();

        // Search Wikimedia Commons with destination + title keyword
        const query = encodeURIComponent(`${cleanDest} ${cleanTitle}`);
        const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*&gsrlimit=1`;
        
        const res = await fetch(api);
        if (!res.ok) throw new Error("API error");
        
        const data = await res.json();
        const pages = data.query?.pages;
        
        if (pages) {
          const firstPageId = Object.keys(pages)[0];
          const url = pages[firstPageId]?.imageinfo?.[0]?.thumburl;
          if (url && active) {
            setImgUrl(url);
            setLoading(false);
            return;
          }
        }

        // Fallback 1: Just search destination + first word of activity
        const firstWord = cleanTitle.split(/\s+/)[0] || "";
        if (firstWord && firstWord.length > 3) {
          const fallbackQuery = encodeURIComponent(`${cleanDest} ${firstWord}`);
          const fallbackApi = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${fallbackQuery}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*&gsrlimit=1`;
          const fallbackRes = await fetch(fallbackApi);
          const fallbackData = await fallbackRes.json();
          const fallbackPages = fallbackData.query?.pages;
          if (fallbackPages) {
            const pageId = Object.keys(fallbackPages)[0];
            const url = fallbackPages[pageId]?.imageinfo?.[0]?.thumburl;
            if (url && active) {
              setImgUrl(url);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Wikimedia fetch error for:", title, err);
      }

      if (active) {
        // Fallback to LoremFlickr if Wikimedia fails
        const cleanDest = (destination || "").toLowerCase().replace(/[^a-z\s]/g, "").trim();
        const cleanTitle = (title || "")
          .toLowerCase()
          .replace(/[^a-z\s]/g, "")
          .trim()
          .split(/\s+/)
          .filter(w => w.length > 3 && w !== "with" && w !== "your" && w !== "this" && w !== "that")
          .slice(0, 2)
          .join(",");
        const q = cleanTitle ? `${cleanDest},${cleanTitle}` : cleanDest;
        setImgUrl(`https://loremflickr.com/300/200/${encodeURIComponent(q)}`);
        setLoading(false);
      }
    };

    fetchPhoto();
    return () => {
      active = false;
    };
  }, [title, destination]);

  return (
    <div className="activity-image-wrapper no-print" style={{
      width: "140px",
      height: "92px",
      borderRadius: "8px",
      overflow: "hidden",
      flexShrink: 0,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(0, 0, 0, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "var(--shadow-premium)"
    }}>
      {loading ? (
        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Loading...</div>
      ) : (
        <img
          src={imgUrl}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80";
          }}
        />
      )}
    </div>
  );
};

const DestinationGallery = ({ destination }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPhotos = async () => {
      try {
        const cleanDest = (destination || "")
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim();

        // Fetch 4 photos from Wikimedia search
        const query = encodeURIComponent(cleanDest);
        const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*&gsrlimit=4`;
        
        const res = await fetch(api);
        if (res.ok) {
          const data = await res.json();
          const pages = data.query?.pages;
          if (pages) {
            const urls = Object.values(pages)
              .map(p => p.imageinfo?.[0]?.thumburl)
              .filter(Boolean);
            if (urls.length >= 2 && active) {
              setPhotos(urls.slice(0, 4));
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Wikimedia gallery fetch error:", err);
      }

      if (active) {
        // Fallback to LoremFlickr for 4 varied themed images
        const cleanDest = (destination || "").toLowerCase().replace(/[^a-z\s]/g, "").trim();
        const themes = ["nature", "landmark", "temple", "scenic"];
        const urls = themes.map(theme => 
          `https://loremflickr.com/320/240/${encodeURIComponent(cleanDest)},${theme}`
        );
        setPhotos(urls);
        setLoading(false);
      }
    };

    fetchPhotos();
    return () => {
      active = false;
    };
  }, [destination]);

  if (loading || !photos.length) return null;

  return (
    <div className="feature-card animate-scale-in" style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <Compass size={18} style={{ color: "var(--primary)" }} />
        <span>Destination Photos</span>
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {photos.map((url, idx) => (
          <div key={idx} style={{ 
            borderRadius: "8px", 
            overflow: "hidden", 
            height: "90px", 
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "var(--shadow-premium)",
            background: "rgba(0,0,0,0.2)"
          }}>
            <img 
              src={url} 
              alt={`${destination} ${idx + 1}`} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=150&q=80";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const TripDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [trip, setTrip] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("itinerary");
  const [checkedItems, setCheckedItems] = useState({});
  const [shared, setShared] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);

  // Budget Calculator local states
  const [accommodationCost, setAccommodationCost] = useState(0);
  const [foodCost, setFoodCost] = useState(0);
  const [travelCost, setTravelCost] = useState(0);
  const [activitiesCost, setActivitiesCost] = useState(0);

  const parseCost = (costStr) => {
    if (!costStr) return 0;
    const cleaned = costStr.replace(/,/g, "");
    const matches = [...cleaned.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
    if (matches.length === 0) return 0;
    return Math.max(...matches);
  };

  const parseActivityCost = (costStr) => {
    if (!costStr) return 0;
    const clean = costStr.toLowerCase().replace(/,/g, "");
    if (clean.includes("free")) return 0;
    const match = clean.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const getDirectionsMode = (modeName) => {
    const name = (modeName || "").toLowerCase();
    if (name.includes("flight") || name.includes("train") || name.includes("bus")) {
      return "transit";
    }
    if (name.includes("walk")) {
      return "walking";
    }
    if (name.includes("cycle") || name.includes("bike")) {
      return "bicycling";
    }
    return "driving";
  };

  const getCleanMode = (modeName) => {
    const name = (modeName || "").toLowerCase();
    if (name.includes("flight")) return "flight";
    if (name.includes("train")) return "train";
    if (name.includes("bus")) return "bus";
    if (name.includes("taxi") || name.includes("car") || name.includes("drive") || name.includes("cab")) return "taxi";
    return name;
  };

  const getKeylessDirFlg = (modeName) => {
    const name = (modeName || "").toLowerCase();
    if (name.includes("flight") || name.includes("train") || name.includes("bus")) {
      return "r";
    }
    if (name.includes("walk")) {
      return "w";
    }
    if (name.includes("cycle") || name.includes("bike")) {
      return "b";
    }
    return "d";
  };

  const getMapSrc = () => {
    if (!trip) return "";
    const origin = trip.startLocation || "Bengaluru";
    const destination = trip.destination;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Default to driving directions if no transport mode has been explicitly selected
    const modeName = selectedTransport ? selectedTransport.mode : "driving";

    if (apiKey) {
      const travelMode = getDirectionsMode(modeName);
      return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${travelMode}`;
    } else {
      const dirflg = getKeylessDirFlg(modeName);
      return `https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=${dirflg}&output=embed`;
    }
  };

  const fetchTripDetails = async () => {
    try {
      const response = await API.get(`/trips/${id}`);
      const data = response.data;
      setTrip(data);

      if (data.selectedTransport) {
        setSelectedTransport(data.selectedTransport);
      }

      // Prefill budget items based on suggest rates
      if (data.itinerary) {
        const days = data.days || 1;

        // 1. Accommodation: first recommended hotel * days
        const firstHotel = data.itinerary.hotelRecommendations?.[0];
        const hotelPrice = firstHotel ? parseCost(firstHotel.estimatedPrice) : 0;
        setAccommodationCost(hotelPrice * days);

        // 2. Food: daily food rate * days
        const dailyFood = data.itinerary.budgetEstimation?.food 
          ? parseCost(data.itinerary.budgetEstimation.food) 
          : 0;
        setFoodCost(dailyFood * days);

        // 3. Local Travel: daily local activities/transport rate * days
        const dailyLocal = data.itinerary.budgetEstimation?.activities 
          ? parseCost(data.itinerary.budgetEstimation.activities) 
          : 0;
        setTravelCost(dailyLocal * days);

        // 4. Activities/Places: sum of exact activity costs
        let totalAct = 0;
        data.itinerary.days?.forEach(dayObj => {
          dayObj.activities?.forEach(act => {
            totalAct += parseActivityCost(act.cost);
          });
        });
        setActivitiesCost(totalAct);
      }

      // Pre-populate packing list
      if (data.itinerary?.packingList) {
        const initialChecked = {};
        data.itinerary.packingList.forEach((item, idx) => {
          initialChecked[idx] = false;
        });
        setCheckedItems(initialChecked);
      }

      fetchWeatherData(data.destination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load itinerary details.");
      setLoading(false);
    }
  };

  const fetchWeatherData = async (city) => {
    try {
      const cleanCity = city.split(",")[0].trim();
      const response = await API.get(`/weather/${encodeURIComponent(cleanCity)}`);
      setWeather(response.data);
    } catch (err) {
      console.error("Could not fetch weather forecast for city:", city, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTripDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  if (loading) {
    return (
      <div className="trip-details-loading-container">
        <Compass className="spinner-icon animate-spin-slow" size={60} />
        <h2>Mapping Destination Itinerary...</h2>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="details-error-container">
        <h2>Itinerary Not Found</h2>
        <p>{error || "We couldn't retrieve the requested itinerary. It might have been deleted."}</p>
        <Link to="/dashboard" className="btn btn-primary btn-icon">
          <LayoutDashboard size={18} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const { itinerary } = trip;
  const transportExpense = selectedTransport ? parseCost(selectedTransport.cost) : 0;
  const calculatedTotal = Number(accommodationCost) + Number(foodCost) + Number(travelCost) + Number(activitiesCost) + transportExpense;

  return (
    <div className="trip-details-page-container">
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Navigation Breadcrumb & Actions */}
      <div className="details-header-actions no-print" style={{ gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        <Link to="/dashboard" className="back-link">
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </Link>
        <ChevronRight size={16} className="bread-sep" />
        <span className="bread-active">{itinerary?.tripTitle || "Itinerary"}</span>

        <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
          <button onClick={handleShare} className="btn btn-outline btn-sm btn-icon">
            {shared ? <Check size={16} style={{ color: "var(--success)" }} /> : <Share2 size={16} />}
            <span>{shared ? "Copied Link!" : "Share Trip"}</span>
          </button>
          <button onClick={handlePrint} className="btn btn-outline btn-sm btn-icon print-btn">
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Trip Poster / Hero Cover */}
      <header className="trip-hero-header" style={{ marginBottom: "0px" }}>
        <div className="hero-overlay"></div>
        <div className="hero-text-content">
          <div className="trip-destination-tag">📍 {trip.destination}</div>
          <h1>{itinerary?.tripTitle || `${trip.destination} Getaway`}</h1>
          <p className="hero-description">{itinerary?.summary || `Personalized ${trip.days}-day travel plan.`}</p>

          <div className="hero-specs-row">
            <div className="hero-spec">
              <Calendar size={18} />
              <div>
                <span className="spec-title">Duration</span>
                <span className="spec-val">{trip.days} Days</span>
              </div>
            </div>
            <div className="hero-spec">
              <Wallet size={18} />
              <div>
                <span className="spec-title">Original Budget</span>
                <span className="spec-val">₹{trip.budget.toLocaleString()}</span>
              </div>
            </div>
            <div className="hero-spec">
              <Compass size={18} />
              <div>
                <span className="spec-title">Travel Style</span>
                <span className="spec-val">{trip.travelStyle}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Column Split Layout */}
      <div className="trip-details-layout">
        
        {/* Left Column: Information Tabs & Sheets */}
        <div className="left-content-pane">
          {/* Tab Navigation */}
          <div className="tabs-container no-print" style={{ marginBottom: "24px" }}>
            <button
              className={`tab-link ${activeTab === "itinerary" ? "active" : ""}`}
              onClick={() => setActiveTab("itinerary")}
            >
              📅 Daily Schedule
            </button>
            <button
              className={`tab-link ${activeTab === "map" ? "active" : ""}`}
              onClick={() => setActiveTab("map")}
            >
              🗺️ Interactive Map
            </button>
            <button
              className={`tab-link ${activeTab === "hotels" ? "active" : ""}`}
              onClick={() => setActiveTab("hotels")}
            >
              🏨 Stays & Hotels
            </button>
            <button
              className={`tab-link ${activeTab === "transport" ? "active" : ""}`}
              onClick={() => setActiveTab("transport")}
            >
              🚇 Transport Guide
            </button>
            <button
              className={`tab-link ${activeTab === "budget" ? "active" : ""}`}
              onClick={() => setActiveTab("budget")}
            >
              💰 Budget Calculator
            </button>
            <button
              className={`tab-link ${activeTab === "checklist" ? "active" : ""}`}
              onClick={() => setActiveTab("checklist")}
            >
              🎒 Packing & Tips
            </button>
          </div>

          <div className="details-body-content">
            {/* Tab 1: Daily Schedule */}
            {(activeTab === "itinerary" || window.matchMedia("print").matches) && (
              <div className={`tab-panel ${activeTab !== "itinerary" ? "print-only-block" : ""}`}>
                <h2 className="print-section-header">📅 Daily Travel Schedule</h2>
                <div className="schedule-timeline">
                  {itinerary?.days?.map((dayObj) => (
                    <div key={dayObj.day} className="timeline-day-block animate-slide-up" style={{ padding: "24px" }}>
                      <div className="timeline-day-title">
                        <div className="day-number">Day {dayObj.day}</div>
                        <h3>{dayObj.theme || `Explore ${trip.destination}`}</h3>
                      </div>

                      <div className="day-activities-list">
                        {dayObj.activities?.map((act, index) => (
                          <div key={index} className="activity-card-row">
                            <div className="activity-time-indicator">
                              <span className="time-badge">{act.time}</span>
                            </div>
                             <div className="activity-body-card" style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start" }}>
                               <div style={{ flex: "1 1 320px" }}>
                                 <div className="activity-header">
                                   <h4>{act.title}</h4>
                                   {act.cost && <span className="activity-cost-tag">{act.cost}</span>}
                                 </div>
                                 <p>{act.description}</p>
                               </div>
                               <ActivityPhoto title={act.title} destination={trip.destination} />
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Interactive Map */}
            {(activeTab === "map" || window.matchMedia("print").matches) && (
              <div className={`tab-panel ${activeTab !== "map" ? "print-only-block" : ""}`}>
                <h2 className="print-section-header">🗺️ Interactive Map</h2>
                <p className="tab-panel-intro no-print">Explore tourist spots, hotels, and restaurants around {trip.destination}.</p>
                <div style={{
                  borderRadius: "12px",
                  height: "450px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}>
                  <iframe
                    title="Google Maps Embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={getMapSrc()}
                  ></iframe>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.3" }}>
                    {selectedTransport ? (
                      <span>Showing directions from <strong>{trip.startLocation || "Origin"}</strong> to <strong>{trip.destination}</strong> via <strong>{selectedTransport.mode}</strong>.</span>
                    ) : (
                      <span>Showing tourist spots, hotels, and restaurants. Select a public transport mode in the Transport Guide tab to see route directions.</span>
                    )}
                  </p>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: "inline-flex", width: "max-content", marginTop: "8px", borderRadius: "10px", padding: "8px 16px" }}
                  >
                    🗺️ Open in Google Maps Tab
                  </a>
                </div>
              </div>
            )}

            {/* Tab 2: Hotels */}
            {(activeTab === "hotels" || window.matchMedia("print").matches) && (
              <div className={`tab-panel ${activeTab !== "hotels" ? "print-only-block" : ""}`}>
                <h2 className="print-section-header">🏨 Recommended Stays</h2>
                <p className="tab-panel-intro no-print">Lodging matches curated for a {trip.travelStyle.toLowerCase()} style vacation.</p>

                <div className="hotels-recommendation-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                  {itinerary?.hotelRecommendations?.map((hotel, index) => (
                    <div key={index} className="hotel-recommendation-card animate-scale-in">
                      <div className="hotel-card-header">
                        <div className="hotel-cover-pattern">🏢</div>
                        <span className="hotel-rating-tag">★ {hotel.rating || "4.5"}</span>
                      </div>
                      <div className="hotel-card-body">
                        <h3>{hotel.name}</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", minHeight: "60px" }}>{hotel.description}</p>
                        <div className="hotel-card-footer" style={{ marginTop: "12px" }}>
                          <span className="hotel-price-span">{hotel.estimatedPrice}</span>
                          <span className="price-label">estimated</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Tab: Transport Guide */}
            {(activeTab === "transport" || window.matchMedia("print").matches) && (
              <div className={`tab-panel ${activeTab !== "transport" ? "print-only-block" : ""}`}>
                <h2 className="print-section-header">🚇 Public Transport Guide</h2>
                <p className="tab-panel-intro">Modes of public transport, travel expenses, and typical timings to {trip.destination}.</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                  {itinerary?.transportGuide && itinerary.transportGuide.length > 0 ? (
                    itinerary.transportGuide.map((modeObj, index) => (
                      <div key={index} className="feature-card animate-scale-in" style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-glow)",
                        background: "rgba(0, 0, 0, 0.15)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px", alignItems: "center" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)", margin: "0" }}>
                            {modeObj.mode}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span className="badge badge-accent" style={{ fontSize: "12.5px", fontWeight: "600", padding: "4px 10px" }}>
                              {modeObj.cost}
                            </span>
                            <button
                              onClick={() => {
                                if (selectedTransport && (selectedTransport.mode === modeObj.mode || getCleanMode(selectedTransport.mode) === getCleanMode(modeObj.mode))) {
                                  setSelectedTransport(null);
                                } else {
                                  setSelectedTransport(modeObj);
                                }
                              }}
                              className={`btn btn-sm ${(selectedTransport && (selectedTransport.mode === modeObj.mode || getCleanMode(selectedTransport.mode) === getCleanMode(modeObj.mode))) ? "btn-primary" : "btn-outline"} no-print`}
                              style={{ borderRadius: "8px", padding: "4px 12px", fontSize: "12px" }}
                            >
                              {(selectedTransport && (selectedTransport.mode === modeObj.mode || getCleanMode(selectedTransport.mode) === getCleanMode(modeObj.mode))) ? "Selected ✓" : "Select Mode"}
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", margin: "0" }}>
                          <strong>Route Details:</strong> {modeObj.details}
                        </p>
                        {modeObj.timings && (
                          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: "0", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>🕒 <strong>Timings/Frequency:</strong></span>
                            <span>{modeObj.timings}</span>
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                      <p>No transport recommendations available for this destination.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Cost Calculator */}
            {(activeTab === "budget" || window.matchMedia("print").matches) && (
              <div className={`tab-panel ${activeTab !== "budget" ? "print-only-block" : ""}`}>
                <h2 className="print-section-header">💰 Travel Cost Estimation & Calculator</h2>
                <p className="tab-panel-intro no-print">Review and edit specific items to calculate your overall planned expenses.</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                  {/* Form inputs */}
                  <div className="feature-card" style={{ padding: "24px", backdropFilter: "var(--glass-backdrop)" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <Calculator size={18} style={{ color: "var(--primary)" }} />
                      <span>Customize Expenses</span>
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div className="form-group">
                        <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Accommodations (₹)</label>
                        <input
                          type="number"
                          value={accommodationCost}
                          onChange={(e) => setAccommodationCost(e.target.value)}
                          style={{
                            background: "rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            color: "var(--text-primary)"
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Food & Dining (₹)</label>
                        <input
                          type="number"
                          value={foodCost}
                          onChange={(e) => setFoodCost(e.target.value)}
                          style={{
                            background: "rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            color: "var(--text-primary)"
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Travel & Flights (₹)</label>
                        <input
                          type="number"
                          value={travelCost}
                          onChange={(e) => setTravelCost(e.target.value)}
                          style={{
                            background: "rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            color: "var(--text-primary)"
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Activities & Fun (₹)</label>
                        <input
                          type="number"
                          value={activitiesCost}
                          onChange={(e) => setActivitiesCost(e.target.value)}
                          style={{
                            background: "rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            color: "var(--text-primary)"
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Card */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className="feature-card total-cost-card" style={{
                      padding: "24px",
                      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
                      border: "1px solid var(--primary)",
                      borderRadius: "16px",
                      textAlign: "center"
                    }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Calculated Budget</span>
                      <h2 style={{ fontSize: "30px", fontWeight: "800", margin: "6px 0", color: "var(--text-primary)" }}>₹{calculatedTotal.toLocaleString()}</h2>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total for {trip.days} days stay</span>
                      {selectedTransport ? (
                        <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "600", display: "block", marginTop: "4px" }}>
                          Includes {selectedTransport.mode} fare (₹{parseCost(selectedTransport.cost).toLocaleString()})
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                          Select transit mode under "Transport Guide" to add fare
                        </span>
                      )}
                    </div>

                    <div className="feature-card" style={{ padding: "20px", background: "rgba(0, 0, 0, 0.2)", border: "1px solid var(--border-glow)" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--accent)" }}>Accurate Cost Breakdown</h4>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>🏨 Accommodation (Hotel):</span>
                          <span>₹{Number(accommodationCost).toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>🍽️ Meals & Dining:</span>
                          <span>₹{Number(foodCost).toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>📍 Recommended Places/Entry Fees:</span>
                          <span>₹{Number(activitiesCost).toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>🚕 Local Transit/Travel:</span>
                          <span>₹{Number(travelCost).toLocaleString()}</span>
                        </div>
                        {selectedTransport && (
                          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary)", fontWeight: "600" }}>
                            <span>🚇 Transit from {trip.startLocation || "Origin"}:</span>
                            <span>+ ₹{parseCost(selectedTransport.cost).toLocaleString()}</span>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "6px", fontWeight: "600" }}>
                          <span>Total Accurate Budget:</span>
                          <span>₹{calculatedTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="feature-card" style={{ padding: "20px", background: "rgba(0, 0, 0, 0.12)" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--text-muted)" }}>AI Suggested References</h4>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Hotel/night:</span>
                          <span>{itinerary?.budgetEstimation?.accommodation || "N/A"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Food/day:</span>
                          <span>{itinerary?.budgetEstimation?.food || "N/A"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Activities/day:</span>
                          <span>{itinerary?.budgetEstimation?.activities || "N/A"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "6px", fontWeight: "600" }}>
                          <span>Total Suggested:</span>
                          <span>{itinerary?.budgetEstimation?.totalEstimated || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Packing Checklist */}
            {(activeTab === "checklist" || window.matchMedia("print").matches) && (
              <div className={`tab-panel ${activeTab !== "checklist" ? "print-only-block" : ""}`}>
                <div className="checklist-tips-panel-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                  <div className="checklist-section">
                    <h2>🎒 Packing List</h2>
                    <p className="checklist-desc no-print">AI recommended packing items for your trip style.</p>
                    <ul className="packing-checkbox-list" style={{ marginTop: "12px" }}>
                      {itinerary?.packingList?.map((item, index) => (
                        <li
                          key={index}
                          className={`packing-item-row ${checkedItems[index] ? "checked" : ""}`}
                          onClick={() => toggleCheck(index)}
                        >
                          <button className="checkbox-toggle no-print">
                            {checkedItems[index] ? (
                              <CheckSquare className="checkbox checked-icon" size={20} />
                            ) : (
                              <Square className="checkbox unchecked-icon" size={20} />
                            )}
                          </button>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="tips-section">
                    <h2>💡 Local Travel & Safety Advice</h2>
                    <p className="tips-desc no-print">Important instructions to navigate the destination smoothly.</p>
                    <ul className="tips-bullet-list" style={{ marginTop: "12px" }}>
                      {itinerary?.localTips?.map((tip, index) => (
                        <li key={index} className="tip-bullet-row animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                          <span className="tip-bullet-icon">✦</span>
                          <p>{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Sidebar containing Map & Weather */}
        <div className="sticky-sidebar no-print">
          
          {/* Weather Widget */}
          {weather && (
            <div className="feature-card animate-scale-in" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <CloudSun size={18} style={{ color: "var(--primary)" }} />
                <span>Weather in {trip.destination}</span>
              </h3>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <span style={{ fontSize: "32px" }}>☀️</span>
                <div>
                  <span style={{ fontSize: "28px", fontWeight: "800", display: "block" }}>{weather.current?.temp}°C</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{weather.current?.description}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div>💧 Humidity: <strong>{weather.current?.humidity}%</strong></div>
                <div>💨 Wind: <strong>{weather.current?.windSpeed} m/s</strong></div>
              </div>

              {/* 5-day weather row */}
              <div style={{ display: "flex", gap: "8px", marginTop: "14px", overflowX: "auto" }}>
                {weather.forecast?.slice(0, 4).map((day, idx) => (
                  <div key={idx} style={{ textAlign: "center", padding: "6px 8px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.03)", flexGrow: 1, minWidth: "60px" }}>
                    <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>{day.dayName?.slice(0, 3)}</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", display: "block", margin: "2px 0" }}>{day.temp}°C</span>
                    <span style={{ fontSize: "8px", color: "var(--text-muted)", display: "block" }}>{day.condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destination Gallery */}
          <DestinationGallery destination={trip.destination} />

          {/* Interactive Google Map Card */}
          {activeTab !== "map" && (
            <div className="feature-card animate-scale-in sidebar-map-card" style={{ padding: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", paddingLeft: "8px", marginBottom: "10px" }}>
                <MapPin size={18} style={{ color: "var(--accent)" }} />
                <span>{selectedTransport ? "Route Directions Map" : "Interactive Map"}</span>
              </h3>
              
              <div style={{
                borderRadius: "12px",
                height: "300px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                <iframe
                  title="Google Maps Embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={getMapSrc()}
                ></iframe>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px", padding: "0 8px" }}>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: "1.3" }}>
                  {selectedTransport ? (
                    <span>Route from <strong>{trip.startLocation || "Origin"}</strong> to <strong>{trip.destination}</strong> via {selectedTransport.mode}.</span>
                  ) : (
                    <span>Showing tourist spots, hotels, and restaurants. Select transit mode under "Transport Guide" to show directions.</span>
                  )}
                </p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm btn-block"
                  style={{ fontSize: "11px", borderColor: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "8px 0" }}
                >
                  🗺️ Open in Google Maps Tab
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default TripDetails;
