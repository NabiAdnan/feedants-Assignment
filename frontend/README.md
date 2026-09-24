# Feedants Frontend — Competition Details Screen

React Native (Expo) implementation of the Competition Details screen,
driven entirely by the backend API — no hardcoded competition data.

## Setup

```bash
cd frontend
npm install
```

Point the app at your backend — either export `API_BASE_URL` or set
`extra.apiBaseUrl` in `app.json`:

```json
{
  "expo": {
    ...
    "extra": { "apiBaseUrl": "http://<your-machine-ip>:5000/api" }
  }
}
```
(Use your machine's LAN IP, not `localhost`, when testing on a physical
device via Expo Go.)

Then run:
```bash
npm run start      # Expo dev server, scan QR with Expo Go
npm run android
npm run ios
npm run web
```

Log in with the seeded demo account (`demo@feedants.com` /
`password123`) — a login screen isn't wired into the navigator by
default for this assignment (it's a single-screen deliverable); call
`useAuth().login(...)` from a quick temporary screen/button, or hit
`POST /api/auth/login` and drop the token into AsyncStorage under
`feedants_token` to simulate being signed in.

Pass the real competition id (from `npm run seed` in the backend) as
`initialParams.competitionId` in `RootNavigator.js`, or via navigation
`route.params` if this screen is pushed from another screen.

## Structure
```
src/
  api/            axios client + competition endpoints
  components/      one component per section of the design
  context/         AuthContext (JWT persisted in AsyncStorage)
  navigation/      stack navigator
  screens/         CompetitionDetailsScreen (composes everything)
  theme/           colors/spacing pulled from the design
  utils/           countdown + date formatting
```

## How screen state maps to the design
Every visible state in the reference screens — "Registered" pill, spots
left + progress bar, countdown banner, the bottom CTA text
("Upload Submission" vs "Register" vs "Registration Closed" etc.) — is
rendered directly from `viewState` returned by
`GET /api/competitions/:id`. The screen never locally decides "is this
user allowed to register" — it asks the backend and renders the answer,
so the UI can't drift out of sync with the actual business rules
(overlapping dates, sold-out spots, already-submitted, etc).

## Assumptions / trade-offs
- No dedicated login/signup screens were built (out of scope of the
  Competition Details screen); `AuthContext` + the API are ready for one.
- Video playback for the judge's intro / previous winners is stubbed to
  `Linking.openURL` rather than an in-app player, to keep the screen
  focused on the competition/registration/submission flow that's
  actually being evaluated.
- Submission picking uses `expo-document-picker` (video/image types)
  rather than in-app recording.
- If this were shipped for real: add optimistic UI on register (mutate
  local `bookedCount`/CTA immediately, roll back on failure) instead of
  waiting for the round trip, and cache the last successful response so
  the screen isn't blank on a flaky connection.
