# Feedants Competition Details — Technical Assignment

A functional, state-driven full-stack module for the **Feedants Competition Details** screen built with **React Native (Expo)**, **Node.js (Express.js)**, and **MongoDB**. 

All competition content, dates, remaining spots, user participation state, countdown timers, and bottom primary actions are dynamic and authoritative server-side.

---

## Overview

This repository implements the complete end-to-end competition module requirement for Feedants. The existing UI layout closely matches the reference design while operating against a production-quality backend API.

- **Dynamic Data**: All competition information (prize pool, entry fee, judge, rules, rewards, previous winners, dates) is served from MongoDB.
- **Server-Driven Lifecycle**: Competition stages (`UPCOMING`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `SUBMISSION_OPEN`, `SUBMISSION_CLOSED`, `RESULTS_DECLARED`) are derived automatically from server time and database timestamps.
- **Atomic Concurrency Protection**: Spot reservation uses a single atomic conditional MongoDB update (`$expr: { $lt: ['$bookedCount', '$totalSpots'] }`) coupled with compound unique indexes to guarantee zero spot overbooking under thousands of simultaneous users.
- **State-Driven UI & CTA**: The bottom primary action bar, registered badges, and upload controls are dynamically computed by the backend `viewState` engine.
- **Seamless Authentication**: Unauthenticated users clicking "Register" are presented with an interactive `AuthModal` (supporting Login, Sign Up, and a "Fill Demo Credentials" preset) which seamlessly resumes registration upon login.
- **Authorization & Security**: Enforces strict user ownership (users cannot cancel registrations or submit entries on behalf of another user). Upload middleware validates MIME types, file sizes (200MB limit), and automatically purges rejected temp files.

---

## Tech Stack

### Frontend
- **React Native** (Expo SDK)
- **React Navigation** (Native Stack Navigator)
- **Axios** (Centralized API client with JWT Authorization header interceptors)
- **AsyncStorage** (Persistent token & user storage)
- **Expo DocumentPicker & Clipboard** (File uploads & referral link copying)

### Backend
- **Node.js & Express.js** (REST API)
- **MongoDB & Mongoose** (Data modeling, indexing, & atomic updates)
- **JWT (JSON Web Tokens)** & **Bcrypt.js** (Secure authentication & password hashing)
- **Multer** (Multipart file upload handling with auto-cleanup)
- **Express Rate Limit & Helmet** (Security headers & rate limiting)
- **Express Validator** (Input sanitization & payload validation)

---

## Project Structure

```text
feedants-assignment/
├── backend/
│   ├── seed/
│   │   └── seed.js                   # Seeding competition & demo user with deterministic ID
│   ├── scratch/
│   │   ├── concurrencyTest.js        # Automated concurrency test for spot overbooking
│   │   ├── fullHardeningTest.js      # Hardening suite: 6-stage lifecycle matrix, authz, security
│   │   └── apiTests.js               # Comprehensive API test suite
│   ├── src/
│   │   ├── config/db.js              # MongoDB Mongoose connection pool configuration
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration & login
│   │   │   ├── competitionController.js # Public & user-specific competition detail fetching
│   │   │   ├── registrationController.js # Atomic spot booking & cancellation logic
│   │   │   └── submissionController.js # Submission upload & validation with orphan file cleanup
│   │   ├── middleware/
│   │   │   ├── auth.js               # Require & optional JWT auth middleware
│   │   │   ├── errorHandler.js       # Centralized error & Multer error handler
│   │   │   ├── upload.js             # Multer storage configuration
│   │   │   └── validate.js           # express-validator result handler
│   │   ├── models/
│   │   │   ├── Competition.js        # Competition schema & indexes
│   │   │   ├── Registration.js       # Registration schema & unique active index
│   │   │   ├── Submission.js         # Submission schema & unique user submission index
│   │   │   └── User.js               # User schema & password hashing methods
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Auth routes (/api/auth)
│   │   │   └── competitionRoutes.js  # Competition routes (/api/competitions)
│   │   ├── utils/competitionState.js # Single source of truth for lifecycle & viewState derivation
│   │   ├── app.js                    # Express app middleware & routing setup
│   │   └── server.js                 # Server startup entry point
│   ├── uploads/                      # Static assets (judges & winners images, user submissions)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js             # Axios instance & dynamic base URL configuration
    │   │   └── competitionApi.js     # API functions for competitions & file uploads
    │   ├── components/
    │   │   ├── AuthModal.js          # Login & Signup modal with demo fill preset
    │   │   ├── CompetitionSummaryCard.js
    │   │   ├── CountdownBanner.js    # Server-time synced ticking countdown
    │   │   ├── HeaderBar.js          # Header with user auth pill & language selector
    │   │   ├── ImportantDatesCard.js
    │   │   ├── InfoTabs.js           # About, Judging Parameters, Rules & Eligibility tabs
    │   │   ├── JudgeCard.js          # Judge avatar & intro video link
    │   │   ├── PreviousWinnersRow.js # Horizontal scrollable winner list
    │   │   ├── PrimaryActionBar.js   # Dynamic sticky bottom primary action CTA with double-click guard
    │   │   ├── ReferralCard.js       # Referral link & copy action
    │   │   └── RewardsCard.js        # Prize distribution breakdown
    │   ├── context/
    │   │   └── AuthContext.js        # React Context for authentication state
    │   ├── navigation/
    │   │   └── RootNavigator.js      # Navigation setup
    │   ├── screens/
    │   │   └── CompetitionDetailsScreen.js # Main screen orchestrating dynamic state & actions
    │   ├── theme/colors.js           # Visual design palette & tokens
    │   └── utils/dateUtils.js        # Date formatting & countdown breakdown helpers
    ├── App.js
    ├── app.json
    └── package.json
```

