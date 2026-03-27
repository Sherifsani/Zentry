# SafeTrack

**Nigeria's smart bus transit safety platform.**

Book your seat, share a live tracking link with family, and trigger a silent SOS — all from a single web app.

> Built for the Enyata × Interswitch Buildathon 2026.

---

## The Problem

Inter-city bus travel in Nigeria carries millions of passengers every day across high-risk corridors like Abuja–Lagos and Lagos–Port Harcourt. Yet the entire experience remains dangerously analogue:

- **No visibility.** Once a passenger boards a bus, their family has no way to know where they are. If the bus is delayed, diverted, or involved in an incident — there is no alert, no update, no record.
- **No safety mechanism.** A passenger in distress cannot call for help discreetly. Using a phone to call the police or a family member in a threat situation can escalate danger immediately.
- **No accountability.** Transport operators have no real-time window into their fleet. Incidents are reported after the fact, if at all. There is no audit trail.
- **No digital payment.** Most bookings are cash-based with no confirmation, no trip record, and no identity link between a passenger and a journey.

SafeTrack addresses all four gaps in a single platform.

---

## The Approach

SafeTrack works across three user types — **Passengers**, **Family**, and **Transport Operators** — with each having a purpose-built experience.

The core idea is simple: **every journey should be observable, accountable, and escapable.**

- Observable — family can see exactly where the bus is at all times
- Accountable — operators have a real-time command centre with full incident history
- Escapable — passengers can call for help silently without alerting anyone around them

Rather than building a native app (which creates a download barrier), SafeTrack is a progressive web application. A family member can open a tracking link on any phone with no account and no install.

---

## User Flows

### Passenger Flow

```
Sign up → Browse routes with AI risk scores → Book seat
→ Fill emergency contact details → Simulated payment
→ Receive Trip ID + shareable tracking link
→ Share link to family via WhatsApp / SMS / copy
→ Board bus → View live trip on map
→ [If needed] Hold Safety Button 3 seconds → Select incident type
→ Alert fires silently to operator + SMS to emergency contact
```

### Family Flow

```
Receive tracking link (no login, no app)
→ Open link → See live map with bus position
→ Receive milestone SMS as bus passes waypoints
→ Receive SMS alert if SOS is triggered
→ See "Arrived" notification at destination
```

### Operator Flow

```
Sign up (verified company) → Log in to dashboard
→ View fleet map — all buses as colour-coded live pins
→ Monitor alert feed (SOS, AI anomalies, GPS loss)
→ Click into any bus for full trip details
→ Resolve incidents with notes
→ Add new buses and routes with waypoints
```

---

## Key Features

### Ticket Booking
- Route selection showing origin, destination, departure time, price and AI risk score
- Emergency contact captured at booking — not an afterthought
- Simulated card payment with instant trip confirmation
- Unique Trip ID generated on payment confirmation
- Shareable tracking link generated immediately

### Live Journey Tracking
- GPS updates every 5 seconds via WebSockets (Socket.io)
- Interactive Leaflet.js map — bus position, full route polyline, origin and destination markers
- Journey progress bar with percentage completion
- Trip status badge: On Route / Delayed / Stopped / Alert / Arrived
- Milestone SMS alerts to family as bus passes key waypoints (via Termii)
- **Zero-login family view** — token-based URL, works on any phone with no account

### Silent SOS
- Hold the Safety Button for 3 seconds — **no sound, no visible screen change**
- Incident type selector appears (Suspicious Stop / Armed Attack / Accident / Feeling Unsafe / Other)
- GPS coordinates captured at the moment of trigger
- Operator dashboard receives real-time alert with bus ID, location, and incident type
- Emergency contact receives SMS with incident type and Google Maps link
- Full incident log with timestamps, resolution status and operator notes

### AI Safety Engine
- **Route risk scoring** — Low / Medium / High, calculated from historical incident data on each corridor
- **Plain-English summaries** — Gemini 1.5 Flash generates a one-sentence safety note shown at booking (e.g. "3 incidents reported on this corridor this month — exercise caution")
- **Auto anomaly detection** — if a bus speed drops to zero in a High-risk zone, an incident is auto-created and the operator is alerted without any passenger action
- **GPS loss detection** — a watcher fires every 60 seconds; any bus with no ping for 5+ minutes is flagged offline and the operator is notified
- **Route deviation detection** — haversine distance computed between bus position and all route waypoints; if the bus moves more than 500m off the expected path, the operator is alerted automatically

### Operator Dashboard
- Live fleet map with colour-coded bus pins (green = on route, amber = stopped, red = alert)
- Bus sidebar with driver name, route, status and last ping time
- Real-time alert feed — SOS alerts, AI anomalies, GPS loss events
- Incident log with filter tabs (All / Active / Resolved) and resolve-with-note workflow
- Bus management — add buses with plate number, driver and route assignment
- Route management — add routes with full waypoint list (name, lat, lng), price, departure time and duration

---

## Architecture

