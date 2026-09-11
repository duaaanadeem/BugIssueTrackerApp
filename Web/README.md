# Bug & Issue Tracker — Web

Next.js web client for the existing Bug & Issue Tracker. It uses the **same deployed backend and MongoDB database** as the React Native mobile app.

## Backend

```
https://bugissuetrackerappp.onrender.com/api
```

Configured with:

```
NEXT_PUBLIC_API_URL=https://bugissuetrackerappp.onrender.com/api
```

Do not create a second API or database. Mobile and web both talk to this API.

## Run locally

```bash
cd Web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

1. Set the project root to `Web` (or import this folder).
2. Add environment variable `NEXT_PUBLIC_API_URL` with the Render API URL above.
3. Deploy. No MongoDB credentials or JWT secrets belong in the web app.

## Features

- Login, signup, logout, session restore
- Dashboard stats calculated from live project/issue data
- Projects: list, search, create, update, delete
- Issues: list, search, filters, create, update, assign, delete
- Comments and issue history
- Responsive layout (sidebar on desktop, menu on mobile)

## Synchronization

Create or update data in the web app, then refresh the mobile app (or the reverse). Both clients read from the same MongoDB via the same API. This is request-based sync, not realtime.
