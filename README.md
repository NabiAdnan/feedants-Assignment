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

# Feedants Competition Details — Full-Stack Technical Submission Package

---
The codebase is fully structured, modularized, and submission-ready in your workspace:

```text
feedants-assignment/
├── backend/
│   ├── seed/seed.js                  # Seed competition & demo user with fixed ID
│   ├── scratch/
│   │   ├── concurrencyTest.js        # High-load spot reservation concurrency test
│   │   ├── fullHardeningTest.js      # 6-stage lifecycle matrix & security test
│   │   └── apiTests.js               # Comprehensive API test suite
│   ├── src/
│   │   ├── config/db.js              # Mongoose connection pool
│   │   ├── controllers/              # auth, competition, registration & submission controllers
│   │   ├── middleware/               # auth, errorHandler, upload (with auto-cleanup), validate
│   │   ├── models/                   # Competition, Registration, Submission, User
│   │   ├── routes/                   # authRoutes, competitionRoutes
│   │   ├── utils/competitionState.js # Server-driven lifecycle & viewState engine
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                      # Judges & winners assets, user video/image submissions
│   ├── .env                          # Environment configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/                      # Axios client & competitionApi
    │   ├── components/               # AuthModal, BottomNavBar, PrizeMoneyInfoCard, HearFromUsersCard,
    │   │                             # AdBannerCard, CompetitionSummaryCard, JudgeCard, CountdownBanner,
    │   │                             # ImportantDatesCard, PreviousWinnersRow, InfoTabs, RewardsCard, ReferralCard
    │   ├── context/AuthContext.js    # Persistent AuthContext with login, signup & signout
    │   ├── navigation/RootNavigator.js
    │   ├── screens/CompetitionDetailsScreen.js
    │   ├── theme/colors.js
    │   └── utils/dateUtils.js
    ├── App.js
    ├── app.json
    └── package.json
```

---

## Running Instructions

### Backend (Node.js + Express + MongoDB)
```bash
cd backend

# 1. Install dependencies
npm install
   
# 2. create .env (edit MONGO_URI / JWT_SECRET as needed)
cp .env.example .env

# 3. Seed competition and demo user
npm run seed

# 4. Start development server (http://localhost:5000)
npm run dev
```

### Frontend (React Native + Expo)
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Expo development server
npx expo start
```
- **Web Browser**: Press `w` in the terminal OR run `npx expo start --web` (opens `http://localhost:8081`).
- **Physical Device / Expo Go**: Set `EXPO_PUBLIC_API_URL=http://<YOUR-PC-LAN-IP>:5000/api npx expo start` and scan the QR code.

---

##  Environment Variables & Configuration Details

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/feedants
JWT_SECRET=feedants_dev_secret_2026_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:8081
UPLOAD_DIR=uploads
```

### Demo Credentials
- **Email**: `demo@feedants.com`
- **Password**: `password123`
*(Or click " Fill Demo Credentials" directly inside the app's Auth Modal).*

---



---

##  README Technical Breakdown

### 1. Important Assumptions Made
- **Local Asset Storage**: Local disk storage under `backend/uploads/` is used for media assets and submission uploads to ensure the assignment runs locally without cloud API keys.
- **Payment Business Flow**: Entry fee (`₹99`) is modeled as competition configuration and registration payload; production registration activation would be tied to a verified payment gateway webhook.
- **Server-Time Authority**: Countdown timers are calculated against `serverTime` returned by the API to eliminate device clock dependency.

### 2. Major Technical Decisions
- **Server-Driven ViewState Engine**: The backend `competitionState.js` calculates competition stage (`UPCOMING`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `SUBMISSION_OPEN`, `SUBMISSION_CLOSED`, `RESULTS_DECLARED`) and returns `primaryAction` (`type`, `label`, `enabled`), keeping business logic centralized.
- **Atomic Concurrency Protection**: Spot reservation uses a single atomic conditional update:
  `findOneAndUpdate({ _id, status: 'PUBLISHED', $expr: { $lt: ['$bookedCount', '$totalSpots'] } }, { $inc: { bookedCount: 1 } })`.
- **Compound Unique Index**: Enforced `{ user: 1, competition: 1 }` with `{ status: 'REGISTERED' }` partial filter expression to prevent duplicate active registrations.
- **Orphan File Cleanup**: Submissions middleware purges temporary files (`fs.unlink`) on upload validation failure.

### 3. Trade-offs Considered
- **Local Storage vs Cloud S3**: Local disk storage was selected so reviewers can test the project immediately without configuring AWS credentials.
- **Atomic Operations vs Replica Set Transactions**: Conditional `findOneAndUpdate` with rollback was chosen over MongoDB sessions/transactions to support standalone local MongoDB installations.

### 4. Production Improvements & Scaling Evolution
- **Cloud Media Pipeline**: Stream file uploads directly to AWS S3 / Cloudflare R2 via pre-signed URLs, serving media over CloudFront CDN.
- **Payment Gateway Webhooks**: Integrate Razorpay/Stripe webhook handlers to confirm spot reservation upon verified payment capture.
- **Redis Caching & Queue**: Cache competition metadata in Redis and queue registration/encoding jobs using BullMQ.
- **Horizontal Scaling**: Deploy stateless Express containers behind an Application Load Balancer with autoscaling and Prometheus/Grafana telemetry.