---

## Setup & Running Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas connection string.

---

### Running the Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment variables (optional, defaults provided)
# Copy .env.example if you wish to adjust MONGO_URI or JWT_SECRET
cp .env.example .env

# 3. Seed demo competition and user data
npm run seed

# 4. Start the backend development server (running on http://localhost:5000)
npm run dev
```

---

### Running the Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Expo development server
npx expo start
```

#### Running on Expo Web (Browser)
Press `w` in the Expo terminal window OR run:
```bash
npx expo start --web
```
The application will open in your browser at `http://localhost:8081`.

#### Running on Physical Device (Expo Go)
If running Expo Go on a physical phone:
1. Ensure your computer and phone are connected to the same Wi-Fi network.
2. Update the API URL in `frontend/src/api/client.js` or `.env` using `EXPO_PUBLIC_API_URL`:
   ```bash
   # Set environment variable when starting Expo
   EXPO_PUBLIC_API_URL=http://<YOUR-PC-LAN-IP>:5000/api npx expo start
   ```
   *(Example: `http://192.168.1.50:5000/api`)*
3. Scan the QR code using the Expo Go app.

---

## Automated Test Suite Execution

You can run all backend test suites directly:

```bash
cd backend

# 1. Test registration spot concurrency (10 simultaneous requests vs 1 spot)
node scratch/concurrencyTest.js

# 2. Test full hardening suite (All 6 lifecycle stages, authorization, & upload security)
node scratch/fullHardeningTest.js

# 3. Test API endpoint suite (Auth, competition fetch, duplicate registration, validation)
node scratch/apiTests.js
```

---

## Demo Credentials

For quick evaluation, you can click **"✨ Fill Demo Credentials"** in the app's Login modal or enter manually:

- **Email**: `demo@feedants.com`
- **Password**: `password123`

*(Alternatively, click "Sign Up" in the Auth Modal to register a brand new user account directly in the app).*

---

## API Endpoints Specification

### Health & Auth
- `GET /health` — Health check endpoint.
- `POST /api/auth/register` — Register new user account (`name`, `email`, `password`).
- `POST /api/auth/login` — Authenticate existing user and return JWT token.

### Competitions
- `GET /api/competitions` — List published competitions.
- `GET /api/competitions/:id` — Fetch competition details and server-computed `viewState` (Optional Bearer Token).
- `POST /api/competitions/:id/register` — Register authenticated user for competition (Requires Bearer Token).
- `POST /api/competitions/:id/unregister` — Cancel active registration and release spot (Requires Bearer Token).
- `POST /api/competitions/:id/submissions` — Upload submission entry (Multipart `file`, Requires Bearer Token).

---

## Business Rules & Competition Lifecycle Matrix

The backend `competitionState.js` calculates the stage based on server timestamp:

