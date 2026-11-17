# Pravasi AI — Full-Stack AI Travel Planner & Hotel Booking Platform

> An intelligent, end-to-end travel curation and accommodation booking web platform powered by the MERN stack, Google Gemini AI, and Razorpay payment processing.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Itinerary & Route Generation
- **Google Gemini Integration**: Dynamically generates tailored multi-day travel itineraries based on destination, origin, budget limits, travel styles (*Budget, Standard, Luxury, Adventure, Family*), and personal interests.
- **Multi-Modal Transit Calculator**: Estimates duration and costs for Flights, Trains, Buses, and Cabs connecting origin and destination hubs.
- **Fail-Safe Offline Engine**: Built-in curated destination database ensuring 100% platform uptime even under external API rate limits or network drops.

### 2. 💳 Real-Time Hotel Booking & Razorpay Payment Gateway
- **Direct Hotel Booking**: Integrated accommodation reservation flow allowing users to select recommended stays based on their travel persona.
- **Real-Time Payment Processing**: Secured Razorpay gateway integration accepting UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallets in Indian Rupees (INR).
- **Cryptographic Signature Verification**: HMAC SHA256 server-side verification ensuring tamper-proof payment confirmation before booking records are locked in MongoDB.
- **Instant Digital Receipts & Status**: Automated booking lifecycle tracking (`pending` ➔ `confirmed` ➔ `failed`).

### 3. 🌦️ Real-Time Weather & Dynamic Media
- **Live 5-Day Weather Forecasts**: Integrated with Open-Meteo Geocoding & Forecast APIs to provide temperature, humidity, and condition advisories.
- **Dynamic Landmark Photography**: Real-time integration with Wikimedia Commons API to fetch authentic photos for itinerary checkpoints.

### 4. 💬 "Pravasi" Conversational Travel Assistant
- Context-aware chatbot offering localized travel tips, packing advice, and itinerary adjustments with persistent chat history in MongoDB.

### 5. 📊 Admin Dashboard & User Management
- Centralized analytics dashboard tracking total users, active itineraries, system metrics, and administrative moderation tools.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, React Router v7, Context API, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express 5, RESTful APIs, JWT Authentication, Bcrypt.js, CORS
- **Database**: MongoDB, Mongoose ODM
- **Payments & External APIs**: Razorpay SDK, Google Gemini AI API (`gemini-flash-latest`), Open-Meteo Weather API, Wikimedia Commons API

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or Local MongoDB instance

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/ai-travel-planner.git
cd ai-travel-planner

# Install root dependencies
npm install

# Install backend & frontend dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Environment Variables
Configure `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Launch
Run both frontend and backend concurrently:
```bash
npm start
```
The application will automatically start on `http://localhost:5173`.
