# CivicPulse — Frontend

CivicPulse is a community issue reporting and management platform. Residents can report local problems, browse public reports, and follow each issue from submission through resolution. Administrators and field personnel have role-specific workspaces for triage, assignment, progress updates, and user management.

<div align="center">
  <img height="500" src="https://drive.google.com/uc?export=view&id=1wCo39bsTqoxGc3nSJwBaiNzTTycOVAm4" alt="CivicPulse" />
</div>

<p align="center">
  <a href="https://civic-pulse-frontend-flame.vercel.app/"><strong>Live Demo</strong></a> ·
  <a href="https://github.com/mdashraful24/civic-pulse-frontend"><strong>Frontend Repository</strong></a> ·
  <a href="https://github.com/mdashraful24/civic-pulse-backend"><strong>Backend Repository</strong></a> ·
  <a href="https://civic-pulse-backend-eta.vercel.app/"><strong>Backend API</strong></a>
</p>

---

## Live links

| Resource | URL |
| --- | --- |
| Live application | https://civic-pulse-frontend-flame.vercel.app/ |
| Public issue browser | https://civic-pulse-frontend-flame.vercel.app/issues |
| Login page (quick logins) | https://civic-pulse-frontend-flame.vercel.app/login |
| Backend API | https://civic-pulse-backend-eta.vercel.app/ |
| Backend health check | https://civic-pulse-backend-eta.vercel.app/health |
| Frontend repository | https://github.com/mdashraful24/civic-pulse-frontend |
| Backend repository | https://github.com/mdashraful24/civic-pulse-backend |
| Postman collection | [CivicPulse.postman_collection.json](https://github.com/mdashraful24/civic-pulse-backend/blob/main/postman/CivicPulse.postman_collection.json) |

## Demo accounts

The demo accounts are created by the backend seed script. All three share the same quick-login buttons on the [login page](https://civic-pulse-frontend-flame.vercel.app/login).

| Role | Name | Email | Password | Default workspace |
| --- | --- | --- | --- | --- |
| Admin | CivicPulse Admin | `admin@civicpulse.local` | `Admin@12345` | `/dashboard/manage`, `/dashboard/users` |
| Personnel | CivicPulse Personnel | `personnel@civicpulse.local` | `Personnel@12345` | `/dashboard/assigned` |
| Citizen | CivicPulse Citizen | `citizen@civicpulse.local` | `Citizen@12345` | `/dashboard/report`, `/dashboard/my-issues` |

> These credentials are for the seeded demo environment only. Change the `SEED_*` variables and set `SEED_ON_START=false` for any non-local or production deployment.

### Quick login

The login page can render one-click role buttons when the following environment variables are set:

```dotenv
NEXT_PUBLIC_QUICK_LOGIN_CITIZEN_EMAIL="citizen@civicpulse.local"
NEXT_PUBLIC_QUICK_LOGIN_CITIZEN_PASSWORD="Citizen@12345"

NEXT_PUBLIC_QUICK_LOGIN_PERSONNEL_EMAIL="personnel@civicpulse.local"
NEXT_PUBLIC_QUICK_LOGIN_PERSONNEL_PASSWORD="Personnel@12345"

NEXT_PUBLIC_QUICK_LOGIN_ADMIN_EMAIL="admin@civicpulse.local"
NEXT_PUBLIC_QUICK_LOGIN_ADMIN_PASSWORD="Admin@12345"
```

Leave any email/password pair blank to hide that role's quick-login button.

---

## Table of contents

- [Features](#features)
- [Roles and permissions](#roles-and-permissions)
- [Issue workflow](#issue-workflow)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Routes](#routes)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API integration](#api-integration)
- [Design and accessibility](#design-and-accessibility)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Public experience

- Browse a searchable, filterable public issue list
- Filter reports by category, priority, and status
- Sort and paginate issue results
- Open an issue detail page with its description, location, image, people involved, and status history
- Read the Terms & Conditions, Privacy Policy, and Security pages
- Responsive layouts with light and dark themes

### Citizen workspace

- Register with email verification and OTP confirmation
- Sign in and maintain a protected session
- Report an issue with a title, description, category, location, priority, and optional image
- View and manage personally reported issues
- Track pending, in-progress, and resolved reports
- Manage profile and account security settings

### Administrator workspace

- View issue statistics and recent activity
- Manage all reported issues
- Assign issues to personnel
- Update issue status and add resolution notes
- Search and manage platform users
- Change user roles, block or unblock accounts, reset passwords, terminate sessions and delete accounts
- Review analytics, the admin activity log, the moderation queue and app settings

### Personnel workspace

- View issues assigned to the current field worker
- Update assigned issue progress and resolution details
- Access profile and account security settings

## Roles and permissions

| Capability | Citizen | Admin | Personnel |
| --- | --- | --- | --- |
| Browse public issues | Yes | Yes | Yes |
| Report an issue | Yes | No | No |
| Manage own issues | Yes | No | No |
| Manage all issues | No | Yes | No |
| Assign issues | No | Yes | No |
| Manage users | No | Yes | No |
| Update assigned issues | No | No | Yes |
| Manage profile and security | Yes | Yes | Yes |

## Issue workflow

1. A citizen submits a report, which starts in `Pending`.
2. An administrator reviews the report and may assign it to personnel.
3. Personnel update the report to `In progress` while work is underway.
4. The issue is marked `Resolved` with an optional resolution note.

Supported categories:

- Roads and potholes (`ROADS`)
- Streetlights (`STREETLIGHTS`)
- Water and drainage (`WATER`)
- Waste and sanitation (`WASTE`)
- Other (`OTHER`)

Supported priorities are `Low`, `Medium`, and `High`.

## Technology

| Area | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) App Router |
| UI runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Data fetching | TanStack React Query |
| Validation | Zod |
| Icons | Lucide React |
| Theming | `next-themes` |
| Notifications | Sonner |
| Tooling | Biome (lint + format), Bun |

## Project structure

```text
src/
├── app/
│   ├── (auth)/                 Authentication pages
│   ├── (site)/                 Public landing page, issue browser, and legal pages
│   └── dashboard/              Protected role-based workspace
├── components/
│   ├── auth/                   Authentication UI
│   ├── dashboard/              Dashboard shell and management views
│   ├── issues/                 Issue forms, cards, browser, and details
│   ├── legal/                  Legal page layout
│   └── ui/                     Shared interface components
└── lib/
    ├── api.ts                  API client and session refresh handling
    ├── constants.ts            Categories, roles, statuses, and labels
    ├── types.ts                Domain and API types
    └── validation.ts           Form validation schemas
```

## Routes

### Public routes

```text
/
/issues
/issues/[id]
/login
/register
/verify-email
/terms
/privacy
/security
```

### Protected routes

```text
/dashboard
/dashboard/report
/dashboard/my-issues
/dashboard/manage
/dashboard/assigned
/dashboard/users
/dashboard/analytics
/dashboard/activity
/dashboard/moderation
/dashboard/settings
/dashboard/ai
/dashboard/profile
```

Access to dashboard routes is guarded by authentication and role-aware navigation. The API client uses credentialed requests and attempts a session refresh after an authenticated request receives a `401` response.

## Getting started

### Prerequisites

- Node.js 20 or later
- Bun 1.4 or later (or a compatible npm/pnpm setup)
- The [CivicPulse backend](https://github.com/mdashraful24/civic-pulse-backend) running locally or available remotely
- Redis and PostgreSQL are required by the backend, not by the frontend

### Install dependencies

```bash
bun install
```

### Configure the environment

```bash
cp .env.example .env.local
```

Set `API_PROXY_TARGET` to the backend API root (including the `/api` prefix):

```dotenv
API_PROXY_TARGET="http://localhost:5000/api"
```

The browser only calls the same-origin `/api` path; Next.js rewrites it to the backend through `next.config.ts`. Never commit real `.env` files or credentials.

### Run the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
bun run build
bun run start
```

### Run tests

```bash
bun run test          # Vitest + Testing Library component tests
bun run test:e2e      # Playwright smoke tests (install chromium first)
```

```bash
bunx playwright install chromium
```

The suite includes 7 component tests and 8 Playwright E2E tests covering public pages, AI and admin flows.

### Check code quality

```bash
bun run lint
```

To format the project with Biome:

```bash
bun run format
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `API_PROXY_TARGET` | Yes (local/prod) | Backend API root used by the `/api` rewrite, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_API_URL` | Fallback | Used if `API_PROXY_TARGET` is not set |
| `NEXT_PUBLIC_QUICK_LOGIN_CITIZEN_EMAIL` / `_PASSWORD` | Optional | Show the Citizen quick-login button |
| `NEXT_PUBLIC_QUICK_LOGIN_PERSONNEL_EMAIL` / `_PASSWORD` | Optional | Show the Personnel quick-login button |
| `NEXT_PUBLIC_QUICK_LOGIN_ADMIN_EMAIL` / `_PASSWORD` | Optional | Show the Admin quick-login button |

## API integration

The frontend expects a REST API behind the `/api` path. The client handles:

- Registration, login, email verification, OTP resend, logout, and token refresh
- Current-user information and profile updates
- Paginated issue listing and issue details
- Issue creation, editing, assignment, and status changes
- Issue history and statistics
- Administrative user listing and management

Responses use the typed API envelope defined in [`src/lib/types.ts`](./src/lib/types.ts). Request and response behavior is centralized in [`src/lib/api.ts`](./src/lib/api.ts).

For endpoint details, authentication cookies, and request examples, see the [backend API reference](https://github.com/mdashraful24/civic-pulse-backend#api-reference).

## Design and accessibility

CivicPulse uses a responsive, mobile-first interface with:

- Shared buttons, fields, badges, modals, pagination, feedback, and loading states
- Keyboard-visible focus treatment
- Reduced-motion support
- Responsive navigation for public and dashboard layouts
- Light and dark color themes

## Deployment

The frontend is deployed on Vercel. To deploy your own instance:

1. Import the repository into Vercel with the project root set to `civic-pulse-frontend`.
2. Add `API_PROXY_TARGET` pointing at the deployed backend, e.g. `https://civic-pulse-backend-eta.vercel.app/api`.
3. Add the optional `NEXT_PUBLIC_QUICK_LOGIN_*` variables if you want demo quick-login buttons.
4. Deploy.

The backend must allow the deployed frontend origin through `FRONTEND_URL` and use cross-site cookie settings (`COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`) when frontend and API are on different domains.

## Contributing

1. Fork the repository and create a feature branch.
2. Follow the existing code style and run `bun run lint` before committing.
3. Open a pull request describing the change and its motivation.

## License

This project is intended for educational and portfolio use.