| Stage | Trigger Condition | Allowed User Actions | Primary CTA Label |
| :--- | :--- | :--- | :--- |
| `UPCOMING` | `now < registrationOpenAt` | None | "Registration Opens Soon" |
| `REGISTRATION_OPEN` | `registrationOpenAt <= now < registrationCloseAt` | Register (if spots left) | "Register - ₹99" / "Registered" |
| `REGISTRATION_CLOSED` | `registrationCloseAt <= now < submissionStartAt` | Await submission window | "Submissions Open Soon" |
| `SUBMISSION_OPEN` | `submissionStartAt <= now < submissionEndAt` | Upload / Update submission | "Upload Submission" / "Update Submission" |
| `SUBMISSION_CLOSED` | `submissionEndAt <= now < resultDate` | Await results | "Submitted - Awaiting Result" |
| `RESULTS_DECLARED` | `now >= resultDate` | View results | "View Result" |

---

## Concurrency & Data Consistency Strategy

To support **thousands of concurrent users** registering simultaneously without spot overbooking:

### 1. Atomic Conditional MongoDB Update
Spot reservation is performed in a single atomic database query:
```javascript
const reserved = await Competition.findOneAndUpdate(
  {
    _id: competitionId,
    status: 'PUBLISHED',
    registrationOpenAt: { $lte: now },
    registrationCloseAt: { $gt: now },
    $expr: { $lt: ['$bookedCount', '$totalSpots'] }
  },
  { $inc: { bookedCount: 1 } },
  { new: true }
);
```
MongoDB's single-document write lock guarantees that even if 1,000 requests hit this query simultaneously for the last spot (`bookedCount: 19`, `totalSpots: 20`), **only one single query will match and execute `$inc`**. The remaining 999 queries will match zero documents and return `null`, allowing the server to cleanly respond with `HTTP 409 Conflict: No spots left`.

### 2. Compound Unique Index Safeguard
To prevent duplicate registrations by the same user:
```javascript
registrationSchema.index(
  { competition: 1, user: 1 },
  { unique: true, partialFilterExpression: { status: 'REGISTERED' } }
);
```
If a duplicate request passes step 1, step 2 (`Registration.create`) triggers a MongoDB 11000 duplicate key exception, whereupon the controller automatically rolls back the reserved spot (`bookedCount: -1`).

### 3. Transactions vs. Atomic Reservation Trade-off
In production MongoDB Replica Sets or Atlas clusters, multi-document transactions (`session.startTransaction()`) allow `Registration.create` and `Competition.findOneAndUpdate` to commit atomically. For local standalone MongoDB instances (without replica set enabled), our atomic conditional reservation with automated rollback provides equivalent safety without failing local standalone environments.

---

## Important Assumptions & Payment Modeling

1. **Payment Assumption**: The entry fee (`₹99`) is modeled as competition configuration and registration payload for this technical assignment. In a production application, registration activation would be tied to a verified payment gateway webhook (e.g., Razorpay/Stripe order capture).
2. **Local Media Storage**: Media files (judge avatars, winner photos, and submission videos) are stored under `backend/uploads/` and served statically via Express.
3. **Server Time Authority**: The client calculates countdown timers using `serverTime` returned by the API to remain independent of device clock manipulation.

---

## Major Technical Decisions

1. **Server-Derived ViewState**: Rather than re-implementing complex lifecycle and spot availability rules across mobile client platforms, the backend returns a clean `viewState` object containing stage flags and primary CTA attributes (`type`, `label`, `enabled`).
2. **Preservation of UI Design**: All visual styling, card layouts, colors, and typography from the reference design were strictly preserved.
3. **Expo Web & Mobile Compatibility**: The file upload handler detects browser `Blob`/`File` objects vs React Native `{ uri, name, type }` objects to function seamlessly on both Expo Web and native devices.
4. **Double-Action Protection**: The primary action button disables while requests are in-flight, preventing accidental double submissions or duplicate registration attempts.

---

## Evolution to High-Scale Production

| Component | Technical Assignment Implementation | Scalable Production Implementation |
| :--- | :--- | :--- |
| **Database** | Standalone MongoDB | MongoDB Replica Set / Sharded Cluster with multi-document transactions |
| **File Storage** | Local Disk Storage (`/uploads`) | AWS S3 / Cloudflare R2 direct pre-signed URL uploads + CloudFront CDN |
| **Caching** | Direct DB reads | Redis cluster caching competition details & live spot counters |
| **Queue & Workers**| Synchronous controller processing | BullMQ / Kafka background worker pipeline for video encoding & async jobs |
| **Payment Gateway**| Simulated confirmation | Razorpay / Stripe Webhook payment verification pipeline |
| **Scale & Infra** | Single Express server | Horizontal Express nodes behind AWS ALB with auto-scaling & rate limiting |
| **Monitoring** | Console logs | OpenTelemetry + Prometheus/Grafana + Sentry error reporting |
