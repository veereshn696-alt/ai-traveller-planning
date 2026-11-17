import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import { Send, MessageSquare, Loader, Sparkles, User } from "lucide-react";

const ChatAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  const travelSuggestions = [
    "Is Goa good in July?",
    "Best places to visit in Goa?",
    "What should I pack for travel?",
    "Tips on foreign exchange & currency"
  ];

  const fetchChatHistory = async () => {
    try {
      const response = await API.get("/ai/chat");
      // Map stored model objects back into list of chat bubbles
      const historicalBubbles = [];
      response.data.forEach((log) => {
        historicalBubbles.push({ sender: "user", text: log.question });
        historicalBubbles.push({ sender: "ai", text: log.answer });
      });
      setMessages(historicalBubbles);
    } catch (err) {
      console.error("Could not fetch chat logs:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        fetchChatHistory();
      });
    }
  }, [user]);

  // Keep chat container scrolled to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) setInput(""); // Clear field if typing

    // Append user message bubble
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setLoading(true);

    try {
      const response = await API.post("/ai/chat", { question: query });
      // Append AI response bubble
      setMessages((prev) => [...prev, { sender: "ai", text: response.data.answer }]);
    } catch (err) {
      console.error("Error sending chat query:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Failed to reach travel coordinator. Please check your network connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", paddingBottom: "20px" }}>
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <header className="dashboard-header animate-slide-up" style={{ marginBottom: "20px", flexShrink: 0 }}>
        <div className="header-info">
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/karnataka_tourism_logo.png" alt="Pravasi Logo" className="logo-img-sm" />
            <span>Pravasi AI Travel Assistant</span>
          </h1>
          <p>Ask queries about seasonal climates, packing essentials, or safety advice.</p>
        </div>
      </header>

      {/* Main Chat Box Wrapper */}
      <div className="feature-card" style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid var(--border-glow)",
        borderRadius: "20px",
        background: "var(--bg-card)",
        padding: "0"
      }}>
        
        {/* Messages Body */}
        <div style={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}>
          {fetchingHistory ? (
            <div style={{ textAlign: "center", margin: "auto", color: "var(--text-secondary)" }}>
              <Loader className="animate-spin" size={32} style={{ color: "var(--primary)", margin: "0 auto 10px" }} />
              <span>Restoring your travel discussion...</span>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", margin: "auto", maxWidth: "440px" }}>
              <MessageSquare size={48} style={{ color: "var(--primary)", opacity: 0.7, marginBottom: "16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Start a Conversation</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Type a travel question below or select one of the suggested prompts to query our AI travel coordinator.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "12px",
                    maxWidth: "75%",
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    flexDirection: isUser ? "row-reverse" : "row"
                  }}
                  className="animate-scale-in"
                >
                  {/* Icon Avatar */}
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isUser ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    flexShrink: 0
                  }}>
                    {isUser ? <User size={16} /> : <img src="/karnataka_tourism_logo.png" alt="Pravasi AI Avatar" className="logo-avatar" />}
                  </div>

                  {/* Bubble content */}
                  <div style={{
                    background: isUser ? "rgba(99, 102, 241, 0.12)" : "rgba(16, 20, 39, 0.75)",
                    border: isUser ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid var(--border-glow)",
                    borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                    padding: "12px 18px",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-line",
                    color: "var(--text-primary)"
                  }}>
                    {msg.text.startsWith("**") || msg.text.includes("* ") ? (
                      /* Minimal Markdown renderer logic */
                      <div dangerouslySetInnerHTML={{ 
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/^\* (.*?)$/gm, '• $1')
                      }} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {loading && (
            <div style={{ display: "flex", gap: "12px", alignSelf: "flex-start" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}>
                <Loader className="animate-spin" size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div style={{
                background: "rgba(16, 20, 39, 0.75)",
                border: "1px solid var(--border-glow)",
                borderRadius: "4px 18px 18px 18px",
                padding: "12px 18px",
                fontSize: "14px",
                color: "var(--text-secondary)",
                fontStyle: "italic"
              }}>
                Karnataka Tourism AI is formulating recommendations...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion list */}
        {messages.length === 0 && !fetchingHistory && (
          <div style={{
            padding: "0 24px 16px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            flexShrink: 0
          }}>
            {travelSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="tag-btn"
                style={{ fontSize: "11px", padding: "8px 14px" }}
              >
                <Sparkles size={11} className="tag-sparkle" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}

        {/* Footer Input Area */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "16px 24px",
          display: "flex",
          gap: "14px",
          alignItems: "center",
          background: "rgba(0, 0, 0, 0.15)",
          flexShrink: 0
        }}>
          <input
            type="text"
            placeholder="Type your travel inquiry..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            style={{
              flexGrow: 1,
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "12px 16px",
              borderRadius: "10px",
              color: "var(--text-primary)",
              fontSize: "14px"
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ borderRadius: "10px", padding: "12px", width: "45px", height: "45px" }}
          >
            <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChatAssistant;