```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐
│         Next.js Frontend        │────▶│        Express Backend            │
│         (Vercel)                │◀────│        (Render)                   │
│                                 │ WS  │                                  │
│  • Landing page                 │─────│  • REST API (/api/*)             │
│  • Passenger dashboard          │     │  • Socket.io real-time           │
│  • Booking + payment            │     │  • JWT authentication            │
│  • Live trip map (Leaflet)      │     │  • GPS anomaly engine            │
│  • Family tracking (no login)   │     │  • GPS loss watcher              │
│  • Operator dashboard           │     │                                  │
└─────────────────────────────────┘     └──────────┬───────────────────────┘
                                                   │
                          ┌────────────────────────┼──────────────────────┐
                          │                        │                      │
                   ┌──────▼──────┐       ┌────────▼──────┐     ┌────────▼──────┐
                   │  MongoDB    │       │  Gemini AI    │     │  Termii SMS   │
                   │  Atlas      │       │  (risk        │     │  (alerts &    │
                   │  (data)     │       │  summaries)   │     │  milestones)  │
                   └─────────────┘       └───────────────┘     └───────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS v4, Leaflet.js |
| Backend | Node.js, Express 5, Socket.io |
| Database | MongoDB Atlas (Mongoose) |
| Real-time | Socket.io WebSockets |
| AI | Google Gemini 1.5 Flash |
| SMS | Termii API |
| Auth | JWT (Bearer tokens) |
| Maps | Leaflet.js + OpenStreetMap (no API key required) |
| Fonts | Manrope (headings) + DM Sans (body) |

---

## Data Models

| Model | Purpose |
|---|---|
| `Operator` | Transport company account — company name, email, phone, RC number |
| `Passenger` | Traveller account — name, email, phone, password |
| `Route` | Origin → destination with waypoints, price, risk score, AI summary |
| `Bus` | Plate number, driver, assigned route, live location, status |
| `Trip` | Links passenger + bus + route, holds tracking token and emergency contact |
| `Incident` | SOS or AI-generated alert — type, GPS, status, resolution note |
| `GPSPing` | Raw location ping — TTL indexed, auto-deleted after 7 days |

---

## Project Structure

```
safeTrack/
├── client/                         # Next.js frontend
│   ├── app/
│   │   ├── page.js                 # Landing page
│   │   ├── login/page.js
│   │   ├── signup/
│   │   │   ├── page.js             # Role picker
│   │   │   ├── passenger/page.js
│   │   │   └── operator/page.js
│   │   ├── dashboard/page.js       # Passenger dashboard
│   │   ├── book/[routeId]/page.js  # Booking + payment
│   │   ├── confirmation/[tripId]/  # Post-payment confirmation
│   │   ├── trip/[tripId]/page.js   # Live trip + SOS
│   │   ├── track/[token]/page.js   # Family tracking (no login)
│   │   └── operator/
│   │       ├── dashboard/page.js   # Fleet map + alerts
│   │       ├── buses/page.js
│   │       ├── routes/page.js
│   │       └── incidents/page.js
│   ├── components/
│   │   ├── layout/                 # Navbar, Footer, Hero
│   │   ├── map/                    # LiveMap, FleetMap (Leaflet)
│   │   └── operator/               # OperatorLayout (sidebar nav)
│   └── lib/
│       ├── api.js                  # Axios instance + auth interceptor
│       ├── socket.js               # Socket.io singleton
│       └── auth.js                 # Token + profile helpers
│
└── server/                         # Express backend
    ├── models/                     # Mongoose schemas
    ├── routes/                     # auth, buses, routes, trips, gps, incidents, payment
    ├── services/
    │   ├── claudeService.js        # Gemini AI risk summaries
    │   ├── riskScoring.js          # Score calculation + AI summary cache
    │   ├── anomalyEngine.js        # Speed + deviation detection
    │   ├── gpsLossWatcher.js       # Offline bus detection (60s interval)
    │   └── termiiService.js        # SMS notifications
    ├── config/
    │   ├── db.js                   # MongoDB connection
    │   └── socket.js               # Socket.io singleton
    ├── middleware/
    │   └── auth.js                 # JWT verification
    ├── utils/                      # haversine, routeProgress, generateToken
    └── scripts/seed.js             # Demo data seed
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google AI Studio account (for Gemini API key)

### 1. Clone the repo

```bash
git clone https://github.com/Sherifsani/Zentry.git
cd Zentry
```

### 2. Set up the server

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/safetrack?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
TERMII_API_KEY=your_termii_api_key
TERMII_SENDER_ID=SafeTrack
TERMII_BASE_URL=https://api.ng.termii.com/api
APP_BASE_URL=http://localhost:5000
PAYMENT_CALLBACK_URL=http://localhost:3000/confirmation
```

Seed the database:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

### 3. Set up the client

```bash
cd ../client
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Start the client:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Operator | `demo@safetrack.ng` | `SafeTrack2026` |

Sign up as a passenger directly at `/signup/passenger`.

### Simulating GPS movement

The driver app is out of scope for the MVP. Use the GPS simulation endpoint to move a bus during a demo:

```bash
curl -X POST http://localhost:5000/api/gps/ping \
  -H "Content-Type: application/json" \
  -d '{"busId": "<bus_id_from_seed_output>", "lat": 8.5, "lng": 7.0, "speed": 85}'
```

Bus IDs are printed when you run `npm run seed`.

---

## Deployment

### Backend → Render

1. Create a new Web Service on [render.com](https://render.com)
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `server/.env`
6. Set `NODE_ENV=production`

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Root directory: `client`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
   ```

---

## SMS Notifications (Termii)

SMS is used for three events:
1. **Milestone alerts** — family notified when bus passes key waypoints
2. **SOS alert** — emergency contact receives incident type + Google Maps link
3. **GPS loss** — family notified if bus signal is lost for 5+ minutes

Get a free API key at [termii.com](https://termii.com) (₦100 free credit on signup). Without a key, the app runs fully — alerts still appear on the operator dashboard, only the SMS delivery is skipped.

---

## Built With

- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Socket.io](https://socket.io/)
- [Leaflet.js](https://leafletjs.com/)
- [Google Gemini](https://ai.google.dev/)
- [Termii](https://termii.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

*SafeTrack — Every journey, every passenger, protected.*
