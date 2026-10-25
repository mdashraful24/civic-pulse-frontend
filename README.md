# CivicPulse

CivicPulse is a community issue reporting and management platform. Residents can report local problems, browse public reports, and follow each issue from submission through resolution. Administrators and field personnel have role-specific workspaces for triage, assignment, progress updates, and user management.

## Features

### Public experience

- Browse a searchable, filterable public issue list
- Filter reports by category, priority, and status
- Sort and paginate issue results
- Open an issue detail page with its description, location, image, people involved, and status history
- View responsive layouts with light and dark themes

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

- Roads and potholes
- Streetlights
- Water and drainage
- Waste and sanitation
- Other

Supported priorities are `Low`, `Medium`, and `High`.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack React Query
- Zod validation
- Lucide React icons
- `next-themes` for theme switching
- Sonner for notifications
- Biome for linting and formatting

## Project structure

```text
src/
├── app/
│   ├── (auth)/                 Authentication pages
│   ├── (site)/                 Public landing page and issue browser
│   └── dashboard/              Protected role-based workspace
├── components/
│   ├── auth/                   Authentication UI
│   ├── dashboard/              Dashboard shell and management views
│   ├── issues/                 Issue forms, cards, browser, and details
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
```

### Protected routes

```text
/dashboard
/dashboard/report
/dashboard/my-issues
/dashboard/manage
/dashboard/assigned
/dashboard/users
/dashboard/profile
```

Access to dashboard routes is guarded by authentication and role-aware navigation. The API client uses credentialed requests and attempts a session refresh after an authenticated request receives a `401` response.

## Getting started

### Prerequisites

- Node.js 20 or later
- Bun 1.4 or later, or a compatible npm/pnpm setup
- The CivicPulse backend API running locally or available remotely

### Install dependencies

```bash
bun install
```

### Configure the API

The frontend calls the same-origin `/api` path:

```ts
export const API_URL = "/api";
```

Configure the Next.js rewrite or proxy for `/api` in `next.config.ts` according to the backend environment. Do not commit credentials or private environment files.

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

### Check code quality

```bash
bun run lint
```

To format the project with Biome:

```bash
bun run format
```

## API integration

The frontend expects a REST API behind the `/api` path. The client handles:

- Registration, login, email verification, OTP resend, logout, and token refresh
- Current-user information and profile updates
- Paginated issue listing and issue details
- Issue creation, editing, assignment, and status changes
- Issue history and statistics
- Administrative user listing and management

Responses use the typed API envelope defined in [`src/lib/types.ts`](./src/lib/types.ts). Request and response behavior is centralized in [`src/lib/api.ts`](./src/lib/api.ts).

## Design and accessibility

CivicPulse uses a responsive, mobile-first interface with:

- Shared buttons, fields, badges, modals, pagination, feedback, and loading states
- Keyboard-visible focus treatment
- Reduced-motion support
- Responsive navigation for public and dashboard layouts
- Light and dark color themes

## License

This project is intended for educational and portfolio use.
