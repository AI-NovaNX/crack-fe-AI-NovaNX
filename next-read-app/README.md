# NexRead

NexRead is a futuristic library web application built with Next.js, React,
TypeScript, Tailwind CSS, and shadcn/ui. The current app focuses on the user
book discovery flow: browsing recommended books, filtering the book list,
searching books, and opening author-specific book pages.

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- lucide-react icons
- React Hook Form for auth form handling
- Railway staging API for books, authors, categories, and authentication

## Current Features

- Authentication pages for login and registration.
- Shared user header with NexRead logo, search form, cart action,
  notification action, profile action, and dark/light theme toggle.
- Header search waits 400 ms after typing, then updates `/book-list?search=...`; Enter or Search submits immediately. Existing category/rating filters are preserved. It filters books by
  title, author, or category.
- Home page sections:
  - Hero section
  - Book categories
  - Recommended for you
  - Popular authors
  - Shared footer
- Book category cards link to filtered Book List views using search params.
- Book List page with:
  - Category filtering
  - Rating filtering
  - Search query filtering
  - Shared book card styling
- Popular Authors cards link to author detail pages.
- Author detail page shows author summary and books by selected author.
- Author API data includes author id, name, book count, borrow count, rating,
  and avatar asset.
- Book API data includes title, author, category, rating, and cover gradient.
- Category API data includes category id, name, slug, subtitle, and icon path.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Main Routes

- `/` - user home page
- `/login` - login page
- `/register` - registration page
- `/book-list` - book list page
- `/book-list?category=Fiction` - book list filtered by category
- `/book-list?rating=4` - book list filtered by rating group
- `/book-list?search=white%20fang` - book list filtered by search query
- `/authors/[id]` - books by selected author
- `/admin/dashboard` - admin dashboard placeholder
- `/admin/books` - admin books placeholder
- `/admin/authors` - admin authors placeholder
- `/admin/categories` - admin categories placeholder
- `/admin/loans` - admin loans placeholder
- `/admin/reports` - admin reports placeholder
- `/admin/reviews` - admin reviews placeholder
- `/admin/settings` - admin settings placeholder
- `/admin/users` - admin users placeholder

## Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── (user)/
│   ├── admin/
│   └── globals.css
├── assets/
│   ├── icons/
│   ├── images/
│   └── logos/
├── components/
│   ├── home/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── lib/
├── services/
│   ├── authors.ts
│   ├── books.ts
│   └── categories.ts
├── types/
└── utils/
```

## Backend integration

Copy `.env.example` to `.env.local` before starting the app:

```bash
cp .env.example .env.local
npm run dev
```

The default targets the staging backend:

```env
NEXT_PUBLIC_API_BASE_URL=https://crack-be-ai-novanx-staging.up.railway.app
```

Restart the dev server after changing the URL. For deployment, set this variable
on the hosting platform before building. The base URL has no `/api` suffix:
`/api` on the backend hosts Swagger; catalog endpoints use `/books`, `/authors`,
and `/categories`. Cart endpoints, when integrated, use `/api/cart`.

Catalog services use the Next.js Data Cache with a 60-second revalidation window
and map nested backend author/category objects into the UI types. Read requests
retry transient network failures twice. Home sections and the Book List show an
inline retry state when neither live nor cached data is available, so navigation
and the rest of the page remain usable. Known avatar/icon paths map
to bundled assets; unknown paths use a generic local fallback. No mock records
are used as a fallback for API failures. User routes have loading/error states.

Category names in existing links resolve to backend category IDs. Search still
matches title, author and category, and rating filters still match integer rating
groups. Those filters read all matching backend pages before filtering because
the backend currently provides only title search and minimum rating. For larger
catalogs, extend the backend search/rating contract to avoid this extra work.

Authentication uses same-origin Next.js routes at `/api/auth/login`, `register`,
`session`, and `logout`. Access/refresh tokens stay in HttpOnly, SameSite=Lax
session cookies (Secure in production), never in localStorage or JSON responses
to the browser. Session lookup checks `/me` and refreshes expired access tokens;
logout revokes the backend refresh token. Mutation routes validate Origin.
Registration sends `fullName`, `email`, and `password` and signs the user in.
The phone field was removed because the backend registration contract has no
phone property. Old mock account storage is cleared.

Global UX feedback includes an offline banner, accessible inline form errors,
loading skeletons, status-aware API messages, success/error toasts, route error
boundaries, and a confirmation modal before logout. Ordinary network failures
remain inline so they do not interrupt the user's work.

Existing cart, checkout, loans, profile, reviews, admin and other placeholder
pages still need their own UI/API implementation; connecting the catalog and
authentication does not make those placeholder features functional.

## Styling Notes

- Tailwind CSS 4 is configured through `globals.css`.
- The color palette is exposed through CSS variables and Tailwind theme tokens.
- Reusable UI primitives live in `src/components/ui`.
- Book cards across Recommended for You, Book List, and Author detail pages use
  the same visual properties for consistency.

## Conventions

- Use TypeScript for application code.
- Keep reusable layout components in `components/layout`.
- Keep home-specific sections in `components/home`.
- Keep shared shadcn-style primitives in `components/ui`.
- Put route-specific filtering state in search params when the result should be
  shareable or reload-safe.
- Keep API calls and response mapping in `src/services`.
- Keep supported book cover styles in `src/lib/book-covers.ts` so Tailwind includes API-provided styles in the build.
