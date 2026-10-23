# CivicPulse frontend

Next.js 16 frontend for **CivicPulse**, a community issue reporting and management platform. Residents can browse public reports and file new ones; administrators triage, assign, prioritise and update issues; field personnel manage the work assigned to them.

The UI talks to the separate CivicPulse backend API (default `http://localhost:5000/api`). This project uses the Next.js App Router, React 19, Tailwind CSS 4, TanStack Query, Zod and Sonner.

## Getting started

### 1. Start the backend

The API, database migrations, seeded demo accounts, Redis and Cloudinary configuration live in the backend project. Follow its README to:

- configure `.env` (Postgres/Neon, Redis, Cloudinary, email)
- run `bun install`
- run the Prisma migration and seed manually against your database
- start it on `http://localhost:5000`

The API must be reachable before the frontend can load data or sign in.

### 2. Configure this app

```bash
bun install
cp .env.example .env.local
```

On PowerShell use `Copy-Item .env.example .env.local`. Then confirm:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

The `/api` prefix is required because the backend mounts every route under `/api`.

Quick-login buttons on `/login` are optional. They are hidden for any role whose email and password are not set in `.env.local`.

### 3. Run it

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

Production check:

```bash
bun run build
bun start
```

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page with live totals and recent reports |
| `/issues` | Public | Browse, search, filter by category/priority/status, sort and paginate |
| `/issues/[id]` | Public | Full report, photo, resolution note and public status timeline |
| `/login` | Public | Email/password sign in, plus optional demo quick-login buttons |
| `/register` | Public | Account details and optional profile photo; starts OTP verification |
| `/verify-email` | Public | Six-digit OTP entry and resend with countdown |
| `/dashboard` | Signed in | Role-aware overview and recent activity |
| `/dashboard/report` | Citizen | Create a report with an optional photo |
| `/dashboard/my-issues` | Citizen | Search own reports, edit/delete pending reports, replace photos |
| `/dashboard/manage` | Admin | Triage all reports, assign personnel, change priority/status, replace photos |
| `/dashboard/users` | Admin | Search the people directory and replace/remove profile photos |
| `/dashboard/assigned` | Personnel | Start assigned work and resolve it with a note |
| `/dashboard/profile` | Signed in | Profile photo, account details, password change and sign out |

`/dashboard/manage?issue=<id>` opens the manage dialog directly for an issue. The **Manage** button on a public issue page uses this deep link for administrators.

## Roles

- **Citizen** — reports issues, edits/deletes them while pending, manages their photo and profile.
- **Personnel** — sees issues assigned to them, moves `PENDING` to `IN_PROGRESS`, then resolves with an optional note.
- **Admin** — manages all issues, assignment, priority, status and public issue photos, and administers user profile photos.

The backend is the authority on permissions. The frontend hides or gates unavailable actions with `RoleGate`, but every request is still protected server-side.

## Authentication

CivicPulse uses credential-based auth only. There is no OAuth or social sign-in.

- The backend sets access and refresh tokens in `httpOnly` cookies.
- Every API request uses `credentials: "include"`; tokens are never read from or stored in browser storage.
- A `401` response triggers one refresh attempt, then the original request is retried.
- If refresh fails, the session is treated as signed out.
- Changing a password revokes existing sessions; the app clears the local user and returns to `/login`.

The frontend allows cross-origin cookies to the configured API URL. In local development the backend should allow the frontend origin (`http://localhost:3000`) and use `COOKIE_SECURE=false` with `COOKIE_SAME_SITE=lax` over HTTP.

## Validation

Client-side validation mirrors the backend Zod schemas. When either side changes, update both.

| Field | Rule |
| --- | --- |
| Name | 2–80 characters |
| Email | Valid address, max 254 characters, normalised to lowercase |
| Password | 8–128 characters, at least one letter and one number, max 72 bytes, different from the current password |
| OTP | Exactly 6 digits |
| Issue title | 3–150 characters |
| Issue description | 10–5000 characters |
| Issue location | 3–200 characters |
| Resolution note | Max 2000 characters |
| Issue search | Max 120 characters |
| Upload | JPEG, PNG, WebP or GIF; max 5 MB; one file |

## Images

Images are uploaded as multipart `form-data` in an `image` field and stored by Cloudinary through the backend. Supported flows:

- optional profile photo during registration
- issue photo on creation and while the report is still pending
- profile photo from `/dashboard/profile`
- issue photo replacement from admin issue management
- profile photo replacement/removal from the admin people directory

`next.config.ts` allows remote images from Cloudinary (`res.cloudinary.com`). Add any other image host there if the backend starts returning one.

## Demo accounts

The backend seed creates these accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@civicpulse.local` | `Admin@12345` |
| Personnel | `personnel@civicpulse.local` | `Personnel@12345` |
| Citizen | `citizen@civicpulse.local` | `Citizen@12345` |

The same values are used by the optional quick-login buttons. Never use demo credentials in production.

## Scripts

```bash
bun dev          # start the development server
bun run build    # production build
bun start        # serve the production build
bun run lint     # Biome checks
bun run format   # Biome formatting
bunx tsc --noEmit  # type check
```

## Troubleshooting

- **Every request fails** — confirm the backend is running and `NEXT_PUBLIC_API_URL` ends in `/api`.
- **CORS or cookie errors** — make sure the backend allows `http://localhost:3000`, and use the same host (`localhost`, not `127.0.0.1`) for both apps.
- **Images fail to render** — confirm the URL host is allowed in `next.config.ts`.
- **Login says the email is unverified** — complete `/verify-email` with the six-digit code, or resend it.
- **Database or OTP errors** — the backend migration, seed or Redis connection is incomplete; check the backend README and logs.
