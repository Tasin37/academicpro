# AcademicPro

AcademicPro is a full-stack academic assignment support platform built with Next.js, React, TypeScript, MongoDB, Mongoose, and NextAuth. It provides public marketing and content pages, role-based workspaces for students, writers, and administrators, assignment order management, configurable pricing estimates, blog publishing, testimonials, and an administrator-managed FAQ section.

The project currently supports assignment submission and workflow management. It does **not** process payments or include a payment gateway; the assignment price shown to students is an estimate stored with the order for internal workflow purposes.

## Features

### Public website

- Responsive homepage with services, process steps, testimonials, and FAQs.
- Testimonial submission with ratings and pagination of six reviews per page.
- FAQ content loaded from MongoDB and paginated at four FAQs per page.
- Blog listing, category filtering, search, and individual blog article pages.
- Services, contact, pricing redirect, and authentication pages.
- Responsive layouts styled with Tailwind CSS.

### Authentication and roles

- Credentials-based authentication with NextAuth.
- Password hashing with `bcryptjs`.
- Role-based access for:
  - **Students** — create and track assignments.
  - **Writers** — browse, claim, and deliver assignments.
  - **Admins** — manage users, orders, blog articles, and FAQs.
- Protected routes are enforced through the Next.js proxy.
- Automatic inactivity sign-out is configurable.

### Student workspace

- Assignment request form with:
  - Student contact information.
  - Subject code and description.
  - Deadline date and time.
  - Page count.
  - Optional file uploads or cloud links.
  - Selectable price per page: **$5, $10, $15, or $20**.
- Live estimated total based on page count and selected price.
- Server-side price calculation and validation.
- Assignment status and delivered-file tracking.
- Working refresh and sign-out controls.

### Writer workspace

- View available assignment requests.
- Claim assignments.
- View assigned work and compensation.
- Upload completed files and provide cloud links or submission notes.
- Track open requests, active work, completed drafts, and earnings.

### Admin workspace

- Dashboard statistics for users, orders, and blog articles.
- User role and account-status management.
- Assignment status management and deletion.
- Blog article creation, publishing, unpublishing, image upload, and deletion.
- FAQ creation, editing, publishing/hiding, and deletion.
- Mobile-only hamburger navigation with a close button; desktop and tablet use the full tab navigation.

## Technology stack

- **Framework:** Next.js 16 App Router
- **Language:** TypeScript
- **UI:** React 19 and Tailwind CSS 4
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** NextAuth with MongoDB adapter and JWT sessions
- **Password security:** bcryptjs
- **Validation:** ESLint and TypeScript build checks

## Project structure

```text
app/
  admin/                 Admin dashboard
  api/                   Route handlers for auth, orders, blogs, FAQs, testimonials, uploads
  auth/                  Sign-in and sign-up form
  blog/                  Blog listing and article pages
  components/            Shared and feature-specific React components
  contact/               Contact page
  services/              Services page
  student/               Student workspace
  writer/                Writer workspace
  page.tsx               Public homepage
src/
  lib/                   Database, authentication, pricing, and utility modules
  models/                Mongoose schemas and model registry
  types/                 Shared TypeScript declarations
scripts/
  create-admin.js        Create or promote an administrator account
  init-db.js             Create MongoDB collections and indexes
proxy.ts                 Authentication and role-based route protection
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB database or MongoDB Atlas cluster

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   copy .env.example .env.local
   ```

   On macOS or Linux:

   ```bash
   cp .env.example .env.local
   ```

3. Configure `.env.local`:

   ```env
   MONGODB_URI="your-mongodb-connection-string"
   NEXTAUTH_SECRET="your-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_AUTO_SIGNOUT_MINUTES=30
   SESSION_MAX_AGE_SECONDS=1800
   ```

4. Initialize the database collections and indexes:

   ```bash
   npm run init-db
   ```

5. Create an administrator account:

   ```bash
   npm run create-admin
   ```

   Optional arguments are supported:

   ```bash
   node --env-file=.env.local scripts/create-admin.js admin@example.com StrongPassword "First" "Last"
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create and type-check the production build |
| `npm run start` | Start the production server after building |
| `npm run lint` | Run ESLint |
| `npm run init-db` | Create required MongoDB collections and indexes |
| `npm run create-admin` | Create or promote an administrator account |

## Main API routes

| Route | Purpose |
| --- | --- |
| `/api/auth/[...nextauth]` | NextAuth sign-in and session handling |
| `/api/auth/register` | Student and writer registration |
| `/api/orders` | Student order creation and order retrieval |
| `/api/contact` | Public contact inquiry submission |
| `/api/writer/orders` | Writer order browsing, claiming, and delivery |
| `/api/admin/users` | Admin user management |
| `/api/admin/orders` | Admin order management |
| `/api/admin/stats` | Admin dashboard statistics |
| `/api/blogs` | Public blog reads and admin article creation |
| `/api/blogs/[slug]` | Blog article reads and admin updates/deletion |
| `/api/faqs` | Public FAQ reads and admin FAQ CRUD |
| `/api/testimonials` | Public testimonial reads/submission and admin moderation controls |
| `/api/upload` | Authenticated file uploads |

## Pricing behavior

Students choose one of four price-per-page options:

```text
$5, $10, $15, or $20 per page
```

The default is $15 per page. The total is calculated as:

```text
maximum(1, page count) × selected price per page
```

The server recalculates the total instead of trusting the browser-submitted amount. This feature is only an estimate/order value; no payment is collected.

## Security notes

- Keep `.env.local` out of version control.
- Use a long, random `NEXTAUTH_SECRET` in production.
- Use a strong administrator password and change any development credentials.
- Configure MongoDB network access and database users with least privilege.
- Do not expose private upload paths or database credentials publicly.

## Validation

Before submitting changes, run:

```bash
npm run lint
npm run build
```

The production build verifies the Next.js routes and TypeScript types. The repository currently does not include a separate automated test suite.