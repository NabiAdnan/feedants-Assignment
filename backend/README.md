# Feedants Backend — Competition Details API

Node.js + Express + MongoDB backend powering the Competition Details screen.

## Stack
- Express 4, Mongoose 8
- JWT auth
- Multer for submission file uploads (local disk in this assignment; swap
  `src/middleware/upload.js` for an S3/GCS driver in production)
- express-validator, express-rate-limit, helmet

## Setup

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm run seed               # creates the "Feedants Classical Dance" competition
                            # from the design + a demo user
npm run dev                # starts on http://localhost:5000
```

Demo login: `demo@feedants.com` / `password123`
(Seeded referral code: `referral123`, matching the design's referral link.)

## Environment variables

| Var | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret for auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_ORIGIN` | CORS origin for the RN app / web |
| `UPLOAD_DIR` | Local folder for submission files |

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Get JWT |
| GET | `/api/competitions` | optional | List/browse competitions |
| GET | `/api/competitions/:id` | optional | Full details + **server-computed** view state for the current user |
| POST | `/api/competitions/:id/register` | required | Register (atomic, concurrency-safe spot booking) |
| POST | `/api/competitions/:id/unregister` | required | Cancel registration, releases the spot |
| POST | `/api/competitions/:id/submissions` | required | Upload/replace a submission (`multipart/form-data`, field `file`) |

`GET /api/competitions/:id` response shape:
```json
{
  "competition": { "...all display fields..." },
  "viewState": {
    "stage": "REGISTRATION_OPEN",
    "spotsLeft": 19,
    "isRegistered": false,
    "primaryAction": { "type": "REGISTER", "label": "Register - ₹99", "enabled": true },
    "countdownTarget": { "label": "Registration closes in", "target": "2026-08-10T18:20:00.000Z" }
  },
  "registration": null,
  "submission": null,
  "serverTime": "2026-08-09T12:00:00.000Z"
}
```

## Key design decisions

**Everything is server-derived, nothing is a static/hardcoded flag on the
client.** `src/utils/competitionState.js` is the single place that turns
raw timestamps + counts into: the competition's lifecycle stage, whether
the user can register/submit, and what the bottom CTA should say. The
frontend just renders `viewState` — it never independently decides "is
registration still open?". This means the business rules can change
(e.g. add a grace period) without an app release, and the RN app and any
future web client can never disagree about state.

**Concurrency-safe spot booking.** Spots left is not computed by
`COUNT(*)` over registrations at read time (racy + slow at scale).
`Competition.bookedCount` is an atomic counter, incremented via a single
conditional `findOneAndUpdate` (`bookedCount < totalSpots`). MongoDB
executes that as one atomic document operation, so under concurrent
requests for the last spot, only one can win — no two users can ever be
double-booked into spot #20. A unique partial index on
`(competition, user, status=REGISTERED)` independently stops the same
user from double-registering (covers retried requests too). See
`src/controllers/registrationController.js` for the full walkthrough and
rollback logic if registration-record creation fails after the spot was
reserved.

**Time-dependent state uses server time, not device time.** Every
`GET /competitions/:id` response includes `serverTime`; the client
computes an offset once and drives the countdown off
`Date.now() + offset` rather than trusting the device clock, and
re-fetches when a countdown hits zero so the CTA/stage updates without a
manual refresh.

## Assumptions
- Payment capture (Razorpay) is stubbed — `paymentRef`/`amountPaid` are
  accepted on the register call but not verified against a payment
  gateway. In production this would be a server-side order-verification
  step before the registration write.
- One active registration per user per competition (no team/multi-slot
  entries).
- Submission re-upload before the deadline replaces the previous file
  (upsert) rather than keeping a history.

## Trade-offs / what I'd change for production
- Move uploads off local disk to S3/GCS with signed URLs, and process
  video (thumbnail, transcode) via a queue instead of the request thread.
- Add Redis-backed rate limiting instead of in-memory (in-memory limits
  don't share state across multiple API instances behind a load balancer).
- Add a background job to auto-transition/cache competition "stage" so
  hot competitions don't recompute lifecycle on every single read (fine
  at this scale, would shard/cache at very high read volume).
- Real payment webhook handling + idempotency keys on `/register`.
- Structured logging + tracing (currently just morgan/console).
