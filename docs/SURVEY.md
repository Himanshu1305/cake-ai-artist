# Codebase Survey — Cake AI Artist

_Factual project-context document. Generated 2026-07-24 by reading the code directly (parallel section-by-section survey). Every claim is verified against source; anything not confirmable is marked inline as **"unclear:"** or **"suspected:"** rather than inferred._

## Scope at a glance (verified counts)
- **Frontend:** Vite 5 + React 18 + TypeScript SPA (shadcn/Radix + Tailwind). 49 route pages, 76 custom top-level components (+49 shadcn `ui/` primitives, +2 `admin/` components), 17 hooks.
- **Backend:** Supabase — 36 Deno edge functions (+ `_shared/`), 41 public tables + 2 views, 107 SQL migrations.
- **Build note:** `node_modules/` is entirely absent in the working tree (verified: no `typescript`, `vite`, or `react` installed locally). `npx tsc --noEmit` still runs and passes clean because npx fetches TypeScript on demand, but `vite build` **cannot** run until dependencies are installed (confirmed earlier this session: it fails with "Cannot find package 'vite'"). Lockfiles present: `bun.lock`, `bun.lockb`, `package-lock.json` (no `packageManager`/`engines` field declared). See §1.

## Highest-signal caveats (detail in the cited sections)
- **Auth is decentralized** — no `useAuth`/auth context; ~60 sites independently call `supabase.auth.*` and re-query `profiles`. (§4)
- **Generation limits ARE enforced server-side** (5 free lifetime → 403; 10/5-min → 429) in `generate-complete-cake`; client mirrors for UX. The 150/yr premium cap appears client-only. (§4, §8)
- **`ExitIntentModal country="US"` is hardcoded on ~13 non-US pages**, and there are 3 independently hardcoded pricing tables that have already drifted. (§8)
- **RLS is broadly applied** — all 41 tables have RLS enabled with owner-scoped policies + admin override via `has_role()`. (§6)
- **`.env` is committed** with public keys and there is no `.env.example`. (§1)

## Table of contents
1. [Setup & Config](#1-setup--config)
2. [Routes](#2-routes)
3. Component Inventory — [3a Pages A–I](#3a-pages-inventory-part-1-aboutindex) · [3b Pages I–W](#3b-pages-inventory-part-2-indialandingweddingcakedesigner) · [3c Components A–M](#3c-components-inventory-part-1-am) · [3d Components N–Z/admin/ui](#3d-components-inventory-part-2-nz-admin-ui) · [3e Consolidated mobile-only & anchor-CTA lists](#3e-consolidated-mobile-only--anchor-cta-elements)
4. [State & Data Flow](#4-state--data-flow)
5. [Edge Functions](#5-edge-functions)
6. [Database](#6-database)
7. [Theme & Design Tokens](#7-theme--design-tokens)
8. [Footguns](#8-footguns)

---
## 1. Setup & Config

Source of truth for this section: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.env`, lockfiles, and `node_modules/` state — all read directly.

### 1.1 package.json — metadata

- `name`: `vite_react_shadcn_ts`
- `private`: `true`
- `version`: `0.0.0`
- `type`: `module`
- `engines`: **not declared** (no `engines` field present).
- `packageManager`: **not declared** (no `packageManager` field present).

### 1.2 Scripts (verbatim)

| Script | Command |
| --- | --- |
| `dev` | `vite` |
| `build` | `vite build` |
| `build:dev` | `vite build --mode development` |
| `lint` | `eslint .` |
| `lint:models` | `bash scripts/check-model-ids.sh` |
| `preview` | `vite preview` |

`scripts/check-model-ids.sh` exists on disk (verified via `ls scripts/`).

### 1.3 Dependencies (with versions)

| Package | Version |
| --- | --- |
| @hookform/resolvers | ^3.10.0 |
| @radix-ui/react-accordion | ^1.2.11 |
| @radix-ui/react-alert-dialog | ^1.1.15 |
| @radix-ui/react-aspect-ratio | ^1.1.7 |
| @radix-ui/react-avatar | ^1.1.10 |
| @radix-ui/react-checkbox | ^1.3.2 |
| @radix-ui/react-collapsible | ^1.1.11 |
| @radix-ui/react-context-menu | ^2.2.15 |
| @radix-ui/react-dialog | ^1.1.14 |
| @radix-ui/react-dropdown-menu | ^2.1.15 |
| @radix-ui/react-hover-card | ^1.1.14 |
| @radix-ui/react-label | ^2.1.7 |
| @radix-ui/react-menubar | ^1.1.15 |
| @radix-ui/react-navigation-menu | ^1.2.13 |
| @radix-ui/react-popover | ^1.1.14 |
| @radix-ui/react-progress | ^1.1.7 |
| @radix-ui/react-radio-group | ^1.3.7 |
| @radix-ui/react-scroll-area | ^1.2.9 |
| @radix-ui/react-select | ^2.2.5 |
| @radix-ui/react-separator | ^1.1.7 |
| @radix-ui/react-slider | ^1.3.5 |
| @radix-ui/react-slot | ^1.2.3 |
| @radix-ui/react-switch | ^1.2.5 |
| @radix-ui/react-tabs | ^1.1.12 |
| @radix-ui/react-toast | ^1.2.14 |
| @radix-ui/react-toggle | ^1.1.9 |
| @radix-ui/react-toggle-group | ^1.1.10 |
| @radix-ui/react-tooltip | ^1.2.7 |
| @supabase/supabase-js | ^2.74.0 |
| @tanstack/react-query | ^5.83.0 |
| @types/canvas-confetti | ^1.9.0 |
| @types/dompurify | ^3.2.0 |
| canvas-confetti | ^1.9.4 |
| class-variance-authority | ^0.7.1 |
| clsx | ^2.1.1 |
| cmdk | ^1.1.1 |
| date-fns | ^3.6.0 |
| dompurify | ^3.4.8 |
| embla-carousel-autoplay | ^8.6.0 |
| embla-carousel-react | ^8.6.0 |
| framer-motion | ^12.23.24 |
| html2canvas | ^1.4.1 |
| input-otp | ^1.4.2 |
| lucide-react | ^0.462.0 |
| next-themes | ^0.3.0 |
| pdf-lib | ^1.17.1 |
| react | ^18.3.1 |
| react-day-picker | ^8.10.1 |
| react-dom | ^18.3.1 |
| react-helmet-async | ^3.0.0 |
| react-hook-form | ^7.61.1 |
| react-resizable-panels | ^2.1.9 |
| react-router-dom | ^6.30.1 |
| recharts | ^2.15.4 |
| sonner | ^1.7.4 |
| tailwind-merge | ^2.6.0 |
| tailwindcss-animate | ^1.0.7 |
| vaul | ^0.9.9 |
| zod | ^3.25.76 |

Note: `@types/canvas-confetti` and `@types/dompurify` are declared under `dependencies` (not `devDependencies`), as written in the file.

### 1.4 devDependencies (with versions)

| Package | Version |
| --- | --- |
| @eslint/js | ^9.32.0 |
| @tailwindcss/typography | ^0.5.16 |
| @types/node | ^22.16.5 |
| @types/react | ^18.3.23 |
| @types/react-dom | ^18.3.7 |
| @vitejs/plugin-react-swc | ^3.11.0 |
| autoprefixer | ^10.4.21 |
| eslint | ^9.32.0 |
| eslint-plugin-react-hooks | ^5.2.0 |
| eslint-plugin-react-refresh | ^0.4.20 |
| globals | ^15.15.0 |
| lovable-tagger | ^1.1.9 |
| postcss | ^8.5.6 |
| tailwindcss | ^3.4.17 |
| typescript | ^5.8.3 |
| typescript-eslint | ^8.38.0 |
| vite | ^5.4.19 |

### 1.5 vite.config.ts (structural)

- Config is a function of `({ mode })` returning an object.
- `server`: `host: "::"`, `port: 8080`.
- Plugins: `@vitejs/plugin-react-swc` (`react()`), plus `componentTagger()` from `lovable-tagger` **only when `mode === "development"`** (the array is `.filter(Boolean)`-ed to drop the falsy entry in other modes).
- Resolve alias: `"@"` → `path.resolve(__dirname, "./src")`.

### 1.6 tailwind.config.ts (structural — colour tokens intentionally omitted)

- `darkMode`: `["class"]`.
- `content` globs: `./pages/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`, `./app/**/*.{ts,tsx}`, `./src/**/*.{ts,tsx}`.
  - Note: `./pages`, `./components`, `./app` are scanned at the repo root; the actual source lives under `./src`. unclear: whether the non-`src` globs match anything — these root-level dirs were not verified in this survey; they may be inert Lovable/shadcn scaffold defaults.
- `prefix`: `""` (no class prefix).
- `plugins`: `[require("tailwindcss-animate")]`.
  - Note: `@tailwindcss/typography` is a declared devDependency but is **not** wired into `tailwind.config.ts` plugins. unclear: whether typography is applied elsewhere or unused.
- Type-checked with `satisfies Config`.
- Also defines a `container` config, extended `fontFamily` (`display`: Fraunces; `sans`: Inter), custom `backgroundImage`/`boxShadow`/`borderRadius`, and keyframes/animations (`flame-flicker`, `flame-dance`, `candle-glow`, `sparkle`, accordion). Colour token values are covered in another section per instructions.

### 1.7 TypeScript config — noteworthy / non-default settings

Project uses TS project references: root `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`.

**tsconfig.json (root)** — `files: []`, references the two below. Its own `compilerOptions` (these apply to the root project and loosen strictness):
- `paths`: `"@/*"` → `./src/*`
- `noImplicitAny: false`
- `noUnusedParameters: false`
- `noUnusedLocals: false`
- `strictNullChecks: false`
- `skipLibCheck: true`
- `allowJs: true`

**tsconfig.app.json** (`include: ["src"]`) — the app compilation config:
- `target: ES2020`, `module: ESNext`, `moduleResolution: bundler`
- `lib`: `ES2020, DOM, DOM.Iterable`
- `jsx: react-jsx`
- `useDefineForClassFields: true`, `allowImportingTsExtensions: true`, `isolatedModules: true`, `moduleDetection: force`, `noEmit: true`
- **`strict: false`** (strictness turned OFF for app code)
- `noUnusedLocals: false`, `noUnusedParameters: false`, `noImplicitAny: false`, `noFallthroughCasesInSwitch: false`
- `skipLibCheck: true`
- `paths`: `"@/*"` → `./src/*`

**tsconfig.node.json** (`include: ["vite.config.ts"]`) — the build-tooling config:
- `target: ES2022`, `lib: ["ES2023"]`, `module: ESNext`, `moduleResolution: bundler`
- `allowImportingTsExtensions: true`, `isolatedModules: true`, `moduleDetection: force`, `noEmit: true`
- **`strict: true`** (strict IS on here, unlike app config)
- `noUnusedLocals: false`, `noUnusedParameters: false`, `noFallthroughCasesInSwitch: true`
- `skipLibCheck: true`

Net effect: application source (`src`) is compiled **non-strict** with `skipLibCheck`; only `vite.config.ts` is compiled strict.

### 1.8 Environment variables & secrets

#### Frontend (`import.meta.env.*` in `src/`) — from `grep -rn "import.meta.env" src/`

| Variable | File(s) |
| --- | --- |
| VITE_SUPABASE_URL | `src/utils/cakeTextOverlay.ts`, `src/integrations/supabase/client.ts` |
| VITE_SUPABASE_PUBLISHABLE_KEY | `src/integrations/supabase/client.ts` |
| VITE_RAZORPAY_KEY_ID | `src/hooks/useRazorpayPayment.ts` |

#### Edge functions (`Deno.env.get(...)` in `supabase/functions/`) — from `grep -rn "Deno.env.get" supabase/functions/`

Unique variable names and the functions that reference them:

| Variable | Referenced by (function directories under supabase/functions/) |
| --- | --- |
| SUPABASE_URL | cake-generation-watchdog, save-image-to-storage, generate-invite-artwork, cancel-razorpay-subscription, generate-blog-post, test-premium-email, create-razorpay-subscription, add-contact-to-brevo, unsubscribe-blog, check-payment-status, verify-razorpay-payment, generate-complete-cake, party-planner-chat, test-weekly-digest, send-anniversary-reminders, generate-invite-copy, search-local-vendors, send-premium-emails, razorpay-webhook, send-engagement-drip, delete-user-account, create-razorpay-order, send-reengagement-sequence, send-weekly-upgrade-nudge, send-weekly-blog-digest, send-party-invite, send-welcome-email, generate-party-pack, generate-vendor-message, save-cake-audio, send-vendor-email, grant-referral-bonus |
| SUPABASE_SERVICE_ROLE_KEY | cake-generation-watchdog, save-image-to-storage, generate-invite-artwork, cancel-razorpay-subscription, generate-blog-post, test-premium-email, create-razorpay-subscription, add-contact-to-brevo, unsubscribe-blog, check-payment-status, verify-razorpay-payment, generate-complete-cake, party-planner-chat, test-weekly-digest, send-anniversary-reminders, generate-invite-copy, search-local-vendors, send-premium-emails, razorpay-webhook, send-engagement-drip, delete-user-account, create-razorpay-order, send-reengagement-sequence, send-weekly-upgrade-nudge, send-weekly-blog-digest, send-party-invite, send-welcome-email, generate-party-pack, generate-vendor-message, save-cake-audio, send-vendor-email, grant-referral-bonus |
| SUPABASE_ANON_KEY | cancel-razorpay-subscription, check-payment-status, verify-razorpay-payment, create-razorpay-subscription, send-anniversary-reminders, delete-user-account, create-razorpay-order |
| LOVABLE_API_KEY | analyze-cake-text, generate-invite-artwork, generate-blog-post, analyze-cake-photo, generate-complete-cake, party-planner-chat, generate-invite-copy, generate-logo, generate-party-pack, generate-vendor-message |
| RESEND_API_KEY | cake-generation-watchdog, send-anniversary-reminders, test-weekly-digest, send-weekly-blog-digest, send-party-invite, send-welcome-email, send-vendor-email |
| BREVO_API_KEY | add-contact-to-brevo, send-premium-emails, send-engagement-drip, send-reengagement-sequence, send-weekly-upgrade-nudge |
| RAZORPAY_KEY_ID | cancel-razorpay-subscription, create-razorpay-subscription, check-payment-status, delete-user-account, create-razorpay-order |
| RAZORPAY_KEY_SECRET | cancel-razorpay-subscription, create-razorpay-subscription, check-payment-status, verify-razorpay-payment, razorpay-webhook, delete-user-account, create-razorpay-order |
| CRON_SECRET | generate-blog-post, send-anniversary-reminders, send-engagement-drip, send-reengagement-sequence, send-weekly-upgrade-nudge, send-weekly-blog-digest |
| TEST_EMAIL_SECRET | test-premium-email, test-weekly-digest |
| GOOGLE_PLACES_API_KEY | search-local-vendors |

Note: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` are Supabase-provisioned defaults automatically available to edge functions; the others must be configured as function secrets.

#### `.env` file (keys only, values NOT shown)

A `.env` file exists at repo root (395 bytes) containing these keys:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_RAZORPAY_KEY_ID`

Note: `VITE_SUPABASE_PROJECT_ID` is present in `.env` but is not referenced via `import.meta.env` anywhere in `src/`. unclear: where/if it is consumed (may be used by Supabase CLI/tooling rather than app code).

**No `.env.example` file exists** (only `.env` is present at repo root).

### 1.9 Build / tooling constraints

- **Lockfiles present at repo root (all three):**
  - `bun.lock` (text, `lockfileVersion: 1`) — Bun's text lockfile.
  - `bun.lockb` (binary) — Bun's binary lockfile.
  - `package-lock.json` — npm lockfile.
  - Implication: the presence of both `bun.lock` and `bun.lockb` strongly implies **Bun** is the intended package manager (bun.lock is the newest, dated 13 Jul). `package-lock.json` (dated 18 May) also exists, so npm could work too. Having multiple lockfiles is a hazard — they can drift. No `packageManager` field pins a choice.
- **`node_modules/` does NOT exist** — verified: `ls node_modules/vite` fails ("No such file or directory") and the `node_modules` directory itself is absent (0 entries). Therefore **vite is NOT currently installed**, and `node_modules/.bin` does not exist.
- **A fresh clone / current checkout cannot run `dev` or `build` as-is** — it must first install dependencies. Given the lockfiles, `bun install` (preferred, matches bun.lock/bun.lockb) or `npm install` (matches package-lock.json) is required before `bun run dev` / `npm run dev` (→ `vite`) or `... build` (→ `vite build`) will work.
- **Node/bun version requirement**: **not declared** — there is no `engines` field and no `packageManager` field in `package.json`, and no `.nvmrc` was surfaced. unclear: the required runtime versions are not pinned anywhere in the files inspected.

---

### Summary

This is a Lovable-scaffolded Vite + React 18 + TypeScript + shadcn/Radix + Tailwind SPA, paired with a large Supabase edge-functions backend (~30+ Deno functions for payments, email, and AI generation). TypeScript is deliberately non-strict for app code (`strict: false`, `strictNullChecks: false`, `skipLibCheck`), with `@` → `./src` path alias throughout. Frontend reads 3 `VITE_*` vars; edge functions reference 11 distinct secrets (Supabase keys, Lovable/Razorpay/Resend/Brevo/Google Places, plus CRON/TEST secrets).

**Surprising constraints to flag:** (1) `node_modules/` is entirely absent — vite is not installed, so nothing runs until a dependency install happens. (2) Three competing lockfiles coexist (`bun.lock`, `bun.lockb`, `package-lock.json`) with no `packageManager`/`engines` pin, so the intended toolchain and Node/bun versions are unspecified — bun.lock is newest and implies Bun. (3) `.env` is committed to the working tree (contains real Supabase/Razorpay public keys) and there is no `.env.example`. (4) `@tailwindcss/typography` is a dependency but is not registered in the Tailwind plugins array.
## 2. Routes

All routes are declared in `src/App.tsx` inside a single `<Routes>` block (react-router-dom v6). The homepage (`Index`) is an eager import kept in the main bundle for fast LCP; every other route component is code-split via `lazyWithRetry` (from `@/lib/lazyWithRetry`) and rendered inside one shared `<Suspense>` fallback. No route-level `<ProtectedRoute>`/guard wrapper component exists — access control, where present, is implemented inside each page component via `useEffect` + `supabase.auth` + `navigate(...)`.

### 2.1 Full route table

| Path | Component file | Import | Wrapper / guard in App.tsx |
|------|----------------|--------|-----------------------------|
| `/` | `src/pages/Index.tsx` | eager | none |
| `/about` | `src/pages/About.tsx` | lazyWithRetry | none |
| `/privacy` | `src/pages/Privacy.tsx` | lazyWithRetry | none |
| `/advertising` | `src/pages/Advertising.tsx` | lazyWithRetry | none |
| `/terms` | `src/pages/Terms.tsx` | lazyWithRetry | none |
| `/contact` | `src/pages/Contact.tsx` | lazyWithRetry | none |
| `/faq` | `src/pages/FAQ.tsx` | lazyWithRetry | none |
| `/pricing` | `src/pages/Pricing.tsx` | lazyWithRetry | none |
| `/how-it-works` | `src/pages/HowItWorks.tsx` | lazyWithRetry | none |
| `/use-cases` | `src/pages/UseCases.tsx` | lazyWithRetry | none |
| `/blog` | `src/pages/Blog.tsx` | lazyWithRetry | none |
| `/blog/:id` | `src/pages/BlogPost.tsx` | lazyWithRetry | none |
| `/auth` | `src/pages/Auth.tsx` | lazyWithRetry | none |
| `/gallery` | `src/pages/Gallery.tsx` | lazyWithRetry | none |
| `/community` | `src/pages/CommunityGallery.tsx` | lazyWithRetry | none |
| `/settings` | `src/pages/Settings.tsx` | lazyWithRetry | none |
| `/admin` | `src/pages/Admin.tsx` | lazyWithRetry | none |
| `/admin/logo-generator` | `src/pages/AdminLogoGenerator.tsx` | lazyWithRetry | none |
| `/admin/blog-analytics` | `src/pages/AdminBlogAnalytics.tsx` | lazyWithRetry | none |
| `/uk` | `src/pages/UKLanding.tsx` | lazyWithRetry | none |
| `/canada` | `src/pages/CanadaLanding.tsx` | lazyWithRetry | none |
| `/australia` | `src/pages/AustraliaLanding.tsx` | lazyWithRetry | none |
| `/india` | `src/pages/IndiaLanding.tsx` | lazyWithRetry | none |
| `/usa` | `src/pages/USALanding.tsx` | lazyWithRetry | none |
| `/free-ai-cake-designer` | `src/pages/FreeCakeDesigner.tsx` | lazyWithRetry | none |
| `/ai-cake-generator-free` | `src/pages/AiCakeGeneratorFree.tsx` | lazyWithRetry | none |
| `/3d-cake-designer` | `src/pages/ThreeDCakeDesigner.tsx` | lazyWithRetry | none |
| `/ai-birthday-cake-with-name` | `src/pages/AiBirthdayCakeWithName.tsx` | lazyWithRetry | none |
| `/complete-profile` | `src/pages/CompleteProfile.tsx` | lazyWithRetry | none |
| `/blog/unsubscribe` | `src/pages/BlogUnsubscribe.tsx` | lazyWithRetry | none |
| `/embed/gallery` | `src/components/EmbeddableGalleryWidget.tsx` (named export `EmbedGalleryPage`) | lazyWithRetry | none |
| `/party-planner` | `src/pages/PartyPlanner.tsx` | lazyWithRetry | none |
| `/party-planner/:id` | `src/pages/PartyPlannerDetail.tsx` | lazyWithRetry | `<ErrorBoundary component="PartyPlannerDetail">` wraps the element |
| `/rsvp/:token` | `src/pages/PartyRSVP.tsx` | lazyWithRetry | none |
| `/party/:slug` | `src/pages/PublicParty.tsx` | lazyWithRetry | none |
| `/cake/:id` | `src/pages/SharedCake.tsx` | lazyWithRetry | none |
| `/recipes` | `src/pages/Recipes.tsx` | lazyWithRetry | none |
| `/recipes/:slug` | `src/pages/RecipeDetail.tsx` | lazyWithRetry | none |
| `/dashboard` | — | — | `<Navigate to="/free-ai-cake-designer" replace />` (redirect only, no component) |
| `/wedding-cake-designer` | `src/pages/WeddingCakeDesigner.tsx` | lazyWithRetry | none |
| `/graduation-cake-ideas` | `src/pages/GraduationCakeDesigner.tsx` | lazyWithRetry | none |
| `/eid-cake-ideas` | `src/pages/EidCakeDesigner.tsx` | lazyWithRetry | none |
| `/photo-cake-maker` | `src/pages/PhotoCakeMaker.tsx` | lazyWithRetry | none |
| `/personalized-cake-online` | `src/pages/PersonalizedCakeOnline.tsx` | lazyWithRetry | none |
| `/birthday-cake-for/:name` | `src/pages/NamedCakePage.tsx` | lazyWithRetry | none |
| `/birthday-cake-theme/:theme` | `src/pages/ThemedCakePage.tsx` | lazyWithRetry | none |
| `/occasions` | `src/pages/Occasions.tsx` | lazyWithRetry | none |
| `/eggless-cake-design` | `src/pages/EgglessCakeDesign.tsx` | lazyWithRetry | none |
| `/rakhi-cake-ideas` | `src/pages/RakhiCakeIdeas.tsx` | lazyWithRetry | none |
| `/anniversary-cake-designer` | `src/pages/AnniversaryCakeDesigner.tsx` | lazyWithRetry | none |
| `*` (catch-all) | `src/pages/NotFound.tsx` | lazyWithRetry | none |

App-wide wrappers that apply to all routes (declared above `<Routes>`): a top-level `<ErrorBoundary>`, `QueryClientProvider`, `TooltipProvider`, `BrowserRouter`, `GeoProvider`, `ScrollToTop`, `CookieConsent` (suppressed on `/cake/*` paths), `GeoRedirectWrapper`, `AuthCountrySync`, plus `OrganizationSchema` and `WebSiteSchema`.

### 2.2 Access classification

Gating for the pages named in the task was verified by opening each component. Quoted mechanisms below are from the component `useEffect` auth-check blocks.

| Path | Class | Client-side gating mechanism (verified quote / note) | noindex |
|------|-------|------------------------------------------------------|---------|
| `/admin` | ADMIN-ONLY | `Admin.tsx`: `getUser()`; `if (!user) { navigate('/auth') }`; then queries `user_roles` for `.eq('role','admin')`, and `if (!roleData) { navigate('/') }`; renders `if (!isAdmin) return null;` | `noindex, nofollow` (line 1084) |
| `/admin/logo-generator` | ADMIN-ONLY | `AdminLogoGenerator.tsx`: `getUser()`; `if (!user) { navigate("/auth") }`; then `supabase.rpc("has_role", { _role: "admin", _user_id: user.id })`; navigate `/` if not admin; `if (!isAdmin) return null;` | unclear: no `noindex` found in file (grep matched none) |
| `/admin/blog-analytics` | ADMIN-ONLY | `AdminBlogAnalytics.tsx`: `getUser()`; `if (!user) { navigate('/auth') }`; then `user_roles` `.eq('role','admin')`, `if (!roleData) { navigate('/') }`; `if (!isAdmin)` returns null | `noindex, nofollow` (line 466) |
| `/settings` | AUTH-ONLY | `Settings.tsx`: `getSession()`; `if (!session) { navigate("/auth") }` (also re-checked on save/export/delete actions) | `noindex,nofollow` (line 301) |
| `/gallery` | AUTH-ONLY | `Gallery.tsx`: `getSession()`; `if (!session) { navigate("/auth") }` | `noindex, nofollow` (line 274) |
| `/occasions` | AUTH-ONLY | `Occasions.tsx`: `getUser()`; `if (!user) { navigate("/auth") }` | `noindex` (line 140) |
| `/complete-profile` | AUTH-ONLY | `CompleteProfile.tsx`: `getUser()`; `if (!user) { navigate("/auth") }`; also redirects to country home if profile already has country set | `noindex` (line 111) |
| `/auth` | PUBLIC (login page) | `Auth.tsx`: no gate blocking entry; instead redirects *away* if already signed in — `getSession().then(...)`: `if (session) { navigate(getPostLoginPath(...)) }` | `noindex, nofollow` (line 361) |
| `/party-planner` | PUBLIC + gated content | `PartyPlanner.tsx`: does NOT redirect unauthenticated users — `if (!user) { setLoading(false); setAuthChecked(true); return; }` renders a public SEO landing (`if (!user)` returns the landing markup at line 379); authenticated users get their party list | unclear: no `noindex` found in file |
| `/party-planner/:id` | AUTH-ONLY (data-gated) | `PartyPlannerDetail.tsx`: no explicit unauthenticated redirect; `loadAll()` queries the party and `if (!p) { navigate("/party-planner") }`. unclear: no client-side auth guard found — access to a specific party relies on Supabase RLS; only redirects when the row is not returned | `noindex` (via SEO/Helmet prop, line 1059) |
| `/cake/:id` | PUBLIC (shareable) | unclear: not opened in full; used for public cake sharing | `noindex, follow` (line 306) |
| `/rsvp/:token` | PUBLIC (token link) | unclear: not opened in full; token-based RSVP link | `noindex, nofollow` (line 161) |
| `/party/:slug` | PUBLIC (shareable) | unclear: not opened in full; public party page | `noindex, nofollow` (line 168) |
| `/blog/unsubscribe` | PUBLIC | unclear: not opened in full; email unsubscribe flow | `noindex, nofollow` (line 79) |
| `/birthday-cake-for/:name` | PUBLIC | `NamedCakePage.tsx` | conditional: `{!hasDeepMeaning && <meta ... "noindex, follow" />}` (line 99) — noindex only when `hasDeepMeaning` is false |
| `*` (NotFound) | PUBLIC | — | `noindex, follow` (line 17) |

All other routes in the table (`/`, marketing/landing pages, `/blog`, `/pricing`, `/community`, cake-designer SEO pages, etc.) have no client-side auth gate and no `noindex` — classified PUBLIC and indexable.

### 2.3 noindex inventory (from `grep -rn "noindex" src/pages/`)

Files containing a `noindex` robots directive: `Settings.tsx`, `SharedCake.tsx`, `Gallery.tsx`, `Auth.tsx`, `AdminBlogAnalytics.tsx`, `Occasions.tsx`, `PartyRSVP.tsx`, `BlogUnsubscribe.tsx`, `NamedCakePage.tsx` (conditional), `PartyPlannerDetail.tsx` (Helmet `noindex` prop), `CompleteProfile.tsx`, `Admin.tsx`, `PublicParty.tsx`, `NotFound.tsx`. Note: `AdminLogoGenerator.tsx` is admin-gated but the grep found NO `noindex` in it — unclear whether it inherits a default elsewhere.

### 2.4 Summary

- 3 routes are ADMIN-ONLY (`/admin`, `/admin/logo-generator`, `/admin/blog-analytics`) and 4 are AUTH-ONLY (`/settings`, `/gallery`, `/occasions`, `/complete-profile`); `/party-planner/:id` is effectively auth/RLS-gated at the data layer. Everything else is PUBLIC.
- There is no shared route-guard component. Each gated page enforces access itself inside a `useEffect`: an unauthenticated `getUser()`/`getSession()` triggers `navigate('/auth')`; admin pages additionally verify the `admin` role via a `user_roles` query or the `has_role` RPC and `navigate('/')` on failure, rendering `null` until the check passes.
- `/party-planner/:id` has no client-side auth guard — it only redirects when the party row is absent, so per-party access relies on Supabase RLS (flagged as unclear above).
- 14 page files carry a `noindex` directive; `AdminLogoGenerator.tsx` is admin-gated yet has no `noindex` found (flagged unclear).
## 3a. Pages Inventory (part 1: About–Index)

Scope: 24 page files in `src/pages/`, About.tsx → Index.tsx. FACTUAL survey. All components are default exports and take **no props** (route pages) unless noted.

Recurring pattern used by the SEO occasion/tool pages (Anniversary, Eggless, Eid, Graduation, AiBirthday, AiCakeGeneratorFree): `useEffect` checks `supabase.auth.getUser()` → sets `isLoggedIn` / `isPremium` / `authChecked`, then renders `{authChecked && <ExitIntentModal isLoggedIn isPremium country="US" />}`. These read `is_premium` only to configure the exit-intent modal — they do NOT gate page content. Several also fetch `public_featured_images` filtered by `featured_pages` with a hardcoded fallback image array.

---

### About.tsx
- One line: Static marketing "about the platform" page (feature cards + how-it-works steps).
- Props: no props.
- Primary CTA: `<Link to="/">` wrapping a `<Button>` — text "Alright, Let's Make a Cake". Anchor navigation to home.
- Responsive gating: none (only responsive text sizing `md:`).
- Conditional mount: none.

### Admin.tsx
- One line: Admin dashboard — user management, analytics (recharts), page-visit stats, community moderation, blog subscribers, settings; grant/remove premium, feature images, send nudge emails. (1956 lines; read to 1436 + verified access guard.)
- Props: no props. Local state only.
- Primary CTA: page is action-dense; header buttons are `<Button>` "Blog Analytics" (`navigate('/admin/blog-analytics')`) and "Back to Home" (`navigate('/')`). No single hero CTA.
- Responsive gating: `TabsList className="flex-wrap"`; grids use `md:grid-cols-*` — layout only, no hidden content.
- Conditional mount: **admin-only**. `checkAdminAccess()` on mount: no user → toast + `navigate('/auth')`; not admin (`user_roles` role='admin' via `.maybeSingle()`) → toast + `navigate('/')`. Renders loading spinner while checking; `if (!isAdmin) return null;`.

### AdminBlogAnalytics.tsx
- One line: Blog analytics + AI-post management — views/subscribers charts, referrer breakdown, pending-post review/publish/delete, manual article generation.
- Props: no props.
- Primary CTA: header `<Button>`s "Send Digest" (`send-weekly-blog-digest`) and "Generate Post" (`generate-blog-post`). Top-post links are `<a href={/blog/${postId}} target="_blank">`.
- Responsive gating: grids `md:`/`lg:` only.
- Conditional mount: **admin-only**, same guard as Admin.tsx (`user_roles`). Loading spinner; `if (!isAdmin) return null;`.

### AdminLogoGenerator.tsx
- One line: Admin tool to generate/preview/download 5 logo variations via `generate-logo` edge function.
- Props: no props.
- Primary CTA: per-card `<Button>` "Generate"/"Regenerate" (calls `generateLogo`); "Back to Admin" ghost button `navigate('/admin')`.
- Responsive gating: grid `md:`/`lg:` only.
- Conditional mount: **admin-only** via `supabase.rpc("has_role", {_role:"admin"})` — differs from the other two admin pages (which query `user_roles` directly). No user → `navigate('/auth')`; not admin → toast + `navigate('/')`. `if (!isAdmin) return null;`.

### Advertising.tsx
- One line: Static advertising-disclosure legal page (AdSense/COPPA/affiliate cards).
- Props: no props.
- Primary CTA: bottom row of three `<Link>`s — "Privacy Policy" (`/privacy`), "Terms of Service" (`/terms`), "Back to Home" (`/`). Anchors.
- Responsive gating: `flex-col sm:flex-row` only.
- Conditional mount: none.

### AiBirthdayCakeWithName.tsx
- One line: SEO landing for "AI birthday cake with a name" (AEO answer box, sample grid, FAQ, CTA).
- Props: no props.
- Primary CTA: hero `<Button>` "Make a Birthday Cake with a Name →" → `navigate("/")`; final CTA `<Button>` "Design the Cake →" → `navigate("/")`. Buttons (JS nav), not anchors. Note: primary CTA routes to `/` (home), not the cake-designer route.
- Responsive gating: `sm:`/`md:`/`lg:` sizing only.
- Conditional mount: `{authChecked && <ExitIntentModal .../>}` (premium read only feeds the modal; content not gated).

### AiCakeGeneratorFree.tsx
- One line: SEO landing for "free AI cake generator" (answer box, sample grid, how-to steps, why-choose, FAQ).
- Props: no props.
- Primary CTA: hero `<Button>` "Design Your Free AI Cake →" → `navigate("/")`; final "Design My Free AI Cake →" → `navigate("/")`. Buttons. Again routes to `/`, not `/free-ai-cake-designer`.
- Responsive gating: sizing only.
- Conditional mount: `{authChecked && <ExitIntentModal/>}` (modal config only).

### AnniversaryCakeDesigner.tsx
- One line: SEO landing for anniversary cakes; fetches `public_featured_images` (`featured_pages cs {"anniversary"}`) with `ANNIVERSARY_FALLBACK` Unsplash images.
- Props: no props. **Default that can silently no-op:** `featuredCakes` defaults to `ANNIVERSARY_FALLBACK`; DB replaces only if `data.length >= 3`, so a 1–2 result set silently keeps fallback stock images.
- Primary CTA: hero `<Button>` "Design My Anniversary Cake →" → `navigate("/free-ai-cake-designer?occasion=anniversary")`; final CTA same target. Buttons.
- Responsive gating: sizing/grid only.
- Conditional mount: `{authChecked && <ExitIntentModal/>}` (config only).

### AustraliaLanding.tsx
- One line: Australia country landing (hero, testimonials, celebrations, featured carousel + zoom/download dialog, pricing in AUD, recipes/blog feeds). `usePageTracking('/australia','AU')`.
- Props: no props.
- Primary CTA: hero `<Button>` "See Plans →" → `document.getElementById('plans').scrollIntoView` (scroll, not nav). Final section CTA is `<Link to="/free-ai-cake-designer">` "Create Your Cake Now" (anchor). Occasion cards are `<Link>`s.
- Responsive gating: grids `md:`; **`<StickyMobileCTA/>` mounted** (mobile-only sticky CTA component). Hero image `h-auto md:h-[600px]`.
- Conditional mount: `<ExitIntentModal isLoggedIn={false} isPremium={false} country="AU" />` (hardcoded false — always guest-mode modal). `<PricingPlans country="AU" />`, `UrgencyBanner countryCode="AU"`, recipes/blog `countryCode="AU"` — **geo-hardcoded to AU** (not detected).

### Auth.tsx
- One line: Login / signup / forgot-password / reset-password auth screen (email + Google OAuth); handles referral bonus on signup, Brevo contact add, geo-defaulted country, post-login redirect.
- Props: no props. Heavy local state; `<meta robots="noindex,nofollow">`.
- Primary CTA: submit `<Button>` (text "Log In" / "Sign Up" / "Send Reset Link" / "Set New Password" by mode); plus Google `<Button>` "Continue with Google". Mode toggles are `<button>`s. Logo/back use `<Link>`/`<button>`.
- Responsive gating: `grid-cols-2` for name fields only.
- Conditional mount: form fields conditional on mode (`isLogin`/`isForgotPassword`/`isResetMode`) — signup-only shows name/country/age-consent. If already-logged-in session found (and not reset mode) → `navigate(getPostLoginPath())` away. Post-login path: profile has country → `/free-ai-cake-designer`, else `/complete-profile`.

### Blog.tsx
- One line: Blog index — merges DB posts (`blog_posts` where published) with a large hardcoded `blogPosts` array (dedup by slug), popular-this-week (by view counts), newsletter signup, in-grid AdSlots.
- Props: no props.
- Primary CTA: post cards are `<Link to={/blog/${post.id}}>`; newsletter `<Button>` "Subscribe" (`handleSubscribe` → upsert `blog_subscribers`). No hero button.
- Responsive gating: grids `md:`/`lg:`, `flex-col sm:flex-row` only.
- Conditional mount: `AdSlot` inserted after every 6 posts; "N AI-generated" badge only if `dbPosts.length > 0`; subscribe pulls logged-in user's name if a session exists (not required).
- Note: `allPosts.map` returns a bare `<>` fragment without a `key` per iteration (keys on inner `<Link>`/ad only) — potential React key warning.

### BlogPost.tsx
- One line: Individual blog article renderer — resolves slug from DB (`blog_posts`) or hardcoded `blogPostsContent`, sanitizes HTML via DOMPurify, ads, social share, reading progress, exit-intent. (2355 lines; read to 955 — mostly hardcoded content data.)
- Props: no props; reads `useParams` slug. Imports `Navigate` (redirect on missing post).
- Primary CTA: `BlogCTABox` component + `<Link>` back-nav (`ArrowLeft`/`Home`); article body is sanitized HTML.
- Responsive gating: not fully verified in read window; sidebar ad component present.
- Conditional mount: unknown-slug handling via `Navigate` (redirect) — unclear: exact fallback target not confirmed in read portion. `useBlogViewTracking` records a view.

### BlogUnsubscribe.tsx
- One line: Token-based email-unsubscribe flow (digest-only vs all) via `unsubscribe-blog` edge function; status card.
- Props: no props; reads `?token=` from `useSearchParams`.
- Primary CTA: two `<Button>`s — "Stop Weekly Digest Only" (outline) and "Unsubscribe from All Emails" (destructive), calling `handleUnsubscribe`. Success/error state shows `<Link to="/blog">` back button.
- Responsive gating: none. `<meta robots="noindex,nofollow">`.
- Conditional mount: whole card body is status-driven (`loading`/`ready`/`processing`/`success`/`error`); action buttons only render when `status==='ready' && maskedEmail`. No token → error state.

### CanadaLanding.tsx
- One line: Canada country landing — structurally mirrors AustraliaLanding (hero, carousel, pricing CAD, recipes/blog). `usePageTracking('/canada','CA')`.
- Props: no props.
- Primary CTA: hero `<Button>` "See Plans →" → scroll to `#plans` (not nav). Final CTA `<Link to="/free-ai-cake-designer">` "Create Your Cake Now" (anchor). Occasion cards `<Link>`.
- Responsive gating: grids `md:`; **`<StickyMobileCTA/>` mounted**.
- Conditional mount: geo-hardcoded to CA (`PricingPlans`/`UrgencyBanner countryCode="CA"`, recipes/blog CA); `ExitIntentModal` present. (Verified via grep, not full read.)

### CommunityGallery.tsx
- One line: Public gallery of featured community cakes (`public_featured_images`, limit 50) with like/comment (`useGalleryInteractions`), download, image modal, "Create Similar".
- Props: no props.
- Primary CTA: per-image download `<button>`/`<Button>`; modal "Create Similar" `<Button>` → `navigate('/#creator')`; empty-state "Be the First to Create" → `navigate('/#creator')`. Buttons.
- Responsive gating: grid `md:`/`lg:`/`xl:` only.
- Conditional mount: loading / empty states; likes reflect `userLikes` (auth-aware via hook — `isAuthenticated`/`currentUserId` gate comment posting, not page view).

### CompleteProfile.tsx
- One line: Post-OAuth "select your country" completion screen; saves `country` to `profiles`, then redirects to country home with welcome flag.
- Props: no props. `<meta robots="noindex">`.
- Primary CTA: `<Button>` "Complete Profile" (`handleComplete`, disabled until country chosen). Logo is `<Link to="/">`.
- Responsive gating: none.
- Conditional mount: **logged-in-only**. On mount: no user → `navigate('/auth')`; if profile already has country → `navigate(getCountryHomePath())` (skip). Shows spinner while `checkingProfile`.

### Contact.tsx
- One line: Contact page with info cards + a message form.
- Props: no props. **Default that silently no-ops:** `handleSubmit` only shows a success toast and clears the form — there is a code comment "you would typically send the form data to your backend"; **the form does NOT actually send anything** (no network call). Silent no-op by design.
- Primary CTA: form submit `<Button>` "Send Message" (no-op submit). FAQ/inline links are `<Link>`s.
- Responsive gating: grid `md:grid-cols-2` only.
- Conditional mount: none.

### EgglessCakeDesign.tsx
- One line: SEO landing for eggless cakes; fetches `public_featured_images` (`{"eggless"}`) with `EGGLESS_FALLBACK`.
- Props: no props. Same `>= 3` fallback no-op caveat as Anniversary.
- Primary CTA: hero + final `<Button>` → `navigate("/free-ai-cake-designer?occasion=birthday")` (note: occasion=**birthday**, not "eggless"); secondary "See real examples" → `/community`. Buttons.
- Responsive gating: sizing only.
- Conditional mount: `{authChecked && <ExitIntentModal/>}` (config only).

### EidCakeDesigner.tsx
- One line: SEO landing for Eid cakes; fetches `public_featured_images` (`{"eid"}`) with `EID_FALLBACK`.
- Props: no props. Same `>= 3` fallback caveat.
- Primary CTA: hero + final `<Button>` → `navigate("/free-ai-cake-designer?occasion=eid")`; secondary → `/community`. Buttons.
- Responsive gating: sizing only.
- Conditional mount: `{authChecked && <ExitIntentModal/>}` (config only).

### FAQ.tsx
- One line: FAQ accordion with geo-aware pricing strings (`PRICING_LOOKUP` by region resolved from path/`?country`/detected).
- Props: no props.
- Primary CTA: no hero button; primary interactive elements are `<AccordionTrigger>`s and an inline `<Link to="/contact">` "Hit us up". (Verified header + grep; a bottom CTA may exist further down but the load-bearing intro CTA is the contact anchor.)
- Responsive gating: not observed in read window (sizing only).
- Conditional mount: pricing text varies by resolved region (IN/GB/CA/AU/US) — content-level geo, not mount gating.

### FreeCakeDesigner.tsx
- One line: The actual cake-creator page — lazy-loads `<CakeCreator>` inside `ErrorBoundary`/`Suspense`; welcome modal, first-time banner, post-generation upsell + referral-link card. `FREE_TOTAL_LIMIT = 5`.
- Props: no props (page). Passes `onGenerate` to CakeCreator.
- Primary CTA: the embedded `<CakeCreator>` is the real tool. Page-level CTA `<Button>` "Start Designing for Free" → scrolls to `#creator`. Post-generation buttons `navigate('/pricing')`, `/party-planner`. Buttons.
- Responsive gating: grids/`flex-col sm:flex-row` only.
- Conditional mount: post-generate block (`cakeGenerated`) branches on `isPremium` (party-planner upsell) vs free (upgrade + referral card, referral card requires `currentUserId`). Welcome modal only if `?welcome=true` and not already shown (localStorage). Start banner only if logged-in + not dismissed. Marketing sections hidden once `cakeGenerated`.

### Gallery.tsx
- One line: Logged-in user's saved cakes ("My Gallery", max 20) — upcoming-occasions section, feature-on-homepage toggle, download, social share dropdown, delete, and Party Pack mode/generator. `<meta robots="noindex,nofollow">`.
- Props: no props.
- Primary CTA: many per-card `<Button>`s (feature star / download / share / delete); "Party Pack" toggle button; empty-state "Create Your First Cake" → `navigate("/")`. Floating "Create Party Pack for ..." `<Button>` when a cake selected. Buttons.
- Responsive gating: grids `md:`/`lg:`; floating FAB `fixed bottom-8`.
- Conditional mount: **logged-in-only** — `useRequireCountry()` hook + `checkUser()`: no session → `navigate('/auth')`. Shows spinner while `loading || isCheckingCountry`. Party Pack banner/FAB gated on `partyPackMode` / `selectedCakeForPartyPack`.

### GraduationCakeDesigner.tsx
- One line: SEO landing for graduation cakes; fetches `public_featured_images` (`{"graduation"}`) with `GRADUATION_FALLBACK`.
- Props: no props. Same `>= 3` fallback caveat.
- Primary CTA: hero + final `<Button>` → `navigate("/free-ai-cake-designer?occasion=graduation")`; secondary → `/community`. Buttons.
- Responsive gating: sizing only.
- Conditional mount: `{authChecked && <ExitIntentModal/>}` (config only).

### HowItWorks.tsx
- One line: Static "how to design a cake with AI" explainer (steps, HowTo/FAQ schema, AEO blocks).
- Props: no props.
- Primary CTA: bottom `<Link to="/">` wrapping `<Button size="lg">` (anchor to home). (~800 lines; header + CTA verified via read/grep.)
- Responsive gating: unclear beyond sizing (not fully read).
- Conditional mount: none apparent (static content).

### Index.tsx
- One line: Homepage — hero, embedded lazy `<CakeCreator>`, feature/pricing/testimonial sections, full nav header + mobile Sheet menu, exit-intent modal. `usePageTracking('/','US')`. (1223 lines.)
- Props: no props. State incl. `isLoggedIn`, `isAdmin`, `isPremium`, `hasGeneratedCake`, `detectedCountry` (from geo).
- Primary CTA: hero `<Button size="lg">` "Design Your Cake Free →" → `navigate('/free-ai-cake-designer?ref=home_hero')` (button, JS nav). Multiple secondary CTAs (`/community`, `/pricing?country=US`, `/party-planner`). Logo/nav items are `<Link>`s.
- Responsive gating: desktop nav `hidden md:flex` (line 347); several nav links `hidden lg:inline-flex` (Examples/Community/FAQ/Settings); mobile hamburger `SheetTrigger className="md:hidden"` (line 380) → Sheet menu; a demo/example card block is `hidden md:block` (line 1111) — **desktop-only content**.
- Conditional mount: **admin-gated** Admin nav buttons (`isAdmin`, desktop + mobile); logged-in-only "My Gallery"/"Settings"/gallery buttons; Sign In shown when not logged in. `ExitIntentModal` props include `isPremiumInactive={isPremium && !hasGeneratedCake}` and `country={detectedCountry || 'US'}` (geo-aware, defaults US). Pricing links hardcode `?country=US`.

---

### Mobile-only in this set
- **AustraliaLanding.tsx** — mounts `<StickyMobileCTA/>` (sticky CTA that renders on mobile).
- **CanadaLanding.tsx** — mounts `<StickyMobileCTA/>`.
- **Index.tsx** — mobile hamburger Sheet menu via `SheetTrigger className="md:hidden"` (the mobile nav is mobile-only). (Conversely, the `hidden md:block` demo card at line 1111 and `hidden md:flex` nav are desktop-only.)

(No other files in this set contain `md:hidden` / `useIsMobile` mobile-only rendering; the rest use `md:`/`lg:` only for responsive layout.)

### Primary-CTA-is-anchor in this set
Primary CTA is an `<a>`/`<Link>` (vs `<button>`/JS `navigate`):
- **About.tsx** — `<Link to="/">` "Alright, Let's Make a Cake".
- **Advertising.tsx** — `<Link>` trio (Privacy / Terms / Home).
- **AustraliaLanding.tsx** — final CTA `<Link to="/free-ai-cake-designer">` "Create Your Cake Now" (hero "See Plans" is a scroll button).
- **CanadaLanding.tsx** — final CTA `<Link to="/free-ai-cake-designer">` "Create Your Cake Now".
- **Blog.tsx** — primary interactive elements are post `<Link>`s (newsletter Subscribe is a button).
- **BlogUnsubscribe.tsx** — action buttons are `<Button>`, but success/ready fallbacks are `<Link to="/blog">`.
- **Contact.tsx** — inline `<Link to="/faq">`/`/contact` (the "Send Message" submit button is a no-op).
- **FAQ.tsx** — inline `<Link to="/contact">` "Hit us up" (no hero button).
- **HowItWorks.tsx** — bottom `<Link to="/">` wrapping the CTA button.

Button/JS-navigate primary CTAs (for contrast): AiBirthdayCakeWithName, AiCakeGeneratorFree, AnniversaryCakeDesigner, EgglessCakeDesign, EidCakeDesigner, GraduationCakeDesigner, FreeCakeDesigner, CommunityGallery, Gallery, Auth, CompleteProfile, Index, and the admin pages.

---

**Summary (3 lines):**
All 24 are prop-less default-export route pages; content-gating comes from auth/geo state, not props. Real conditional mounts: **admin-only** (Admin, AdminBlogAnalytics, AdminLogoGenerator), **logged-in-only** (Gallery, CompleteProfile, + Auth's already-signed-in redirect), and **geo-hardcoded** country landings (Australia=AU, Canada=CA); the SEO occasion/tool pages read `is_premium` only to configure `ExitIntentModal`. Two silent no-ops to flag: **Contact.tsx**'s form never sends (toast only), and the occasion pages' featured-image fetch only overrides fallback stock images when `data.length >= 3`. Mobile-specific rendering exists only in the two country landings (`StickyMobileCTA`) and Index (`md:hidden` Sheet menu); primary CTAs are anchors in the static/legal/blog pages and JS-`navigate` buttons in the interactive tool/landing pages.
## 3b. Pages Inventory (part 2: IndiaLanding–WeddingCakeDesigner)

### IndiaLanding.tsx
- Geo landing page for India: hero, celebrations grid, occasion sections, testimonials carousel, INR pricing, featured-cakes carousel with zoom/download modal.
- Props: no props. Calls `usePageTracking('/india', 'IN')`.
- Primary CTA: `<Button>` "🎂 Create Your Free Cake →" → `navigate('/free-ai-cake-designer?ref=india')`. (Bottom CTA is a `<Link>` to `/free-ai-cake-designer`; occasion cards are `<Link>`s.)
- Responsive gating: many `md:` grid/height utilities; no `useIsMobile`, no `md:hidden`/`hidden md:block` full-element toggles. `StickyMobileCTA` component handles mobile-only CTA internally.
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={false} isPremium={false} country="IN" />}` — hardcodes logged-out/non-premium regardless of actual auth (auth result is discarded, only `authChecked` flag set). Featured carousel falls back to bundled images when Supabase returns none.

### NamedCakePage.tsx
- Dynamic SEO page for a birthday cake with a specific name (`/birthday-cake-for/:name`): name meaning, curated themes, sample gallery, 30+ messages, expert tips, FAQ.
- Props: no props (reads `useParams` `name`). If slug not found in `CAKE_NAMES` → `<Navigate to="/ai-birthday-cake-with-name" replace />`.
- Primary CTA: `<Link>` wrapping `<Button>` "Design {name}'s Cake Free →" → `/free-ai-cake-designer?name=...`.
- Responsive gating: `md:`/`sm:`/`lg:` grid utilities only. No mobile-specific mounting.
- Conditional mount: renders `<meta robots noindex,follow>` only when `!hasDeepMeaning` (names without a deep meaning entry are noindexed). No auth/premium gating.

### NotFound.tsx
- 404 page; logs the bad path to console, shows four navigation links.
- Props: no props.
- Primary CTA: `<Link>` "AI Cake Designer" → `/` (plus Cake Gallery→`/community`, Pricing→`/pricing`, Blog→`/blog`).
- Responsive gating: `md:` text size only.
- Conditional mount: none. Sets `robots noindex, follow`.

### Occasions.tsx
- Logged-in occasions manager (`/occasions`): list saved occasions with countdown, add/delete form, one-click "Design cake" per occasion. Reads/writes `user_occasions` table.
- Props: no props.
- Primary CTA: header `<Button>` "Add Occasion" (toggles form); per-row `<Button>` "Design cake →" → `/free-ai-cake-designer?name=...&occasion=...`.
- Responsive gating: `sm:grid-cols-2` on form only. No mobile-only rendering.
- Conditional mount: requires auth — `useEffect` redirects to `/auth` if no user. Empty-state vs list rendered conditionally. `robots noindex`.

### PartyPlanner.tsx
- Multi-mode page (`/party-planner`): public SEO landing for logged-out; premium-gate/upsell for non-premium; parties dashboard (list + create dialog) for premium. Reads `profiles` (is_premium/lifetime_access) + `parties`.
- Props: no props. Default component export.
- Primary CTA (varies by mode): logged-out SEO uses `<Link to="/auth?redirect=/party-planner">` "Start planning free"; premium-gate uses `<Button>`→`navigate("/pricing")`; dashboard uses `<Button>` "New Party" (DialogTrigger) then `handleCreate` inserts row + navigates to `/party-planner/:id`.
- Responsive gating: `sm:`/`lg:` grids only. No mobile-only toggles.
- Conditional mount: three-way branch on `!user` / `!isPremium` / premium. `{authChecked && <ExitIntentModal isLoggedIn={!!user} isPremium={isPremium} country="US" />}` (dashboard mode only; country hardcoded "US"). Prefill-from-URL auto-opens create dialog.

### PartyPlannerDetail.tsx
- Private party dashboard (`/party-planner/:id`): tabs for Details, Concierge chat, Checklist, Budget, Invite, Guests, Vendors. Heavy client logic — theme matching, AI invite/artwork generation, realtime RSVP updates, vendor emailing. (~1975 lines; surveyed first ~1280 + key handlers.)
- Props: no props (reads `useParams` `id`). Default export.
- Primary CTA: multiple. Details tab: `<Button>` "Save details" + "Generate plan now" (→ chat tab, calls `generatePlanNow`). Guests tab drives `send-party-invite` edge fn. If party not found in `loadAll` → `navigate("/party-planner")`.
- Responsive gating: `TabsList` uses `grid-cols-3 sm:grid-cols-6`; `sm:` grids throughout. No `useIsMobile`/mobile-only mount.
- Conditional mount: loads `isPremium` from `profiles` (`prof?.is_premium ?? false`) — DEFAULT false; note it uses `is_premium` only, not `lifetime_access`, so lifetime users could read as non-premium here. Realtime channel subscribed per `id`. Auto-generates hero artwork when stale/missing.
- SEO: `<PageSeo ... noindex>`.

### PartyRSVP.tsx
- Guest-facing RSVP page (`/party-rsvp/:token` via token): shows event details, plus-ones counter, meal pref, custom questions, Yes/Maybe/No. Uses `get_guest_by_token` + `rsvp_by_token` RPCs.
- Props: no props (reads `useParams` `token`). Default export.
- Primary CTA: three `<Button>`s "Yes"/"Maybe"/"No" → `respond(status)` RPC. When done, "Add to calendar" + external `<a>` to `/party/{public_slug}`.
- Responsive gating: none beyond fixed `max-w-md`. No mobile-only rendering.
- Conditional mount: `done` (already responded) vs form. Guest/party not found → "Invitation not found" card. `robots noindex, nofollow`.

### PersonalizedCakeOnline.tsx
- SEO tool landing (`/personalized-cake-online`): hero, sample gallery (Supabase featured or Unsplash fallback), how-it-works, why-choose, FAQ, CTA.
- Props: no props.
- Primary CTA: `<Button>` "Personalise My Cake →" → `navigate("/free-ai-cake-designer?ref=personalized")`.
- Responsive gating: `md:`/`sm:`/`lg:` grid utilities only.
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}` (real auth/premium read here, country hardcoded "US"). Gallery falls back to `PERSONALIZED_FALLBACK` Unsplash images if `<3` DB rows.

### PhotoCakeMaker.tsx
- SEO tool landing (`/photo-cake-maker`): near-identical structure to PersonalizedCakeOnline — hero, gallery, how-to, why-choose, FAQ, CTA. Photo-cake copy.
- Props: no props.
- Primary CTA: `<Button>` "Make My Photo Cake →" → `navigate("/free-ai-cake-designer?occasion=birthday&ref=photo-cake")`.
- Responsive gating: `md:`/`sm:`/`lg:` grid only.
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}` (country hardcoded "US"). Gallery Unsplash fallback if `<3` DB rows.

### Pricing.tsx
- Pricing page (`/pricing`): trust hero + rating + testimonials, `<PricingPlans>` with geo-resolved currency, trust footer, FAQ accordion.
- Props: no props. Calls `useRequireCountry()`, reads `GeoContext`.
- Primary CTA: pricing action lives inside `<PricingPlans>` (not in this file). Own interactive elements: limit-banner dismiss `<button>`, FAQ accordion.
- Responsive gating: `md:` grids; `text-xs md:text-sm` in trust footer. `StickyMobileCTA` component (mobile-only internally).
- Conditional mount: `showLimitBanner` shown when URL `?reason=limit_reached`. `userCountry` resolved via `resolveRegion(pathname/urlCountry/detectedCountry/profileCountry)` → passed to `PricingPlans`. `<ExitIntentModal isLoggedIn={false} isPremium={false}/>` hardcoded logged-out (no `authChecked` guard — always mounts).

### Privacy.tsx
- Static privacy policy (`/privacy`): GDPR sections, cookie table, third-party processors, data rights. All hardcoded content.
- Props: no props.
- Primary CTA: bottom `<Link to="/">` wrapping `<Button>` "Back to Creating Cakes". Inline `<Link to="/settings">` and mailto/external `<a>` links throughout.
- Responsive gating: `md:text-7xl` heading, `overflow-x-auto` table. No mobile-only mount.
- Conditional mount: none. "Last Updated: January 2025" is hardcoded.

### PublicParty.tsx
- Public shareable invite page (`/party/:slug`): hero (artwork or fallback), countdown, personal note, details, host contact, who's-coming list, add-to-calendar + share. Uses `get_party_public` RPC.
- Props: no props (reads `useParams` `slug`); inner `CountdownBox` takes `targetDate: Date`.
- Primary CTA: `<Button>` "Add to calendar" (`downloadICS`) + `<Button>` "Share invite" (`navigator.share`/clipboard). Maps link is external `<a>`.
- Responsive gating: `sm:` sizing throughout; countdown cells `sm:text-3xl`. No mobile-only mount.
- Conditional mount: artwork-present vs fallback hero; sections gated on data presence (message, venue, contact, attending_count). Not-found state. `robots noindex, nofollow`.

### RakhiCakeIdeas.tsx
- SEO seasonal tool landing (`/rakhi-cake-ideas`): Raksha Bandhan hero (dated 28 Aug 2026), gallery, how-to, 6 idea cards, FAQ, CTA.
- Props: no props.
- Primary CTA: `<Button>` "Design My Rakhi Cake →" → `navigate("/free-ai-cake-designer?occasion=rakhi")`.
- Responsive gating: `md:`/`sm:`/`lg:` grid only.
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}` (country hardcoded "US"). Gallery `RAKHI_FALLBACK` Unsplash if `<3` DB rows.

### RecipeDetail.tsx
- Dynamic recipe page (`/recipes/:slug`): hero image, prep/cook meta, story, ingredients, method, "design this cake" CTA. Reads `cake_recipes` (published only).
- Props: no props (reads `useParams` `slug`).
- Primary CTA: `<button>` "🎂 Design This Cake with AI →" → `navigate('/free-ai-cake-designer?prompt=...&ref=recipe')`. Also top `<Link>` "Generate a free AI design..." and "Design any custom cake" `<Link>`.
- Responsive gating: `md:text-5xl` heading, `flex-wrap` meta. No mobile-only mount.
- Conditional mount: loading state; recipe-not-found state (with "Browse recipes" link). Sections gated on field presence. No auth gating.

### Recipes.tsx
- Recipes hub (`/recipes`, optional `?country=`): country filter buttons, AI-designer promo banner, recipe grid. Reads `cake_recipes` (published).
- Props: no props (reads `useSearchParams` `country`).
- Primary CTA: promo `<Link>` "Try AI Cake Designer →" → `/free-ai-cake-designer?ref=recipes_hub`. Filter `<button>`s set `?country=`; recipe cards are `<Link>`s.
- Responsive gating: `sm:`/`lg:` grid; `flex-col md:flex-row` promo banner. No mobile-only mount.
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}` (country hardcoded "US"). Loading / empty / grid states.

### Settings.tsx
- Logged-in settings (`/settings`): read-only country display, 6 notification toggles, GDPR export/delete-account. Reads/writes `user_settings`, `profiles`, `blog_subscribers`; delete via `delete-user-account` edge fn.
- Props: no props. Calls `useRequireCountry()`.
- Primary CTA: `<Button>` "Save Settings" (`handleSave` upsert). Also "Export" (JSON download) and destructive "Delete" (AlertDialog → `handleDeleteAccount`).
- Responsive gating: `max-w-2xl` container; no mobile-only mount.
- Conditional mount: requires auth — redirects to `/auth` when no session (in load + each handler). Settings defaults: all 6 toggles DEFAULT `true` (`?? true`) — a null/missing DB value silently reads as opted-IN. `robots noindex,nofollow`.

### SharedCake.tsx
- Recipient-facing animated shared-cake reveal (`/cake/:id`): tap-to-open splash (unlocks audio), staged reveal, candles/confetti, voice-message player, email capture, share, CTA. Uses `get_public_cake` RPC + jingle util.
- Props: no props (reads `useParams` `id`). Default export.
- Primary CTA: `<Link to={ctaHref}>` wrapping `<Button>` "🎂 Make a cake for someone you love →" (`ctaHref` = `/free-ai-cake-designer?ref=shared_cake`). Splash is a `<motion.button>` `handleOpen`.
- Responsive gating: `sm:hidden` sticky-bottom CTA bar is MOBILE-ONLY; desktop CTA hidden on mobile via `pb-24 sm:pb-8` spacing. `sm:` sizing throughout.
- Conditional mount: loading / not-found states; email-capture shown unless localStorage flag set and only at `revealStage>=4`; voice player only if `cake.audio_url`. Splash only until `opened`. `robots noindex, follow`.

### Terms.tsx
- Static terms of service (`/terms`): 12 numbered sections, hardcoded.
- Props: no props.
- Primary CTA: none prominent (no bottom CTA button). Header logo/nav via `SiteHeader`; contact is plain text email.
- Responsive gating: none beyond container width. No mobile-only mount.
- Conditional mount: none. "Last updated: January 2025" hardcoded.

### ThemedCakePage.tsx
- Dynamic SEO page for a cake theme (`/birthday-cake-theme/:theme`): story, sample gallery, expert checklist, mistakes, message ideas, features, how-to, FAQ. Reads `CAKE_THEMES` + `THEME_DEEP`.
- Props: no props (reads `useParams` `theme`). If slug not found → `<Navigate to="/free-ai-cake-designer" replace />`.
- Primary CTA: `<Link>` wrapping `<Button>` "Design {title} Cake Free →" → `/free-ai-cake-designer?theme=...`.
- Responsive gating: `md:`/`sm:` grids. No mobile-only mount.
- Conditional mount: deep-content sections (story, checklist, mistakes, messages) only render when `deep` (THEME_DEEP entry) exists. No auth gating; no noindex.

### ThreeDCakeDesigner.tsx
- SEO tool landing (`/3d-cake-designer`): hero, sample gallery (bundled assets), differentiators, definition, how-to, ideas grid, comparison table, related tools, FAQ, CTA.
- Props: no props.
- Primary CTA: `<Button>` "Design Your 3D Cake Free →" → `navigate("/")` (note: goes to home, not `/free-ai-cake-designer`). Related-tools cards are `<Link>`s.
- Responsive gating: `md:`/`lg:` grids only. FAQ answer explicitly claims mobile support but no mobile-only mount in code.
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}` (country hardcoded "US"). Gallery uses static bundled `featuredCake1-5` (no Supabase fetch).

### UKLanding.tsx
- Geo landing page for UK: mirrors IndiaLanding structure — hero, British celebrations grid, occasion sections, how-it-works, testimonials, GBP pricing, featured carousel + zoom/download modal.
- Props: no props. Calls `usePageTracking('/uk', 'UK')`.
- Primary CTA: hero `<Button>` "See Plans →" scrolls to `#plans` (NOT a designer link — note the hero CTA no-ops to a scroll, unlike India which navigates to the designer). Bottom `<Link>` "Create Your Cake Now" → `/free-ai-cake-designer`.
- Responsive gating: `md:` grid/height utilities. `StickyMobileCTA` (mobile-only internally). No `md:hidden`.
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={false} isPremium={false} country="GB" />}` — hardcodes logged-out/non-premium (auth result discarded). Carousel bundled-image fallback.

### USALanding.tsx
- Geo landing page for USA: mirrors UK/India — hero, American celebrations grid, occasion cards, featured carousel + modal, party-pack, testimonials, USD pricing.
- Props: no props. Calls `usePageTracking('/usa', 'US')`.
- Primary CTA: hero `<Button>` "See Plans →" scrolls to `#plans` (same scroll-only pattern as UK). Bottom `<Link>` "Create Your Cake Now" → `/free-ai-cake-designer`.
- Responsive gating: `md:` grid/height utilities. `StickyMobileCTA` (mobile-only internally).
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={false} isPremium={false} country="US" />}` — hardcodes logged-out/non-premium (auth result discarded). Carousel bundled-image fallback.

### UseCases.tsx
- Static SEO "use cases" page (`/use-cases`): 6 occasion cards, 3 testimonial stories, ideas-by-channel grid, CTA. All hardcoded.
- Props: no props.
- Primary CTA: bottom `<Link to="/">` wrapping `<Button>` "Make a Cake".
- Responsive gating: `md:`/`lg:` grids only.
- Conditional mount: none. No auth/premium gating, no data fetch.

### WeddingCakeDesigner.tsx
- SEO tool landing (`/wedding-cake-designer`): hero, gallery (Supabase wedding featured or Unsplash fallback), how-to, why-choose, FAQ, CTA. Same template as Personalized/Photo/Rakhi.
- Props: no props.
- Primary CTA: `<Button>` "Design My Wedding Cake →" → `navigate("/free-ai-cake-designer?occasion=wedding")`.
- Responsive gating: `md:`/`sm:`/`lg:` grids only.
- Conditional mount: `{authChecked && <ExitIntentModal isLoggedIn={isLoggedIn} isPremium={isPremium} country="US" />}` (country hardcoded "US"). Gallery `WEDDING_FALLBACK` Unsplash if `<3` DB rows.

---

### Mobile-only in this set
Files with true mobile-only (`sm:hidden`/`md:hidden`) rendering *inside the page file itself*:
- **SharedCake.tsx** — `sm:hidden` fixed bottom-bar CTA (the only in-file breakpoint-gated element in this set).

(IndiaLanding, UKLanding, USALanding, Pricing render `<StickyMobileCTA>`, a component that is mobile-only internally — not gated in the page file. No page in this set uses `useIsMobile`.)

### Primary-CTA-is-anchor in this set
Pages whose main CTA is an `<a>`/`<Link>` (rather than a `<button>`/`<Button>` with onClick):
- **NamedCakePage.tsx** (`<Link>`→ designer)
- **NotFound.tsx** (`<Link>`→ `/`)
- **PartyPlanner.tsx** (logged-out mode: `<Link>`→ `/auth?redirect=...`)
- **Privacy.tsx** (`<Link>`→ `/`)
- **SharedCake.tsx** (`<Link>`→ designer)
- **ThemedCakePage.tsx** (`<Link>`→ designer)
- **UseCases.tsx** (`<Link>`→ `/`)

(Button-with-onClick CTA pages: IndiaLanding, Occasions, PartyPlannerDetail, PartyRSVP, PersonalizedCakeOnline, PhotoCakeMaker, RakhiCakeIdeas, RecipeDetail, ThreeDCakeDesigner, WeddingCakeDesigner. UK/USALanding hero CTA is a Button scrolling to #plans; their true designer link is a bottom `<Link>`. Recipes primary CTA is a `<Link>` banner; Pricing's plan CTAs live in the child `PricingPlans` component; Terms has no prominent CTA.)
## 3c. Components Inventory (part 1: A–M)

Scope: top-level `src/components/*.tsx` files whose filename starts with A–M inclusive (from `AchievementBadges.tsx` through `LocalVendorResults.tsx`). Each was read in full (CakeCreator.tsx, 3531 lines, was surveyed via targeted greps for its signature, CTA, responsive and gating signals).

---

### AchievementBadges.tsx
- Renders a toast/animated "Achievement Unlocked" notification and a row of unlocked achievement badge chips. Auto-inserts new achievements into Supabase when generation/streak thresholds are crossed.
- Props (required, no defaults): `userId: string`, `totalGenerations: number`, `currentStreak: number`.
- Primary interactive element: none — badges are `<motion.div>` chips with hover only; no CTA anchor/button.
- Responsive gating: none.
- Conditional mount signals: renders nothing (fragment with two guarded blocks) unless there is a notification or `unlockedAchievements.length > 0`. Depends on `userId` (implicitly logged-in). Writes to `achievements` table on mount/threshold.

### AdSlot.tsx
- Renders a Google AdSense `<ins>` slot; pushes to `adsbygoogle` once the container has measurable width (RAF + ResizeObserver).
- Props: `size` (required union), `className?`, `slotId?`.
- No-op footgun: **renders `null` if `slotId` is absent** (default undefined ⇒ silent no-op). Also `null` while `loading`, if `adsEnabled` is false, or if `preferences.marketing` (marketing cookie consent) is false. Multiple silent-disable paths.
- Primary interactive element: none (ad unit).
- Responsive gating: none intrinsic.
- Conditional mount signals: gated on ad-enabled flag (`useAdsEnabled`) AND marketing cookie consent (`useCookieConsent`) before rendering.

### AeoBlocks.tsx
- Exports two SEO/AEO layout primitives: `AnswerBox` (quotable answer + stat chips) and `DefinitionBox` ("What is {term}?" H2 + prose). Note: file exports these named components, not a component matching the filename.
- `AnswerBox` props: `children` (req), `stats?`, `label = "Quick answer"`, `className = ""`.
- `DefinitionBox` props: `term` (req), `definition` (req), `className = ""`.
- Primary interactive element: none (static content).
- Responsive gating: none (uses `md:` type-scale only, both breakpoints).
- Conditional mount signals: none.

### AnimatedFlame.tsx
- Pure CSS/SVG animated candle flame; renders a rising smoke wisp instead when `blown`.
- Props: `size = "md"`, `delay = 0`, `className = ""`, `blown = false`.
- No-op-adjacent flag: `blown` defaults `false` (normal flame) — not a footgun, expected default.
- Primary interactive element: none (`aria-hidden` decoration).
- Responsive gating: none.
- Conditional mount signals: none.

### AudioRecorder.tsx
- Dialog to record up to 30s of audio, preview, and upload via `save-cake-audio` edge function; attaches a voice message to a cake.
- Props (all required except `existingAudioUrl?`): `open`, `onOpenChange`, `cakeImageId`, `userId`, `existingAudioUrl? = null`, `onSaved`.
- Primary interactive element: `<Button>` (mic / stop / save).
- Responsive gating: none.
- Conditional mount signals: controlled by `open`. Refreshes Supabase session; if session missing on save, toasts "sign in again" (implicitly requires logged-in user).

### AuthCountrySync.tsx
- Headless (renders `null`): silently backfills `profiles.country` for signed-in users lacking it, using `GeoContext` detected country. No UI.
- Props: none.
- No-op-adjacent: maps `GB` → `UK` for internal values (hardcoded remap, intentional).
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: only acts if `detectedCountry` present AND an auth session exists (getSession + onAuthStateChange SIGNED_IN). Always mounts but does nothing when logged out.

### AuthorByline.tsx
- Static blog byline: gradient "CA" avatar + "Cake AI Artist Team" + date · readTime.
- Props (required): `date: string`, `readTime: string`.
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: none.

### BlogCTABox.tsx
- Static "Ready to Create Your Own?" blog CTA card.
- Props: none.
- Primary interactive element: **anchor** — CTA is `<Link to="/">` wrapping a `<Button>` (navigates via anchor). Avatar icon block is `hidden sm:flex` (hidden below `sm`).
- Responsive gating: decorative icon only visible `sm+`; CTA itself always shown.
- Conditional mount signals: none.

### BlogExitIntentPopup.tsx
- Exit-intent (mouse-leave top of viewport) dialog to collect email into `blog_subscribers`.
- Props: none.
- Primary interactive element: `<Button>` (Subscribe) plus plain dismiss `<button>`s.
- Responsive gating: none (`sm:max-w-md` only).
- Conditional mount signals: session-scoped — bails if `sessionStorage` `blog_exit_popup_dismissed` set; only shows after 3s delay + mouse-leave. Not user/geo gated.

### CakeConvergeReveal.tsx
- Animated "reveal" sequence that cycles 1–3 sibling cake images then settles on a finale; used on share links.
- Props: `images` (req), `primary` (req), `finale?`, `alt = "Personalized cake"`, `className = ""`, `cacheKey?`, `enabled = true`.
- No-op footgun: **`enabled` defaults `true`, but when set `false` the whole reveal sequence and preload are skipped** (holds at primary) — a caller passing `enabled={false}` silently disables the animation.
- Primary interactive element: a "Skip" `<button>` shown during reveal only; no CTA.
- Responsive gating: none.
- Conditional mount signals: gates preload/sequence on `enabled`.

### CakeCreator.tsx
- The main cake-generation form/flow: name, occasion, theme, character, message, generation, results grid, save-to-gallery, upgrade prompts. Largest component in the set (3531 lines).
- Props: `onGenerate?: () => void` (single optional prop).
- No-op footgun: **`onGenerate` defaults undefined**; it is only invoked as `if (onGenerate) onGenerate()` after a successful generation (line ~1171) — parents that forget to pass it get no post-generate callback (silent).
- Primary interactive element: `<Button>` — main CTA is the "✨ Generate My Cake 🎉" / "🔐 Free Sign Up Required to Generate" button (line ~2504), a `<Button>` (not an anchor). Secondary nav (Upgrade, View Gallery, `/auth`) uses `navigate()` buttons and one `<Link to="/auth">`.
- Responsive gating: uses `useIsMobile()` and many `md:` classes; not single-breakpoint-only — renders on all sizes.
- Conditional mount signals: reads `isLoggedIn`, `isPremium`, `isAdmin`, session state; shows different banners/limits accordingly but **always renders the creator** (no top-level `return null` gate). Free vs premium generation limits enforced internally.

### CakeSpinShowcase.tsx
- CSS 3D turntable rotation of a cake image; optional "Download spinning preview" records ~3s to WebM via MediaRecorder/canvas.
- Props: `src` (req), `alt = "Rotating AI-designed cake"`, `className = ""`, `duration = 9`, `allowDownload = true`.
- No-op-adjacent: `allowDownload` defaults `true`; setting `false` hides the download button (expected).
- Primary interactive element: `<Button>` (Download preview) when `allowDownload`; the image div toggles pause on click.
- Responsive gating: none.
- Conditional mount signals: none.

### CakeWall.tsx
- Decorative masonry "wall" of featured cake tiles (hero uses `HeroCakeWithFlames`) with a lightbox dialog and social-proof chip.
- Props: `cakeCount = 5000`.
- Primary interactive element: tiles are `<button>`s opening a lightbox; no navigational CTA.
- Responsive gating: none (grid `sm:`/`md:` sizing only).
- Conditional mount signals: none.

### CandleRow.tsx
- Row of candle sticks each topped with `AnimatedFlame`; switches to blown/smoke styling when `blown`.
- Props: `count = 7`, `size = "md"`, `className = ""`, `blown = false`.
- No-op-adjacent: `blown` defaults `false` (lit) — expected.
- Primary interactive element: none (`aria-hidden`).
- Responsive gating: none.
- Conditional mount signals: none.

### CharacterPicker.tsx
- Theme/character combobox with occasion-aware category sorting; premium characters gated behind a crown/`onPremiumBlock`. Mobile uses a bottom `Sheet`, desktop uses a `Popover`.
- Props: `value` (req), `onValueChange` (req), `isPremium` (req), `disabled = false`, `onPremiumBlock?`, `occasion?`.
- No-op footgun: **`onPremiumBlock` defaults undefined** — selecting a premium character while not premium calls `onPremiumBlock?.()` (optional chaining), so if the parent omits it, the block is silent (no upsell shown). Also `occasion` defaults undefined ⇒ no category pinning/demotion.
- Primary interactive element: `<Button>` combobox trigger.
- Responsive gating: **yes — `useIsMobile()` picks entirely different UI (Sheet on mobile vs Popover on desktop)**; both breakpoints functional.
- Conditional mount signals: premium characters shown but selection blocked unless `isPremium`.

### ConfettiRain.tsx
- Fixed full-screen decorative falling confetti.
- Props: `count = 14`.
- Primary interactive element: none (`pointer-events-none`, `aria-hidden`).
- Responsive gating: none.
- Conditional mount signals: none.

### CookieConsent.tsx
- Bottom cookie-consent banner (Accept All / Reject All / Customize with analytics + marketing toggles); updates `gtag` consent and dispatches `cookieConsentUpdated`.
- Props: none (state from `useCookieConsent`).
- Primary interactive element: `<Button>`s (Accept/Reject/Save); privacy link is `<Link to="/privacy">`.
- Responsive gating: none (`sm:`/`md:` layout only).
- Conditional mount signals: only renders when `showBanner` (from hook — i.e. consent not yet stored).

### CountdownTimer.tsx
- Countdown to a holiday-sale end date (compact or block variant); shows loading skeleton then live d/h/m/s with urgency colors.
- Props: `compact = false`, `className = ''`, `countryCode?`, `endDate? (propEndDate)`.
- No-op footgun: **`DEFAULT_END_DATE` is a hardcoded `2026-12-31` fallback** used only if no prop/sale date — a stale hardcoded date. Also **returns `null` when `sale?.isDefault` (no active campaign) and no `propEndDate`** — silently renders nothing.
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: hides entirely if sale is default mode; shows "Sale Ended" if expired.

### CountryBlogFeed.tsx
- Country-specific 3-post blog strip (posts where `target_country` = code OR null).
- Props (required): `countryCode: "IN"|"UK"|"AU"|"CA"|"US"`, `countryName: string`.
- Primary interactive element: **anchor** — "See all articles" and each post card are `<Link>`s.
- Responsive gating: none (`md:` grid only).
- Conditional mount signals: returns `null` while loading and when zero posts.

### CountryPicker.tsx
- Country combobox (top 5 + long "other" list) with flags; mobile `Sheet`, desktop `Popover`.
- Props: `value` (req), `onValueChange` (req), `disabled?`, `className?`, `fullWidth?`.
- Primary interactive element: `<Button>` trigger.
- Responsive gating: **yes — `useIsMobile()` swaps Sheet vs Popover**; both functional.
- Conditional mount signals: none.

### CountryRecipesSection.tsx
- Country recipe grid (up to 6 published recipes for the country) with ItemList + Breadcrumb JSON-LD.
- Props (required): `countryCode`, `countryName`, `adjective`.
- No-op-adjacent: `COUNTRY_PATH` map has no `US` entry (breadcrumb item URL would be `undefined` for US).
- Primary interactive element: **anchor** — recipe cards and "Browse all … recipes" are `<Link>`s.
- Responsive gating: none (`sm:`/`lg:` grid only).
- Conditional mount signals: returns `null` when zero recipes.

### CursorSparkles.tsx
- Global mousemove sparkle trail (fixed overlay, max 20 sparkles).
- Props: none.
- Primary interactive element: none (`pointer-events-none`).
- Responsive gating: none (desktop-oriented — mousemove; no touch handling).
- Conditional mount signals: none.

### DeferredMount.tsx
- Utility wrapper that renders `children` only after `requestIdleCallback` (or `delay` fallback) — keeps initial paint fast.
- Props: `children` (req), `delay = 1500`, `idleTimeout = 3000`.
- Primary interactive element: none (pass-through).
- Responsive gating: none.
- Conditional mount signals: returns `null` until idle/ready (all children mount-deferred).

### DynamicSaleLabel.tsx
- Inline sale label from `useHolidaySale` (emoji + label + suffix), skeleton while loading, generic fallback if no sale.
- Props: `countryCode?`, `className = ''`, `suffix = 'ENDS IN:'`.
- Primary interactive element: none (span).
- Responsive gating: none.
- Conditional mount signals: none (always renders something — fallback text if no sale).

### EmbeddableGalleryWidget.tsx
- Embeddable public gallery grid (from `public_featured_images`) with optional branding footer link; plus `EmbedGalleryPage` wrapper that reads URL params for iframe use.
- Props: `limit = 6`, `showBranding = true`, `columns = 3`.
- No-op-adjacent: `showBranding` defaults `true`; images link out to `cakeaiartist.com/community`.
- Primary interactive element: **anchor** — each image and the branding footer are raw `<a href target="_blank">` (absolute cakeaiartist.com URLs, for embed context).
- Responsive gating: none (`md:` column counts only).
- Conditional mount signals: shows skeleton while loading; renders grid regardless (empty if no data).

### ErrorBoundary.tsx
- Class error boundary: on chunk-load errors does a one-shot reload; otherwise logs to `client_errors` table and shows a fallback error screen with details + Reload button.
- Props: `children` (req), `component?`.
- Primary interactive element: `<button>` (Reload Page) in fallback.
- Responsive gating: none.
- Conditional mount signals: fallback only when `hasError`.

### ExitIntentModal.tsx
- Exit-intent upgrade modal (mouse-leave after 30s on page, 24h cooldown) with region-priced lifetime/yearly comparison; a distinct "first cake waiting" variant for inactive premium users.
- Props: `isLoggedIn` (req), `isPremium` (req), `isPremiumInactive? `, `country?`.
- No-op footgun: **prices default to `US` when `country` is undefined** (`LIFETIME_PRICES[country || 'US']`) — a missing country silently shows US pricing. Also **returns early (never shows) when `isPremium && !isPremiumInactive`** — silent suppression for premium users.
- Primary interactive element: `<Button>` (Get Lifetime Access → `navigate("/pricing")`).
- Responsive gating: none (`sm:` widths only).
- Conditional mount signals: gated on premium status; 24h localStorage cooldown; 30s dwell.

### FeedbackWidget.tsx
- Floating "Feedback" button + rating/category/message dialog writing to `feedback` table (1/day limit). Supports external open control.
- Props: `externalOpen?`, `onExternalOpenChange?` (whole props object defaults `{}`).
- No-op-adjacent: when `onExternalOpenChange` omitted, falls back to internal state (fine); `category` defaults `""` → stored as `"general"`.
- Primary interactive element: `<Button>` (floating trigger + Submit).
- Responsive gating: **yes — floating button is `hidden lg:flex` (only visible on `lg`+)**; the dialog itself is unrestricted.
- Conditional mount signals: submit requires an auth session (toasts "Login required" otherwise).

### FloatingEmojis.tsx
- Fixed full-screen decorative floating celebration emojis (8, regenerated every 30s after a 2s delay).
- Props: none.
- Primary interactive element: none (`pointer-events-none`).
- Responsive gating: none.
- Conditional mount signals: none.

### FontPreviewPicker.tsx
- Font picker with category tabs and a 2-col preview grid rendering the recipient name in each font.
- Props (required): `selectedFontId`, `recipientName`, `onFontChange`.
- Primary interactive element: `<button>`s (category tabs + font tiles).
- Responsive gating: none.
- Conditional mount signals: none.

### Footer.tsx
- Site footer: link columns (tools, occasions, countries, resources, company), region selector button/menu (writes country prefs, hard-navigates), cookie-settings trigger, mailto.
- Props: none.
- Primary interactive element: mixed — nav links are `<Link>`; region selector, auto-detect, and cookie-settings are `<button>`s doing JS navigation/side-effects.
- Responsive gating: none (`md:`/`lg:` grid only).
- Conditional mount signals: none. Region label resolved from `GeoContext` + path.

### GalleryComments.tsx
- Comment list + add-comment form for a gallery image (delete only own comments).
- Props (required): `comments`, `onAddComment`, `onDeleteComment`, `isCommenting`, `isAuthenticated`, `currentUserId`.
- Primary interactive element: `<Button>` (Send / delete icon).
- Responsive gating: none.
- Conditional mount signals: add-comment form only when `isAuthenticated`; delete button only when `currentUserId === comment.user_id`.

### GenerationLimitTracker.tsx
- Free-plan usage bar with upgrade nudges; premium users see a "Premium Active" card instead.
- Props (required): `current`, `limit`, `isPremium`.
- Primary interactive element: `<Button>`/`<button>` (Upgrade / "See plans") → `navigate("/pricing")`.
- Responsive gating: none.
- Conditional mount signals: premium branch renders a different card; upgrade CTA only when `remaining <= 1`.

### GeoRedirectWrapper.tsx
- Headless (`null`): on explicit country landing pages, detects country (server edge fn → ipapi fallback) and redirects to the matching region path.
- Props: none.
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: **skips redirect for search bots, `?noredirect`, admins, `/` (dynamic), and already-redirected**; checks admin role via `has_role` RPC before acting.

### GlobalReachWidget.tsx
- "Global Community" section with a conic-gradient donut of per-country traffic percentages (from `site_settings.country_stats`, hardcoded FALLBACK if absent).
- Props: none.
- No-op-adjacent: renders `null` until `loaded`, and if `!s.enabled || !s.top.length`. FALLBACK stats are hardcoded placeholder percentages.
- Primary interactive element: none (static chart/legend).
- Responsive gating: none (`md:` sizing only).
- Conditional mount signals: gated on the `enabled` flag in the settings row.

### HeroCakeWithFlames.tsx
- Single `<img>` of the hero cake (`/hero-cake.webp`) with eager load + high fetchpriority for LCP.
- Props: `className = ""`, `alt = "AI-designed celebration cake with flickering candle flames"`.
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: none.

### HolidaySalesManager.tsx
- Admin table to manage holiday sales (activate toggle, country filter, status badges, preview modal via `SalePreviewModal`).
- Props: none.
- Primary interactive element: `<Button>`s (Refresh, preview) + `<Switch>` toggles.
- Responsive gating: none.
- Conditional mount signals: no internal role check — it queries `holiday_sales` directly (comment notes admin RLS); intended to be mounted only within an admin route.

### HomepageFAQ.tsx
- Exports `HOMEPAGE_FAQS` data + an accordion FAQ section (8 SEO Q&As).
- Props: none.
- Primary interactive element: accordion triggers (Radix `<button>`s); no navigational CTA.
- Responsive gating: none (`md:` type only).
- Conditional mount signals: none.

### InvitePreview.tsx
- Themed party-invitation preview card (large `THEME_STYLES` map + `getThemeStyle`/`DEFAULT_THEME` exports; injects Google Fonts). Renders hero, cake image, details, and a static "RSVP Now →" pill.
- Props: `party` (req, `any`), `hostName = "Your friend"`, `guestName = "Friend"`, `headline?`, `message?`, `cakeImageUrl? = null`, `artworkUrl? = null`.
- No-op-adjacent: "RSVP Now →" is a **non-interactive `<span>`, not a link/button** — purely a preview mockup.
- Primary interactive element: none (preview only; the RSVP element is decorative).
- Responsive gating: none (fixed max-width inline styles).
- Conditional mount signals: adult-occasion regex tones down emojis/corner accents; otherwise always renders.

### LiveActivityFeed.tsx
- Fixed bottom-left "Live Activity" card: latest 5 rows from `activity_feed` (realtime INSERT subscription) + a randomized "browsing now" count.
- Props: none.
- No-op-adjacent: `onlineCount` is `Math.random()*500+100` (fabricated social proof).
- Primary interactive element: none.
- Responsive gating: none (fixed 320px card, both breakpoints).
- Conditional mount signals: returns `null` when zero activities.

### LivePurchaseNotifications.tsx
- Headless (`null`): fires up to 5 sonner toasts — real ones on `founding_members` INSERT, plus simulated "someone bought" toasts on random 7±2min intervals after a 3min delay.
- Props: none.
- No-op-adjacent: **simulated/fabricated purchase notifications** (marketing social proof, not real events).
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: caps at `MAX_NOTIFICATIONS = 5`.

### LocalVendorResults.tsx
- Renders a list of local vendor result cards (name, rating, open/closed badge, address) with Call/Maps/Web action buttons.
- Props (required): `results: VendorResult[]`, `vendorLabel`, `location`.
- Primary interactive element: **anchor** — Call (`<a href="tel:">`), Maps and Web are `<a target="_blank">` rendered via `<Button asChild>` (buttons that are anchors).
- Responsive gating: none.
- Conditional mount signals: shows an empty-state message when `results.length === 0`.

---

### Mobile-only components (this set, A–M)
- **FeedbackWidget** — floating trigger button is `hidden lg:flex` (only appears on `lg`+; effectively desktop-only, not mobile — the only single-breakpoint-gated visible element in the set).
- No component in A–M is *mobile-only* (`md:hidden` / mobile-exclusive). Responsive-branching components that fully work on both mobile and desktop via `useIsMobile()`: **CharacterPicker**, **CountryPicker** (Sheet on mobile, Popover on desktop). **BlogCTABox** hides only a decorative icon below `sm`.

### Components whose primary CTA is an anchor (`<a>`/`<Link>`) (this set, A–M)
- **BlogCTABox** — `<Link to="/">`
- **CountryBlogFeed** — post cards + "See all articles" `<Link>`
- **CountryRecipesSection** — recipe cards + "Browse all recipes" `<Link>`
- **EmbeddableGalleryWidget** — image tiles + branding `<a>` (absolute URLs)
- **LocalVendorResults** — Call/Maps/Web `<a>` (via `Button asChild`)
- **Footer** — nav columns are `<Link>` (mixed with `<button>` utilities)

(Most other interactive components — CakeCreator, ExitIntentModal, GenerationLimitTracker, FeedbackWidget, AudioRecorder, CharacterPicker, CountryPicker, etc. — use `<Button>` / `<button>` + JS `navigate()` for their primary CTA.)
## 3d. Components Inventory (part 2: N–Z, admin/, ui/)

Scope covered: top-level `src/components/*.tsx` with filenames P–Z (there are no N/O-initial top-level custom components in `src/components/*.tsx`), all of `src/components/admin/*.tsx`, and a summary of `src/components/ui/*.tsx`.

Note: `ls src/components/*.tsx` returned no filenames starting with N or O; the N–Z range is populated starting at `PageSeo.tsx`.

---

### (a) Top-level custom components (P–Z)

#### PageSeo.tsx
- Renders a per-route `<Helmet>` head block: title, description, robots, self-referencing canonical + og:url, Open Graph, Twitter tags, and optional JSON-LD `<script>` tags.
- Props: `path` (req), `title` (req), `description` (req), `type = "website"`, `image = DEFAULT_OG_IMAGE` (`${SITE}/hero-cake.jpg`), `noindex = false`, `keywords?`, `jsonLd?`. Footgun: `noindex = false` default is correct for indexable pages, but note `keywords` only emits a tag when explicitly passed. `image` default hardcodes the hero cake — fine but silent if a page-specific image is forgotten.
- Primary interactive element: none (head-only).
- Responsive gating: none.
- Conditional mount signals: none (renders based on props only; `noindex`/`keywords` conditionally emit tags).

#### PartyPackGenerator.tsx
- Renders an optional event-details form (date/time/location) plus a gated "Generate Party Pack" flow that invokes the `generate-party-pack` edge function, shows progress, then a preview/download-all(PDF) UI.
- Props: `cakeImageId` (req), `name` (req), `occasion` (req), `theme?`, `colors?`, `character?`. No no-op defaults.
- Primary interactive element: `<Button>` (generate / view / download); the locked-state CTA is a `<Button asChild><Link to="/pricing">`.
- Responsive gating: none.
- Conditional mount signals: PREMIUM gating via `usePartyPackAccess()` — when `!hasAccess`, renders a locked upsell card with a `/pricing` link instead of the generate button. Also checks `supabase.auth.getSession()` (LOGGED-IN) before generating.

#### PartyPackPreview.tsx
- Modal (Dialog) grid of the 5 generated party items with a nested full-size Dialog offering per-item download and share (Web Share API with clipboard fallback).
- Props: `partyPack` (req), `name` (req), `occasion` (req), `open` (req), `onOpenChange` (req). No defaults.
- Primary interactive element: `<Button>` (download/share) and clickable `<Card>` tiles.
- Responsive gating: layout only (`grid-cols-2 md:grid-cols-3`).
- Conditional mount signals: none.

#### PartyVendorDirectory.tsx
- Renders a vendor-category chip selector + location input that calls the `search-local-vendors` edge function and displays `<LocalVendorResults>`, all wrapped in `<VendorSearchGate>`.
- Props: `isPremium` (req), `occasion?`, `defaultLocation = ""`. Footgun-ish: the Search `<Button>` is `disabled={loading || !isPremium}`, so when `isPremium` is false the button silently does nothing (the gate blur is the primary block; the disabled flag is a secondary no-op).
- Primary interactive element: `<Button>` (Search) + category `<button>` chips.
- Responsive gating: none.
- Conditional mount signals: PREMIUM — search disabled and content blurred/gated by `VendorSearchGate` when `!isPremium`; server also returns `premium_required`.

#### PhotoEditor.tsx
- Full-screen fixed-overlay canvas editor for compositing a user photo onto a cake image (drag to position, size/rotation/shape/border-color/border-width controls). Marked as a preserved FALLBACK for the original N8N + overlay solution.
- Props: `cakeImageUrl` (req), `userPhotoUrl` (req), `initialPosition` (req), `onSave` (req), `onCancel` (req). No defaults (all required).
- Primary interactive element: `<Button>` (Apply Changes / Cancel) + canvas mouse drag.
- Responsive gating: none (`grid md:grid-cols-2` layout only).
- Conditional mount signals: none (parent controls mount).

#### PopularCakesSection.tsx
- Homepage section that loads top-8 gallery images by like count (fallback to recent featured) and renders them as a grid of ranked cards linking to /community.
- Props: none.
- Primary interactive element: ANCHOR — `<Link to="/community">` wrapping each card and the "View all" link.
- Responsive gating: layout only (`grid-cols-2 md:grid-cols-4`).
- Conditional mount signals: returns `null` when no popular cakes load (empty-state self-unmount); shows skeleton while loading.

#### PostShareUpgradeModal.tsx
- Post-share upsell Dialog offering Party Pack and Lifetime tiers with localized pricing; shows a first-week 30%-off banner if the user's profile is <7 days old.
- Props: `open` (req), `onOpenChange` (req), `country = "US"`. Footgun: HARDCODED country default `"US"` — if a caller omits `country`, all users see US pricing copy regardless of geo.
- Primary interactive element: ANCHOR — both CTAs are `<Button asChild><Link to="/pricing">`; a plain `<button>` handles dismiss.
- Responsive gating: none.
- Conditional mount signals: LOGGED-IN — queries `supabase.auth.getSession()` + `profiles.created_at` to conditionally show the first-week discount banner (`firstWeek`).

#### PremiumComparison.tsx
- Animated free-vs-premium feature comparison table with an "Upgrade to Premium" button; price label localized via GeoContext.
- Props: `show` (req). Returns `null` when `show` is false.
- Primary interactive element: `<Button>` → `navigate("/pricing")` (router push, not anchor).
- Responsive gating: none.
- Conditional mount signals: `if (!show) return null`. GEO — `monthlyLabel` derived from `useGeoContext().detectedCountry`, falling back to `$9.99/month` when country not in `MONTHLY_PRICE`.

#### PreviewLandingHero.tsx
- Admin-preview render of the country landing-page hero sale label (emoji + label + optional countdown), for the SalePreviewModal.
- Props: `sale` (req; `{ saleLabel, emoji, endDate, isDefault }`).
- Primary interactive element: none (display only).
- Responsive gating: none.
- Conditional mount signals: branches on `sale.isDefault` (LIMITED OFFER vs ENDS IN + countdown).

#### PreviewPricingHero.tsx
- Admin-preview render of the pricing-page hero sale banner (default "CHOOSE YOUR PLAN" vs holiday countdown), for SalePreviewModal.
- Props: `sale` (req; adds `holidayName`, `bannerText` to the preview shape).
- Primary interactive element: none (display only).
- Responsive gating: none.
- Conditional mount signals: branches on `sale.isDefault` and `sale.endDate`.

#### PreviewUrgencyBanner.tsx
- No-op stub. "Preview urgency banner removed with the 3-tier pricing migration." Renders `null`; on mount fires `onVisibilityChange?.(false)` and `onHeightChange?.(0)`.
- Props: `onVisibilityChange?`, `onHeightChange?`, `countryCode?`. Footgun: all callbacks optional and effectively no-op; this component always reports itself invisible/zero-height. `countryCode` prop is accepted but unused.
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: none (always null).

#### PricingPlans.tsx
- Four-column pricing grid (Party Pack / Monthly / Yearly / Lifetime) with per-country price rows and Razorpay checkout via `useRazorpayPayment`; optional first-week 30%-off banner.
- Props: `country = "US"`. Footgun: HARDCODED country default `"US"` — omitting `country` charges/display US pricing. `cc` falls back to "US" if the passed country isn't in `PRICING`.
- Primary interactive element: `<Button>` (each plan's checkout `onClick={() => handlePayment(tier)}`), not an anchor.
- Responsive gating: layout only (`grid md:grid-cols-2 lg:grid-cols-4`).
- Conditional mount signals: LOGGED-IN — `supabase.auth.getSession()` + `profiles.created_at` to toggle `firstWeekEligible` banner (client-side hint only; server authoritative).

#### ReadingProgressBar.tsx
- Fixed top scroll-progress bar computed from the first `<article>` element's scroll position.
- Props: none.
- Primary interactive element: none (scroll listener only).
- Responsive gating: none.
- Conditional mount signals: no-op if no `<article>` on the page (bar stays at 0).

#### RecipesNavDropdown.tsx (also exports RecipesMobileMenu and useRecipes hook)
- `RecipesNavDropdown`: desktop dropdown of published recipes grouped by country (IN/UK/CA/AU). `RecipesMobileMenu`: a `<details>`-based collapsible for the mobile nav. Both use the module-level cached `useRecipes()` hook querying `cake_recipes`.
- Props: none for either component.
- Primary interactive element: ANCHOR — recipe items and "Browse all recipes" are `<Link>`s; the dropdown trigger is a `<Button>`.
- Responsive gating: not self-gated — SiteHeader wraps `RecipesNavDropdown` in `hidden md:inline-flex` and uses `RecipesMobileMenu` inside the mobile Sheet.
- Conditional mount signals: country groups with zero items are filtered out.

#### ReferralSystem.tsx
- Card with an email-invite input (inserts into `referrals` with `reward_days: 7`) plus a copyable referral link (`origin?ref=<userId>`).
- Props: `userId` (req), `userEmail` (req). Note: `userEmail` is accepted but not used in the body.
- Primary interactive element: `<Button>` (Invite / copy), not an anchor.
- Responsive gating: none.
- Conditional mount signals: none (parent supplies userId, implying logged-in).

#### RelatedTools.tsx
- In-content "Related AI cake tools" section rendering 3–4 sibling tool cards for internal linking, excluding the current page.
- Props: `exclude?`, `count = 4`, `heading = "Related AI cake tools"`. No no-op footguns.
- Primary interactive element: ANCHOR — each card is a `<Link to={tool.to}>`.
- Responsive gating: layout only (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- Conditional mount signals: none.

#### SalePreviewModal.tsx (admin-facing, but lives in top-level components)
- Admin Dialog previewing a holiday sale across three device-toggleable tabs (Urgency Banner / Pricing Hero / Landing Label) using the Preview* components, with Activate/Deactivate action.
- Props: `sale` (req, nullable), `isOpen` (req), `onClose` (req), `onActivate` (req). Returns `null` when `sale` is null.
- Primary interactive element: `<Button>` (device toggle, Activate/Deactivate, Close).
- Responsive gating: internal desktop/mobile preview simulated via `deviceView` state + `max-w-sm` wrapper (not real breakpoints).
- Conditional mount signals: `if (!sale) return null`; branches on `isDefaultSale` (end year ≥ 2099).

#### ScheduledTasksWidget.tsx (admin-facing)
- Admin widget listing predefined cron/manual tasks with next-run calculation, per-task "Run Now" + "Test Email" buttons that invoke edge functions, and live status badges (polls every 30s).
- Props: none.
- Primary interactive element: `<Button>` (Run Now / Test Email / Refresh).
- Responsive gating: layout only (`grid md:grid-cols-3`).
- Conditional mount signals: per-task buttons conditionally rendered by `task.name` (anniversary-reminders, weekly-upgrade-nudge, engagement-*). Note: hardcoded test recipient `himanshu1305@gmail.com` in `handleTestEngagement`.

#### ScrollToTop.tsx
- Utility: scrolls window to top on every route `pathname` change. Renders `null`.
- Props: none.
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: none.

#### SEOSchema.tsx
- Exports a family of JSON-LD `<Helmet>` schema components: `OrganizationSchema`, `SoftwareApplicationSchema`, `WebSiteSchema`, `ProductSchema`, `FAQSchema`, `ArticleSchema`, `LocalBusinessSchema`, `BreadcrumbSchema`, `AggregateRatingSchema`, `ReviewSchema`, `ProductReviewSchema`, `HowToSchema`. Each injects a `<script type="application/ld+json">`.
- Props: per-schema (see each interface). Defaults worth noting: `ProductSchema`/`ProductReviewSchema` default `shippingCountry`/`applicableCountry` to `"US"` (HARDCODED country default in return-policy/shipping schema) and image to `og-image.jpg`; `AggregateRatingSchema` defaults `bestRating = 5`, `worstRating = 1`.
- Primary interactive element: none (head-only).
- Responsive gating: none.
- Conditional mount signals: optional fields conditionally spread into schema objects.

#### ShareInstructions.tsx
- Dialog explaining how to download-then-upload a cake card to social platforms, with Mobile/Desktop tabs and a "Don't show again" checkbox persisted to localStorage.
- Props: `open` (req), `onOpenChange` (req).
- Primary interactive element: `<Button>` ("Got it!") + tabs + checkbox.
- Responsive gating: content-tab driven (Mobile vs Desktop tabs), not CSS breakpoints; `grid-cols-2` layout only.
- Conditional mount signals: writes `hasSeenShareInstructions` to localStorage when "Don't show again" is checked on close.

#### SidebarAd.tsx
- Sticky desktop-only sidebar ad wrapper around `<AdSlot>`.
- Props: `className?`, `slotId?` (falls back to `AD_SLOTS.sidebar_rectangle`).
- Primary interactive element: none (ad container).
- Responsive gating: `hidden lg:block` — ONE-BREAKPOINT-ONLY: renders only at `lg`+ (hidden below large screens).
- Conditional mount signals: returns `null` if no effective slot ID is configured.

#### SiteHeader.tsx
- Site navigation bar: desktop link row + mobile hamburger `Sheet` menu; conditionally shows Gallery/Occasions/Settings (logged-in), Admin (admin role), and Login/Logout. Pricing href is geo/region-resolved.
- Props: `variant = "transparent"` (`"transparent" | "solid"`).
- Primary interactive element: mixed — logo/nav items use `<Link>` wrapping `<Button>`; several nav actions use `<Button onClick={navigate(...)}>` (router push).
- Responsive gating: `hidden md:flex` desktop nav vs `md:hidden` mobile `SheetTrigger` — a clean md split; some items further gated `hidden lg:inline-flex` (Examples/Community/Occasions/Settings/FAQ).
- Conditional mount signals: LOGGED-IN (`isLoggedIn` from session + `onAuthStateChange`) and ADMIN (`user_roles` role=admin query) gate nav items.

#### SocialShareButtons.tsx
- Row/column of social share buttons (WhatsApp, Pinterest, Facebook, X) opening share popups, plus a copy-link button.
- Props: `url` (req), `title` (req), `description?`, `variant = "inline"` (`"inline" | "floating"`).
- Primary interactive element: `<Button>` (share via `window.open`, not anchors).
- Responsive gating: label spans use `hidden sm:inline` (one-breakpoint: labels hidden below `sm`).
- Conditional mount signals: `variant` toggles inline vs floating layout.

#### SpotsRemainingCounter.tsx
- No-op stub. "Spot caps removed in 3-tier pricing migration." Always renders `null`.
- Props: `tier?`, `className?` — both accepted, both ignored. Footgun: entire component is a no-op kept only for import compatibility.
- Primary interactive element: none.
- Responsive gating: none.
- Conditional mount signals: none (always null).

#### StickyMobileCTA.tsx
- Mobile-only bottom-sticky CTA linking to the cake designer.
- Props: `href = "/"`, `label = "Design Your Cake — Free"`, `subLabel = "30 seconds · No card required"`. Footgun: `href` defaults to `"/"` — if a caller forgets to pass a href, the CTA just links to home rather than a specific designer route.
- Primary interactive element: ANCHOR — `<Link to={href}>`.
- Responsive gating: `md:hidden` — MOBILE-ONLY (hidden at md+).
- Conditional mount signals: none.

#### SuccessCelebration.tsx
- Full-screen celebration modal after a cake is created: confetti burst + Share / Download / Create Another buttons.
- Props: `show` (req), `recipientName` (req), `onClose` (req), `onShare` (req), `onDownload` (req), `onCreateAnother` (req). No defaults.
- Primary interactive element: `<Button>` (share/download/create-another callbacks).
- Responsive gating: none.
- Conditional mount signals: gated by `show` inside `AnimatePresence`; confetti fires once via `hasShown` guard.

#### SwipeableImagePreview.tsx
- Full-height carousel of cake view images with zoomable slides, pagination dots, view labels, and a mobile swipe hint.
- Props: `images` (req), `initialIndex = 0`, `onClose` (req).
- Primary interactive element: `<Button>` (close) + carousel nav + pagination `<button>`s.
- Responsive gating: `useIsMobile()` — hides prev/next arrows and shows a swipe hint on mobile (one-breakpoint mobile behavior).
- Conditional mount signals: `!isMobile` → show arrows; `isMobile && currentIndex === initialIndex` → show swipe hint.

#### TextEditor.tsx
- Full-screen fixed-overlay canvas editor to place/style a recipient name on a cake image (drag, font size/rotation/color, font picker); FALLBACK for the original N8N + overlay solution.
- Props: `imageUrl` (req), `recipientName` (req), `initialPosition = {x:0.5, y:0.65}`, `initialFontSize = 42`, `initialColor = "#2563EB"`, `initialRotation = 0`, `initialFontStyle = "great-vibes"`, `onSave` (req), `onCancel` (req). Defaults are sensible seeds, not footguns.
- Primary interactive element: `<Button>` (Apply/Cancel) + canvas drag + sliders + FontPreviewPicker.
- Responsive gating: layout only (`grid md:grid-cols-[1fr,300px]`).
- Conditional mount signals: none (parent controls mount).

#### TrustBadges.tsx
- Static marketing section: 6 animated trust-badge cards + a trust-indicator bar (SSL, no card required, rating).
- Props: none.
- Primary interactive element: none (display only).
- Responsive gating: layout only (`grid-cols-2 md:grid-cols-3 lg:grid-cols-6`).
- Conditional mount signals: none.

#### UrgencyBanner.tsx
- Sticky top evergreen social-proof banner ("#1 AI Cake Generator … Free … 30+ countries"). Reports its own visibility=true and measured height to parent.
- Props: `onVisibilityChange?`, `onHeightChange?`, `countryCode?`. Note: `countryCode` accepted but unused; callbacks optional (`onVisibilityChange?.(true)`).
- Primary interactive element: none (banner text only).
- Responsive gating: text spans toggle via `hidden sm:inline` / `sm:hidden` (one-breakpoint copy swap between short and long text).
- Conditional mount signals: none (always renders visible).

#### VendorSearchGate.tsx
- Premium paywall wrapper: renders children directly if premium, else blurs them behind an "Upgrade to Premium" overlay.
- Props: `isPremium` (req), `children` (req).
- Primary interactive element: `<Button>` → `navigate("/pricing")`.
- Responsive gating: none.
- Conditional mount signals: PREMIUM — `if (isPremium) return children` else render blurred + upsell overlay.

#### WelcomeModal.tsx
- First-run onboarding modal collecting recipient name + occasion, then calls `onStart`, or `onSkip`.
- Props: `userId` (req, nullable, unused in body), `onStart` (req), `onSkip` (req).
- Primary interactive element: `<Button>` ("Create My First Cake") + a plain `<button>` skip.
- Responsive gating: none.
- Conditional mount signals: none (parent controls mount).

#### ZoomableImage.tsx
- Pinch/wheel/double-tap zoomable + pannable image with on-screen zoom controls and a mobile pinch hint.
- Props: `src` (req), `alt` (req), `onZoomChange?`, `resetTrigger?`.
- Primary interactive element: `<Button>` (zoom in/out/fit) + touch/wheel gestures.
- Responsive gating: pinch-hint uses `md:hidden` (mobile-only hint); core behavior works on all sizes.
- Conditional mount signals: pinch hint shown only when `scale === 1`; zoom controls disabled at scale bounds (≤0.5, ≥3).

---

### (b) admin/ components

#### admin/GlobalReachAdmin.tsx
- Admin editor for the homepage "Global Reach" country-percentage widget: editable rows, toggle to show/hide on homepage, "Use live data" seeder from page-visit stats, and Save & Publish to `site_settings`.
- Props: `liveCountryStats: { country; count }[]` (req).
- Primary interactive element: `<Button>` (Use live data / Add country / remove row / Save & Publish) + `<Switch>`.
- Responsive gating: none (12-col grid layout only).
- Conditional mount signals: returns `null` while `loading`. Footgun: the `enabled` switch defaults from `DEFAULT_STATS.enabled = false`, so until a stored value is loaded the widget shows as hidden — the homepage widget is OFF by default.

#### admin/UserActivityPanel.tsx
- Admin Dialog showing a single user's activity: stat cards (cakes, party packs, parties, visits, likes, comments, last seen), cake thumbnails, planned parties, and top pages visited. Pulls from six tables in parallel.
- Props: `open` (req), `onOpenChange` (req), `userId` (req, nullable), `email` (req, nullable).
- Primary interactive element: none meaningful (read-only Dialog; images/badges only).
- Responsive gating: layout only (`grid-cols-2 md:grid-cols-4`, `grid-cols-3 md:grid-cols-5`).
- Conditional mount signals: loads only when `open && userId`; Parties and Top-Pages cards render only when non-empty.

---

### (c) src/components/ui/*.tsx — shadcn/ui primitives

These are standard shadcn/ui primitives (Radix + `class-variance-authority` + `cn`). Not detailed individually:

```
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button,
calendar, card, carousel, chart, checkbox, collapsible, command, context-menu,
dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar,
mobile-select, navigation-menu, pagination, popover, progress, radio-group,
resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider,
sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip
```

Spot-checks / customization notes:
- `button.tsx` — STOCK shadcn variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and sizes (`default`, `sm`, `lg`, `icon`). No custom brand variants added; app-specific gradients (e.g. `bg-gradient-party`) are applied via `className` at call sites rather than as new variants.
- `mobile-select.tsx` — CUSTOM (not a stock shadcn primitive). Renders a bottom `Sheet` on mobile (`useIsMobile`) vs standard `Select` on desktop, with haptics (`useHapticFeedback`) and iOS scroll lock (`useIOSScrollLock`). This is a bespoke responsive wrapper, one of the few non-standard files in `ui/`.
- Remaining files appear to be standard shadcn generations (unverified beyond the two spot-checks above — unclear: whether any of the other ~46 primitives carry minor local tweaks).

---

### Mobile-only components (this set)
- **StickyMobileCTA.tsx** — `md:hidden` (fully mobile-only).
- **SidebarAd.tsx** — inverse: desktop-only (`hidden lg:block`); listed here as the notable breakpoint-gated component.
- **ZoomableImage.tsx** — mobile-only *pinch hint* (`md:hidden`), core component is universal.
- **SwipeableImagePreview.tsx** — mobile-only swipe hint / arrow-hiding via `useIsMobile()`, core component universal.
- (mobile-select.tsx, under ui/, also mobile-branches but is out of the P–Z top-level set.)

### Components whose primary CTA is an anchor (`<Link>`/`<a>`) (this set)
- **PopularCakesSection.tsx** — cards + "View all" are `<Link>`.
- **PostShareUpgradeModal.tsx** — both upsell CTAs are `<Button asChild><Link to="/pricing">`.
- **RecipesNavDropdown.tsx** (+ RecipesMobileMenu) — recipe items and "Browse all" are `<Link>`.
- **RelatedTools.tsx** — every tool card is a `<Link>`.
- **StickyMobileCTA.tsx** — the CTA is a `<Link to={href}>`.
- **PartyPackGenerator.tsx** — the *locked-state* CTA is a `<Link to="/pricing">` (primary CTA when logged-in-with-access is a `<Button>`).
- (SiteHeader.tsx is mixed: logo + most nav are `<Link>`, but auth actions use `navigate()`.)

---

### Summary (3 lines)
This set spans marketing/SEO helpers (PageSeo, SEOSchema, RelatedTools, TrustBadges, UrgencyBanner), premium/paywalled features (PartyPackGenerator, PartyVendorDirectory, VendorSearchGate, PremiumComparison, PricingPlans, PostShareUpgradeModal), canvas editors (PhotoEditor, TextEditor, ZoomableImage), and admin tooling (SalePreviewModal, ScheduledTasksWidget, admin/GlobalReachAdmin, admin/UserActivityPanel). Gating patterns: PREMIUM via `usePartyPackAccess`/`isPremium`, LOGGED-IN/ADMIN via session + `user_roles` in SiteHeader, and GEO via GeoContext/`country` prop for pricing. `ui/` is stock shadcn except the bespoke responsive `mobile-select.tsx`; `button.tsx` uses default variants only.

### No-op-default footguns
- **HARDCODED `country = "US"`** in `PostShareUpgradeModal` and `PricingPlans` (and `shippingCountry`/`applicableCountry = "US"` in SEOSchema's Product schemas) — omitting the prop silently serves US pricing/policy to everyone.
- **`StickyMobileCTA` `href = "/"`** — a forgotten href silently points the primary CTA at the homepage instead of a designer route.
- **Pure no-op stubs**: `PreviewUrgencyBanner` (always reports invisible/height-0), `SpotsRemainingCounter` (always `null`) — both accept props that are entirely ignored; kept only for import compatibility post pricing-migration.
- **`PartyVendorDirectory` search `<Button>` `disabled={!isPremium}`** and **`GlobalReachAdmin` `enabled` defaulting to `false`** — silent-off flags: search does nothing / homepage widget stays hidden until state changes.
- **Unused props**: `ReferralSystem.userEmail`, `WelcomeModal.userId`, `UrgencyBanner.countryCode`, `PreviewUrgencyBanner.countryCode` are accepted but never referenced.
- **Hardcoded test recipient** `himanshu1305@gmail.com` in `ScheduledTasksWidget.handleTestEngagement`.
## 3e. Consolidated: mobile-only & anchor-CTA elements

_Compiled from §3a–§3d. "Mobile-only" = rendered only at a mobile breakpoint (`sm:hidden`/`md:hidden` shows it only below the breakpoint, or a component that only renders a mobile control). "Anchor CTA" = the primary call-to-action is an `<a>`/`<Link>` rather than a `<button>`/`<Button>`+`onClick`._

### Mobile-only rendering
- **`StickyMobileCTA.tsx`** — the one genuinely mobile-only component (a fixed bottom CTA bar shown on small screens); mounted by IndiaLanding, UKLanding, USALanding, Pricing, and the geo landings.
- **`Index.tsx`** — mobile hamburger `Sheet` nav via `SheetTrigger className="md:hidden"` (mobile nav only; the `hidden md:block` demo card + `hidden md:flex` nav are conversely desktop-only).
- **`SharedCake.tsx`** — `sm:hidden` fixed bottom-bar CTA (only in-file breakpoint-gated element in its set).
- **`RecipesNavDropdown.tsx` → `RecipesMobileMenu`** — a mobile menu variant (desktop uses the dropdown).
- **Inverse (desktop-only, flagged for completeness):** `FeedbackWidget` trigger is `hidden lg:flex` (appears only on `lg`+).
- **Responsive-branch but NOT mobile-only (work on both):** `CharacterPicker`, `CountryPicker` (Sheet on mobile / Popover on desktop via `useIsMobile()`), and `ui/mobile-select.tsx`.
- No page uses `useIsMobile` directly; the rest of the codebase uses `md:`/`lg:` for layout only.

### Primary CTA is an anchor (`<a>`/`<Link>`)
**Pages:** About, Advertising (Privacy/Terms/Home trio), Blog (post links), HowItWorks, AustraliaLanding (final CTA), CanadaLanding (final CTA), NamedCakePage, NotFound, PartyPlanner (logged-out mode), Privacy, SharedCake, ThemedCakePage, UseCases, Recipes (banner link). _(Secondary/inline-link-only, not a hero CTA: BlogUnsubscribe, Contact, FAQ.)_

**Components:** BlogCTABox, CountryBlogFeed, CountryRecipesSection, EmbeddableGalleryWidget, LocalVendorResults (Call/Maps/Web via `Button asChild` → `<a>`), Footer, PopularCakesSection, PostShareUpgradeModal (`Button asChild><Link>`), RecipesNavDropdown, RelatedTools, StickyMobileCTA, PartyPackGenerator (locked-state CTA only). _(`SiteHeader` is mixed: logo/nav are `<Link>`, auth actions use `navigate()`.)_

**For contrast — primary CTA is a `<Button>`/JS `navigate()`:** the interactive tool/landing pages (AiBirthdayCakeWithName, AiCakeGeneratorFree, FreeCakeDesigner, PhotoCakeMaker, PersonalizedCakeOnline, ThreeDCakeDesigner, WeddingCakeDesigner, GraduationCakeDesigner, EidCakeDesigner, EgglessCakeDesigner, AnniversaryCakeDesigner, RakhiCakeIdeas, IndiaLanding, Occasions, PartyPlannerDetail, PartyRSVP, RecipeDetail), the admin pages, and most interactive components (CakeCreator, ExitIntentModal, GenerationLimitTracker, etc.).

> **Relevance (per the brief):** anchor CTAs navigate natively even if JS handlers fail; `<Button onClick={navigate()}>` CTAs depend on the handler firing — the class of bug seen earlier on the homepage hero.

---
## 4. State & Data Flow

### 4.1 Auth state

There is **no central auth context or provider**. The only React context in the app is `GeoProvider` (`src/App.tsx:82`); there is no `AuthContext`/`AuthProvider`/`useAuth` (grep for `AuthContext|AuthProvider|useAuth` in `src/` returns only unrelated shadcn UI contexts). Every component/page/hook that needs the current user or session calls the Supabase auth API **independently**.

Call sites (from `grep -rn "getSession\|getUser\|onAuthStateChange" src/`):

- **`onAuthStateChange` subscribers** (each maintains its own reactive auth state):
  - `src/components/SiteHeader.tsx:42` (also `getSession` at :36)
  - `src/components/CakeCreator.tsx:432` (also `getSession` at :461)
  - `src/components/AuthCountrySync.tsx:48` (also `getSession` at :43)
  - `src/hooks/useGalleryInteractions.ts:52` (also `getSession` at :45)
  - `src/hooks/usePartyPackAccess.ts:57` (also `getSession` at :21)
  - `src/hooks/useRazorpayPayment.ts:58` (also `getSession` at :62)
  - `src/pages/Index.tsx:121` (also `getSession` at :166)
  - `src/pages/Auth.tsx:126` (also `getSession` at :179)

- **`getSession` one-shot reads** (for attaching bearer token to edge-function calls / gating): `src/components/PartyPackGenerator.tsx:60`, `PostShareUpgradeModal.tsx:32`, `FeedbackWidget.tsx:57`, `PricingPlans.tsx:80`, `AudioRecorder.tsx:196`, `src/pages/Settings.tsx:71,133,192,252`, `Gallery.tsx:85`, `Pricing.tsx:38`, `PartyPlannerDetail.tsx:780,826,845,900,924`.

- **`getUser` one-shot reads** (mostly to look up the profile / gate premium): `src/components/BlogExitIntentPopup.tsx:67`, `GeoRedirectWrapper.tsx:61`, `ScheduledTasksWidget.tsx:242`, `src/hooks/useRequireCountry.ts:13`, `useAdsEnabled.ts:41`, `usePageTracking.ts:27`, plus the whole family of "cake designer" landing pages (`EgglessCakeDesign.tsx:33`, `WeddingCakeDesigner.tsx:33`, `RakhiCakeIdeas.tsx:33`, `AiBirthdayCakeWithName.tsx:53`, `ThreeDCakeDesigner.tsx:71`, `PersonalizedCakeOnline.tsx:33`, `PhotoCakeMaker.tsx:33`, `AnniversaryCakeDesigner.tsx:33`, `EidCakeDesigner.tsx:33`, `GraduationCakeDesigner.tsx:33`, `Recipes.tsx:48`, `AiCakeGeneratorFree.tsx:60`, `FreeCakeDesigner.tsx:34`), the country landing pages (`CanadaLanding.tsx:60`, `AustraliaLanding.tsx:60`, `UKLanding.tsx:60`, `IndiaLanding.tsx:60`, `USALanding.tsx:57`), and admin/other pages (`Admin.tsx:180`, `AdminLogoGenerator.tsx:55`, `AdminBlogAnalytics.tsx:150`, `Occasions.tsx:69`, `PartyPlanner.tsx:304`, `CompleteProfile.tsx:33`, `Blog.tsx:86`, `BlogPost.tsx:2061`, `PartyPlannerDetail.tsx:617`).

**Propagation:** none via context. Each consumer independently (a) fetches the session/user, (b) re-queries `profiles` for `is_premium`/`country` as needed, and (c) in reactive components subscribes to its own `onAuthStateChange`. Session is used to build the `Authorization: Bearer` header for edge-function calls.

### 4.2 Geo / Country

**Detection sources (priority chain):**
- `GeoContext` (`src/contexts/GeoContext.tsx`) is the app-wide detector, mounted via `GeoProvider` in `src/App.tsx:82`. On mount it: checks a session-storage cache key `geo_detection_done` (`GeoContext.tsx:5,67`); if absent, calls `detectCountry()` which tries the **server edge function `detect-country`** first (`GeoContext.tsx:30-39`, via `supabase.functions.invoke('detect-country')`) and falls back to direct `https://ipapi.co/json/` with a 1.5s timeout (`GeoContext.tsx:42-51`). Result cached to session storage. Exposes `{ detectedCountry, isLoading }` via `useGeoContext()` (`GeoContext.tsx:95`).
- The **`detect-country` edge function** (`supabase/functions/detect-country/index.ts`) resolves client IP from headers, then tries: Cloudflare `cf-ipcountry` header, Vercel/`x-header` geo headers (`index.ts:95-100`); else an in-memory 1h per-IP cache (`index.ts:8,114`); else a provider chain ipapi.co → ip-api.com → ipwho.is (`index.ts:120-130`). Returns `{ country_code, source, fallback }`.

**Region resolution logic** — `src/utils/countryRouting.ts` is the "single source of truth". `resolveRegion()` (`countryRouting.ts:89-108`) priority: (1) URL `?country=` param, (2) current pathname e.g. `/india` (`regionFromPathname`), (3) live geo detection, (4) explicit manual selection from `localStorage` (`getExplicitRegion`, keys `user_country_preference` / `user_country_preference_explicit`), (5) logged-in profile country, (6) `US` fallback. `normalizeRegion` maps raw ISO codes to the 5 supported regions `US/IN/GB/CA/AU`, with Asia-Pacific→AU and Europe-MENA→GB bucketing (`countryRouting.ts:8-9,31-39`).

**Flow / consumers:**
- **`GeoRedirectWrapper`** (`src/components/GeoRedirectWrapper.tsx`, mounted `App.tsx:92`) — redirects only on explicit country landing pages (`/india`, `/usa`, etc.); skips bots (`isSearchBot`), `?noredirect`, admins (checks `has_role` RPC at :63), and `/`. Re-runs its own `detect-country`→ipapi fallback (`:30-50,92`) rather than reading `GeoContext`.
- **`AuthCountrySync`** (`src/components/AuthCountrySync.tsx`, mounted `App.tsx:93`) — consumes `useGeoContext().detectedCountry` and silently backfills `profiles.country` for signed-in users who lack it (typically Google OAuth signups). Maps `GB→UK` (`:19`), runs for current session and on every `SIGNED_IN` event (`:43-52`).
- **`useRequireCountry`** (`src/hooks/useRequireCountry.ts`) — guard hook: if a logged-in user's `profiles.country` is empty, redirects to `/complete-profile` (`:27-30`).
- Pricing/landing consumers of resolved region: `PricingPlans.tsx`, `Pricing.tsx`, `Index.tsx`, and the per-country landing pages (they call `getUser` to gate the auth-checked state and use `countryRouting` helpers).

**Note (inconsistency):** `GeoContext`, `GeoRedirectWrapper`, and `useRequireCountry` each independently re-run detection / query auth rather than sharing one result; `AuthCountrySync` stores country as `UK` while `countryRouting.normalizeRegion` treats `GB` as canonical.

### 4.3 Premium (`is_premium`)

From `grep -rn "is_premium" src/` (excluding the generated `types.ts:1236,1257,1278`). Every read re-queries `profiles.is_premium` directly; there is no shared premium state.

- **`src/components/CakeCreator.tsx:487-498`** — selects `is_premium, country`; sets local `isPremium`. Gates generation limits (free vs premium yearly cap) and premium-only characters (`:702`).
- **`src/hooks/usePartyPackAccess.ts:35-47`** — selects `is_premium, lifetime_access`; `premium = is_premium || lifetime_access`. Gates access to the Party Pack generator.
- **`src/pages/Index.tsx:172-178`** — selects `is_premium`; sets local premium state (used for homepage gating/UI).
- **`src/pages/PartyPlanner.tsx:313-316`** — `is_premium, lifetime_access`; gates AI Party Planner.
- **`src/pages/PartyPlannerDetail.tsx:620-621`** — `is_premium`; gates detail-page premium features.
- **Cake-designer landing pages** — each selects `is_premium` and sets `isPremium` for local gating: `EgglessCakeDesign.tsx:37-38`, `PersonalizedCakeOnline.tsx:37-38`, `EidCakeDesigner.tsx:37-38`, `WeddingCakeDesigner.tsx:37-38`, `AiBirthdayCakeWithName.tsx:57-58`, `Recipes.tsx:52-53`, `RakhiCakeIdeas.tsx:37-38`, `AiCakeGeneratorFree.tsx:64-65`, `ThreeDCakeDesigner.tsx:75-76`, `GraduationCakeDesigner.tsx:37-38`, `FreeCakeDesigner.tsx:43-44`, `AnniversaryCakeDesigner.tsx:37-38`, `PhotoCakeMaker.tsx:37-38`.
- **`src/pages/Admin.tsx`** — admin console: reads `is_premium` across the user list for display/filtering/CSV (`:290,428,433,879,903,917,932,1579-1608`), and **writes** it via `togglePremium` (grant `:714`, revoke `:841`, with a guard `:808` aborting revoke if subscription cancellation fails). This is the primary write site for `is_premium`.

### 4.4 Generation limits

Two independent limit systems, enforced on **both** client (UX) and server (security), tracked in the `generation_tracking` and `generation_rate_limits` tables.

**Server-side enforcement** — `supabase/functions/generate-complete-cake/index.ts` (authoritative):
- Validates the JWT and resolves the user (`:63-88`); rejects missing/invalid tokens (401).
- **Free lifetime limit:** for non-premium users (skipped for single-view regenerations, `:96`), sums all `generation_tracking.count` rows for the user (`:108-117`) and rejects with **403 `generation_limit_reached`** when `totalGenerations >= FREE_TOTAL_LIMIT` (**5**, `:119-126`).
- **Rolling rate limit:** max **10 requests / user / 5 min** via `generation_rate_limits` (`window_start`, `request_count`); returns **429** with `Retry-After: 300` when exceeded, otherwise increments/inserts the window row (`:130-161`).
- Premium users bypass the free-total check but still pass through the rate limiter. (No server-side enforcement of the 150/year premium cap was found — that appears client-only; **unclear:** whether the premium yearly cap is enforced server-side.)

**Client-side gating (UX only)** — `src/components/CakeCreator.tsx`:
- Constants `FREE_TOTAL_LIMIT = 5` (`:216`), `PREMIUM_GENERATION_LIMIT = 150`/year (`:217`), `ADMIN_GENERATION_LIMIT = 500`/year (`:218`).
- Reads/writes `generation_tracking` (`:513,526,552,1366-1409`) to compute `totalGenerations` / yearly `generationCount`.
- Before generating: premium users blocked with a toast at `premiumLimit` (`:682-690`); free users hard-redirected to `/pricing?reason=limit_reached` at `FREE_TOTAL_LIMIT` (`:694-697`); premium-only characters gated at `:702`.
- **`GenerationLimitTracker`** (`src/components/GenerationLimitTracker.tsx`) — pure presentational progress/upsell UI showing `remaining/limit`; drives upgrade CTAs, no enforcement.
- `FreeCakeDesigner.tsx:3` duplicates `FREE_TOTAL_LIMIT = 5` (comment "keep in sync with CakeCreator.tsx") — copy for marketing copy only.

**Other server rate limits (adjacent):** `add-contact-to-brevo` uses a `brevo_anon_rate_limits` table (`index.ts:62-81`); `save-image-to-storage` caps image size at 10MB (`:9`); `save-cake-audio` caps audio at 5MB (`:10`). No `cake_jobs` table reference was found in `src/` or `supabase/functions/` (**unclear:** whether `cake_jobs` exists elsewhere / is used).

---

### Summary

- **Auth is fully decentralized/duplicated**: there is no auth context or `useAuth`; ~60 call sites across pages, components, and hooks each independently call `supabase.auth.getSession`/`getUser`/`onAuthStateChange` and re-query `profiles` for `is_premium`/`country`. The only shared context is `GeoProvider`.
- **Premium is likewise read ad hoc** at ~15 distinct sites (each re-querying `profiles.is_premium`), written only in `Admin.tsx`.
- **Geo detection is redundantly re-run** by `GeoContext`, `GeoRedirectWrapper`, and `useRequireCountry` instead of sharing one result; `countryRouting.resolveRegion` is the canonical resolution helper.
- **Generation limits ARE enforced server-side** in `generate-complete-cake` (free 5-lifetime → 403, plus 10-per-5-min rate limit → 429); the client mirrors these for UX. The 150/year premium cap, however, appears to be client-side only.
## 5. Edge Functions

Location: `supabase/functions/`. There are **36 functions** plus a `_shared/` folder (37 folders total).

Notes on conventions:
- Almost every function creates a Supabase client with `SUPABASE_SERVICE_ROLE_KEY` (service role), so `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are near-universal secrets. Below, "service role" in the Auth column means the function uses the service-role key for its DB work (bypassing RLS), regardless of whether it also validates a caller JWT.
- AI/image/chat calls all go through the Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) using `LOVABLE_API_KEY` — not OpenAI/Anthropic/Replicate directly. Model IDs are centralized in `_shared/ai-models.ts` (all `google/gemini-*` models).
- `verify_jwt` values below come from `supabase/config.toml`. Functions **not listed** in config.toml (grant-referral-bonus, save-cake-audio, search-local-vendors, send-reengagement-sequence, send-vendor-email, generate-vendor-message, unsubscribe-blog) have no explicit `verify_jwt` entry — unclear: default applies (Supabase default is `verify_jwt = true`), though most of these do their own manual auth handling.

### `_shared/`
Provides `ai-models.ts` — a single module exporting model ID constants used by the AI functions:
- `IMAGE_MODEL_FAST = "google/gemini-3.1-flash-image"`
- `IMAGE_MODEL_HQ = "google/gemini-3-pro-image"`
- `IMAGE_MODEL_CHEAP = "google/gemini-2.5-flash-image"`
- `CHAT_MODEL_DEFAULT = "google/gemini-2.5-flash"`
- `IMAGE_FALLBACK_CHAIN = [FAST, HQ, CHEAP]`

No CORS helper or shared auth module is present in `_shared/` — CORS headers are duplicated inline in each function.

### Function-by-function

| Function | Purpose | config.toml `verify_jwt` | Auth model (code) | External APIs | Secrets (`Deno.env.get`) | Referenced from frontend? |
|---|---|---|---|---|---|---|
| add-contact-to-brevo | Adds an email contact to Brevo; supports anonymous (SharedCake) flow with per-IP rate limit (5/hr). | true | Public/anon-capable: requires `Authorization` only when `anonymous` is false; uses service role for admin client. | Brevo (`api.brevo.com/v3/contacts`) | BREVO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/Auth.tsx:231`, `src/pages/SharedCake.tsx:247` |
| analyze-cake-photo | Fallback (preserved for N8N/overlay path) that analyzes a cake photo via AI. | true | No `auth.getUser`; calls AI with `LOVABLE_API_KEY`. Relies on gateway `verify_jwt`. | Lovable AI Gateway | LOVABLE_API_KEY | Yes — `src/utils/cakePhotoOverlay.ts:37` |
| analyze-cake-text | Fallback that analyzes/extracts cake text via AI. | true | No `auth.getUser`; calls AI with `LOVABLE_API_KEY`. | Lovable AI Gateway | LOVABLE_API_KEY | Yes — `src/utils/cakeTextOverlay.ts:62` (direct fetch to `/functions/v1/analyze-cake-text`) |
| cake-generation-watchdog | Cron (every 10 min): auto-fails cake jobs stuck >2 min in 'processing' and emails an alert if failure rate is unhealthy. | false | Public/cron; uses service role. No JWT check in code (relies on being cron-invoked). | Resend (`api.resend.com/emails`) | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY | No (unclear: invoked by pg_cron per header comment; no migration reference found) |
| cancel-razorpay-subscription | Cancels a Razorpay subscription; caller must be owner or admin. | true | JWT: parses `Authorization`, `auth.getUser` via user-scoped client, then service role for admin ops + owner/admin check. | Razorpay (`api.razorpay.com/v1/subscriptions/`) | RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/Admin.tsx:800` |
| check-payment-status | Checks a Razorpay order/payment status for the authenticated user. | true | JWT: `auth.getUser` via user-scoped client; service role for DB. Uses `zod` for input validation. | Razorpay (`api.razorpay.com/v1/orders/`) | RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/hooks/useRazorpayPayment.ts:76` |
| create-razorpay-order | Creates a Razorpay order for the authenticated user. | true | JWT: `auth.getUser` via user-scoped client; service role for DB. `zod` validation. | Razorpay (`api.razorpay.com/v1/orders`) | RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/hooks/useRazorpayPayment.ts:233` |
| create-razorpay-subscription | Creates a Razorpay subscription (10 confirmed monthly/yearly plan IDs). | true | JWT: requires `Authorization`, `auth.getUser` via user-scoped client; service role for DB. `zod` validation. | Razorpay (`api.razorpay.com/v1/subscriptions`) | RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/hooks/useRazorpayPayment.ts:143` |
| delete-user-account | Deletes the authenticated user's account; cancels Razorpay subscriptions first. | true | JWT: `auth.getUser` via user-scoped client; service role to delete. | Razorpay (`api.razorpay.com/v1/subscriptions/`) | RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/Settings.tsx:259` |
| detect-country | Detects the caller's country from IP (in-memory 1hr cache). | false | Public; no auth. | ipapi (`ipapi.co`) | (none) | Yes — `src/components/GeoRedirectWrapper.tsx:32`, `src/contexts/GeoContext.tsx:32` |
| generate-blog-post | Generates a blog post via AI (country-specific topic pools); triggerable by cron or admin. | false | Dual auth: `CRON_SECRET` header OR admin JWT (`auth.getUser`); service role for DB. | Lovable AI Gateway | CRON_SECRET, LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/AdminBlogAnalytics.tsx:394`, `:942` |
| generate-complete-cake | Generates a complete cake (image + details) via AI for the authenticated user. | true | JWT: `auth.getUser(token)`; service role for tracing/DB. `zod` validation. | Lovable AI Gateway | LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/components/CakeCreator.tsx:279` |
| generate-invite-artwork | Generates party-invite artwork via AI (theme→motif/palette mapping). | true | JWT: parses `Authorization`; service role client. AI via `LOVABLE_API_KEY`. | Lovable AI Gateway | LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/PartyPlannerDetail.tsx:652`, `:1025` |
| generate-invite-copy | Generates party-invite text/copy via AI. | true | JWT: parses `Authorization`; service role client. AI via `LOVABLE_API_KEY`. | Lovable AI Gateway | LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/PartyPlannerDetail.tsx:995` |
| generate-logo | Generates a logo image via AI (admin tool). | true | No `auth.getUser` in code; relies on gateway `verify_jwt`. AI via `LOVABLE_API_KEY`. | Lovable AI Gateway | LOVABLE_API_KEY | Yes — `src/pages/AdminLogoGenerator.tsx:80` |
| generate-party-pack | Generates a party pack (assets) via AI for the authenticated user. | true | JWT: `auth.getUser(token)`; service role for DB. `zod` validation. | Lovable AI Gateway | LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/components/PartyPackGenerator.tsx:69` |
| generate-vendor-message | Generates a vendor outreach message via AI. | (not in config.toml) | JWT: parses `Authorization`; service role client. AI via `LOVABLE_API_KEY`. | Lovable AI Gateway | LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/PartyPlannerDetail.tsx:848` |
| grant-referral-bonus | Grants referral bonus generations to a referrer on signup. | (not in config.toml) | Service role only; no `auth.getUser` in code. | (none — Supabase DB only) | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/Auth.tsx:332` |
| party-planner-chat | Party-planner AI chat assistant. | true | JWT: parses `Authorization`; service role client. AI via `LOVABLE_API_KEY`. | Lovable AI Gateway | LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/PartyPlannerDetail.tsx:783` |
| razorpay-webhook | Receives Razorpay webhooks; verifies signature and updates payment/subscription state. | false | Public webhook; verifies `x-razorpay-signature` using `RAZORPAY_KEY_SECRET`; service role for DB. | Supabase REST (service-role Bearer calls) | RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | No (called by Razorpay, not frontend) |
| save-cake-audio | Saves a user's cake audio recording (≤5MB) to storage. | (not in config.toml) | JWT: parses `Authorization`, `auth.getUser(token)` via service-role admin client. | (none — Supabase storage only) | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/components/AudioRecorder.tsx:219` |
| save-image-to-storage | Downloads a generated image from allowed AI CDNs (≤10MB) and stores it. | true | JWT: `auth.getUser(token)`; service role for storage. | AI model CDNs (image download; allowlisted hosts) | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/components/CakeCreator.tsx:1297` |
| search-local-vendors | Searches local vendors via Google Places; per-user 20/day rate limit. | (not in config.toml) | JWT: parses `Authorization`, `auth.getUser(token)` via service-role admin client. | Google Places (`places.googleapis.com/v1/places`) | GOOGLE_PLACES_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/components/PartyVendorDirectory.tsx:39` |
| send-anniversary-reminders | Sends anniversary reminder emails (cron or admin-triggered). | false | Dual auth: `CRON_SECRET` OR user JWT (`auth.getUser`); service role for DB. | Resend (`Resend` npm SDK) | CRON_SECRET, RESEND_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/components/ScheduledTasksWidget.tsx:223` |
| send-engagement-drip | Sends engagement drip emails via Brevo (cron). | false | `CRON_SECRET` check + optional `auth.getUser`; service role for DB. | Brevo (`api.brevo.com/v3/smtp/email`) | BREVO_API_KEY, CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/components/ScheduledTasksWidget.tsx:206` |
| send-party-invite | Sends party invite emails to guests. | true | JWT: parses `Authorization`; service role for DB. | Resend (`Resend` npm SDK) | RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/PartyPlannerDetail.tsx:903`, `:927` |
| send-premium-emails | Sends premium/marketing email campaigns via Brevo (admin). | false | Parses `Authorization`, `auth.getUser(token)`; service role for DB. | Brevo (`api.brevo.com/v3/smtp/email`) | BREVO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/Admin.tsx:736`, `:821` |
| send-reengagement-sequence | Sends re-engagement email sequence via Brevo (cron). | (not in config.toml) | `CRON_SECRET` check + optional `auth.getUser`; service role for DB. | Brevo (`api.brevo.com/v3/smtp/email`) | BREVO_API_KEY, CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | No (unclear: appears cron-driven; not found in `src/` or migrations) |
| send-vendor-email | Sends an email to a vendor via Resend. | (not in config.toml) | JWT: parses `Authorization`; service role for DB. | Resend (`api.resend.com/emails`) | RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/PartyPlannerDetail.tsx:829` |
| send-weekly-blog-digest | Sends weekly blog digest emails (cron or admin). | false | Dual auth: `CRON_SECRET` OR admin JWT (`auth.getUser`); service role for DB. | Resend (`Resend` npm SDK) | CRON_SECRET, RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/AdminBlogAnalytics.tsx:376` |
| send-weekly-upgrade-nudge | Sends weekly upgrade-nudge emails via Brevo (cron or admin). | false | Dual auth: `CRON_SECRET` OR JWT (`auth.getUser`); service role for DB. | Brevo (`api.brevo.com/v3/smtp/email`) | BREVO_API_KEY, CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/components/ScheduledTasksWidget.tsx:247`, `src/pages/Admin.tsx:862`, `:887` |
| send-welcome-email | Sends a welcome email via Resend to a new/authenticated user. | true | JWT: parses `Authorization`, `auth.getUser(token)`; service role for DB. | Resend (`Resend` npm SDK) | RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | No direct `invoke` found (referenced only in a comment at `src/pages/Auth.tsx:342`; unclear how it is triggered) |
| test-premium-email | Test harness to send a premium email; gated by a test secret. | false | Custom secret: requires `x-test-secret` header matching `TEST_EMAIL_SECRET`; service role. | (none directly; unclear — test path) | TEST_EMAIL_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | No |
| test-weekly-digest | Test harness for the weekly digest email; gated by a test secret. | false | Custom secret: requires `x-test-secret` matching `TEST_EMAIL_SECRET`; service role. | Resend (`Resend` npm SDK) | TEST_EMAIL_SECRET, RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | No |
| unsubscribe-blog | Unsubscribes an email from the blog digest list. | (not in config.toml) | Service role only; no `auth.getUser` (public unsubscribe link). | (none — Supabase DB only) | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/pages/BlogUnsubscribe.tsx:29`, `:58` |
| verify-razorpay-payment | Verifies a Razorpay payment signature and finalizes the order/subscription. | true | JWT: `auth.getUser` via user-scoped client; verifies signature with `RAZORPAY_KEY_SECRET`; service role for DB. `zod` validation. | Razorpay (signature verification; no outbound fetch to Razorpay observed) | RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Yes — `src/hooks/useRazorpayPayment.ts:289` |

### Summary

- **Auth (config.toml `verify_jwt`):** of the 29 functions with explicit entries, **17 are `verify_jwt = true`** and **12 are `verify_jwt = false`** (public/cron/webhook). **7 functions have no config.toml entry** (grant-referral-bonus, save-cake-audio, search-local-vendors, send-reengagement-sequence, send-vendor-email, generate-vendor-message, unsubscribe-blog) — Supabase's default is `verify_jwt = true`, but most of these do manual auth.
- **Service role:** the overwhelming majority (all but `analyze-cake-photo`, `analyze-cake-text`, `generate-logo`, and `detect-country`) use `SUPABASE_SERVICE_ROLE_KEY`. Public-facing/cron functions typically gate access with a `CRON_SECRET` header, a Razorpay/`x-razorpay-signature` check, or a `TEST_EMAIL_SECRET` (`x-test-secret`) header instead of JWT.
- **Most common external APIs:** the **Lovable AI Gateway** (`ai.gateway.lovable.dev`, via `LOVABLE_API_KEY`) is used by ~10 functions and is the dominant AI provider (all Gemini models); **Brevo** (~5) and **Resend** (~5) split the transactional/marketing email traffic; **Razorpay** (~6) handles payments/subscriptions; **Google Places** and **ipapi** appear once each. No direct OpenAI/Anthropic/Replicate usage.
- **Frontend linkage:** most functions are invoked from `src/` via `supabase.functions.invoke(...)` (two use direct `fetch` to `/functions/v1/...`). Non-frontend functions are cron/webhook/test-only: `cake-generation-watchdog`, `razorpay-webhook`, `send-reengagement-sequence`, `test-premium-email`, `test-weekly-digest`, and `send-welcome-email` (trigger mechanism unclear).
## 6. Database

Source of truth: `src/integrations/supabase/types.ts` (`public` schema) for tables/columns/views/functions/enums; `supabase/migrations/*.sql` (107 files) for RLS policies, functions and triggers.

### 6.1 Tables (from types.ts `Tables`, Row types)

Column format: `name: type`. `Json` = jsonb, `string` includes text/uuid/timestamptz/date, `number` = int/numeric.

| Table | Columns |
| --- | --- |
| achievements | achievement_type: string, id: string, unlocked_at: string, user_id: string |
| activity_feed | activity_type: string, created_at: string, id: string, message: string, user_id: string\|null |
| blog_post_views | id: string, post_id: string, referrer: string\|null, session_id: string\|null, user_agent: string\|null, viewed_at: string\|null |
| blog_posts | ai_disclosure, author_name, category, content, created_at, excerpt, featured_image, id, image_alt, is_ai_generated: boolean, is_published: boolean, keywords: string[], meta_description, published_at, read_time, slug, target_country, title |
| blog_subscribers | digest_frequency, email, first_name, id, is_active: boolean, last_digest_sent_at, last_name, subscribed_at, unsubscribe_token, unsubscribed_at, user_id |
| brevo_anon_rate_limits | id: string, ip: string, request_count: number, window_start: string |
| cake_generation_attempts | client_attempt_id, client_finished_at, client_started_at, created_at, error_message, has_photo: boolean, id, job_id, outcome, photo_bytes: number, quality, user_agent, user_id |
| cake_generation_events | created_at, elapsed_ms: number, error_message, id: number, meta: Json, request_id, stage, user_id |
| cake_generation_jobs | cake_style, completed_at, created_at, error_message, greeting_message, hero_error, hero_url, hero_view, id, request_id, side_error, side_url, status, top_error, top_url, updated_at, user_id, view_count: number |
| cake_recipes | cook_time, country, created_at, difficulty, excerpt, hero_image, id, ingredients: Json, is_published: boolean, meta_description, meta_title, prep_time, related_cake_design_prompt, servings, slug, steps: Json, story, title, updated_at |
| client_errors | component, component_stack, created_at, error_message, error_name, id, stack, user_agent |
| email_sequence_log | id: string, sent_at: string, sequence_type: string, user_id: string |
| engagement_email_logs | created_at, email_type, id, sent_at, user_id |
| feedback | category, created_at, feedback_type, id, message, page_url, rating: number, user_id |
| founding_members | created_at, display_on_wall: boolean, id, member_number, price_paid: number, purchased_at, special_badge, tier, user_id |
| gallery_comments | content, created_at, id, image_id, updated_at, user_id |
| gallery_image_stats | comment_count: number, created_at, id, image_id, like_count: number, updated_at |
| gallery_likes | created_at, id, image_id, user_id |
| generated_images | audio_duration_seconds: number, audio_mime_type, audio_url, created_at, featured: boolean, featured_page, featured_pages: string[], id, image_url, message, message_type, occasion_date, occasion_type, prompt, recipient_name, share_group_id, user_id, view_type |
| generation_rate_limits | id: string, request_count: number, user_id: string, window_start: string |
| generation_tracking | count: number, created_at, id, month: number, updated_at, user_id, year: number |
| holiday_sales | banner_text, country_code, created_at, end_date, holiday_emoji, holiday_name, id, is_active: boolean, priority: number, sale_label, start_date, updated_at |
| page_visits | country_code, id, page_path, referrer, session_id, user_agent, user_id, visited_at |
| parties | budget: number, cake_image_id, child_age: number, city, contact_email, contact_phone, created_at, custom_questions: Json, event_date, event_timezone, guest_count: number, id, invite_artwork_meta: Json, invite_artwork_url, invite_headline, invite_message, notes, occasion, public_slug, rsvp_deadline, status, theme, title, updated_at, user_id, venue |
| party_chat_messages | content, created_at, id, party_id, role |
| party_guests | created_at, custom_answers: Json, email, id, invited_at, meal_preference, name, notes, party_id, plus_one_names: Json, plus_ones: number, responded_at, rsvp_status, rsvp_token |
| party_pack_purchases | amount_paid: number, country, created_at, currency, first_week_discount_applied: boolean, id, party_pack_id, razorpay_order_id, razorpay_payment_id, tier, user_id |
| party_packs | banner_url, cake_image_id, cake_topper_url, created_at, id, invitation_url, place_cards_url, thank_you_card_url, user_id |
| party_tasks | actual_cost: number, category, created_at, currency, description, due_date, estimated_cost: number, id, is_completed: boolean, party_id, sort_order: number, title, vendor_contacted_at, vendor_email, vendor_message, vendor_name, vendor_notes, vendor_phone, vendor_status |
| profiles | bonus_generations: number, country, created_at, current_streak: number, email, first_name, founding_member_number, founding_tier, id, is_founding_member: boolean, is_premium: boolean, last_generation_date, last_name, lifetime_access: boolean, premium_until, purchased_date, subscription_id, subscription_status, updated_at |
| referral_bonuses | bonus_granted: boolean, created_at, id, referred_by, user_id |
| referrals | completed_at, created_at, expires_at, id, referred_email, referred_user_id, referrer_id, reward_days: number, status |
| reminder_logs | created_at, id, image_id, reminder_date, sent_at, user_id |
| scheduled_task_runs | completed_at, created_at, error_message, id, records_processed: number, result_message, started_at, status, task_name |
| site_settings | id, key, updated_at, updated_by, value: Json |
| subscriptions | amount: number, created_at, currency, current_period_end, current_period_start, id, razorpay_plan_id, razorpay_subscription_id, status, tier, updated_at, user_id |
| system_alert_log | alert_type, details: Json, id, sent_at |
| upgrade_nudge_logs | created_at, id, sent_at, template_variant: number, user_id, week_number: number |
| user_occasions | created_at, id, notes, occasion_date, occasion_type, person_name, user_id |
| user_roles | created_at, id, role: app_role enum, user_id |
| user_settings | anniversary_reminders: boolean, birthday_reminders: boolean, blog_digest_emails: boolean, created_at, email_reminders: boolean, id, marketing_emails: boolean, reengagement_emails: boolean, updated_at, user_id |
| vendor_search_usage | created_at, id, location, query, result_count: number, user_id |

Table count: 41.

### 6.2 Views (from types.ts `Views`)

- `public_blog_stats` — columns: post_id, view_count (aggregated per-post view counts).
- `public_featured_images` — columns: created_at, featured_page, featured_pages: string[], id, image_url, message, occasion_type, recipient_name (public-safe subset of `generated_images`).

### 6.3 Enums

- `app_role`: `admin` | `moderator` | `user`.

### 6.4 RPC / Functions

From types.ts `Functions`, cross-checked against migration definitions. Several `get_public_cake` / `get_available_spots` / `add_activity_feed` definitions appear across multiple migrations (redefined/iterated over time).

| Function | Args → Returns | Notes |
| --- | --- | --- |
| `add_activity_feed` | (p_activity_type, p_message) → void | Inserts an activity_feed row (SECURITY DEFINER). |
| `get_available_spots` | () → Json | SECURITY DEFINER. Returns founding-member spot availability; a later migration removes the cap. |
| `get_guest_by_token` | (p_token) → Json | STABLE. Fetches a party guest record by RSVP token (bypasses direct table access). |
| `get_party_public` | (p_slug) → Json | Returns public party data by slug. |
| `get_public_cake` | (p_id) → TABLE(id, image_url, recipient_name, message, occasion_type, audio_url, audio_duration_seconds, created_at, sender_name, share_group_id, sibling_image_urls[]) | STABLE SECURITY DEFINER. Public-safe read of a shared cake + its sibling images. |
| `get_user_role` | (_user_id) → app_role | SECURITY DEFINER role lookup. |
| `has_role` | (_user_id, _role) → boolean | SECURITY DEFINER; used throughout RLS admin policies. |
| `link_session_visits_to_user` | (p_session_id, p_user_id) → void | SECURITY DEFINER; attaches anonymous page_visits to a user on login. |
| `rsvp_by_token` | (p_token, p_status, p_meal_preference?, p_plus_ones?, p_plus_one_names?, p_custom_answers?) → boolean | Records an RSVP via token without auth. |

Additional functions defined in migrations but not exposed in types.ts `Functions` (triggers / internal):
- `handle_new_user()` — SECURITY DEFINER trigger on auth.users; creates a profiles row (redefined across several migrations).
- `handle_new_user_settings()` — SECURITY DEFINER trigger; creates a user_settings row for new profile/user.
- `update_updated_at_column()` — generic `updated_at` timestamp trigger.
- `enforce_image_limit()` — SECURITY DEFINER trigger on generated_images; enforces a per-user image cap, bypassed for admins (checks user_roles).
- `update_gallery_like_count()` / `update_gallery_comment_count()` — SECURITY DEFINER triggers maintaining gallery_image_stats counters.
- `check_page_visit_rate_limit()` — trigger enforcing a rate limit on page_visits inserts.

### 6.5 RLS Policies

RLS is broadly and consistently applied. All 41 tables have `ENABLE ROW LEVEL SECURITY` (36 via standard `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` migrations plus `blog_post_views`, `scheduled_task_runs`, `client_errors`, `brevo_anon_rate_limits`, `generation_rate_limits`, `email_sequence_log` via their own migrations). No table was found with RLS enabled but zero policies. Storage bucket policies also exist (cake images, party pack items, party invite artwork, cake audio).

Per-table access rule summary (grouped; USING/WITH CHECK gist):

- **Owner-scoped (user_id = auth.uid()) with admin override** — typical pattern of "Users can view/insert/update/delete their own X" plus "Admins can view/manage all X" (admin via `has_role(auth.uid(),'admin')`):
  - achievements (users SELECT own; system/admin manage)
  - activity_feed (anyone SELECT; system/admin manage inserts)
  - engagement_email_logs, upgrade_nudge_logs (user SELECT own; service_role manages)
  - feedback (user full CRUD on own; admin SELECT all)
  - generated_images (user CRUD own; anyone view featured/cake images; admin view/update/delete all)
  - generation_tracking (user CRUD own; admin view/delete all)
  - party_packs, party_pack_purchases (user manage/view own; service_role manages purchases; admin view all)
  - reminder_logs (user CRUD own; system insert)
  - subscriptions (user SELECT + UPDATE own; admin full manage)
  - user_settings (user CRUD own)
  - vendor_search_usage (user SELECT own)
  - profiles (user SELECT+UPDATE own; admin SELECT all, UPDATE any)
  - user_roles (user SELECT own; admin insert/update/delete — role changes admin-only)

- **Owner via parent (party ownership)** — parties, party_tasks, party_chat_messages, party_guests are gated on the owning party's user_id ("Owners manage their ..."). Plus public read paths: parties public "view by slug"; party_guests public read/RSVP-update by token.

- **Public-read tables** — blog_posts (anyone read published; admins read all + manage; service_role manage), cake_recipes (anyone view published; admin manage), holiday_sales (anyone read active; admin manage), site_settings (anyone SELECT; admin write), gallery_comments/gallery_likes/gallery_image_stats (anyone SELECT; authenticated users insert their own comment/like; users edit/delete own; admins delete any comment).

- **Insert-mostly / anonymous-tracking tables** — blog_post_views (anyone insert + view stats; admin view all), page_visits (anyone record; admin view all; rate-limit trigger), blog_subscribers (anyone subscribe/unsubscribe-by-email; owner/admin unsubscribe; admin view all), client_errors (insert-only policy).

- **Service-role-only tables** — brevo_anon_rate_limits ("service_role_only"), generation_rate_limits ("service_role_only"), email_sequence_log ("Service role full access"), scheduled_task_runs (service_role manage; admin read), system_alert_log (admin SELECT only), cake_generation_jobs (service_role manages; user CRUD own), cake_generation_attempts (service_role ALL; user manages own), cake_generation_events (user SELECT own; admin SELECT all).

- **Referrals** — referrals & referral_bonuses: users create/view their own referrals; referred users can view their referral; service_role/admin manage/update.

- **Founding members** — users view their own record (and a "view all founding members" public/wall path); system/admin insert; admin update.

Sensitive-data note: `subscriptions` and `party_pack_purchases` hold Razorpay payment/order/subscription IDs; both have RLS restricting reads to the owning user (+ admin), with writes reserved for service_role/admin — no gaps found. No sensitive table was found lacking RLS.

---

### Summary

The `public` schema has 41 tables plus 2 views (`public_blog_stats`, `public_featured_images`) and one enum (`app_role`). RLS is broadly and uniformly applied — every table has row-level security enabled with matching policies (no enabled-but-unpolicied or unprotected sensitive tables found); the dominant pattern is owner-scoped access (`user_id = auth.uid()`) with an admin override via the SECURITY DEFINER `has_role()` helper. Notable RPCs are all SECURITY DEFINER: `has_role`/`get_user_role` (auth), `get_public_cake`/`get_party_public`/`get_guest_by_token`/`rsvp_by_token` (public token/slug access bypassing direct table reads), `get_available_spots`, and trigger functions `handle_new_user`, `enforce_image_limit` (per-user image cap), and gallery counter maintainers. Rate limiting is handled by dedicated service-role-only tables (`generation_rate_limits`, `brevo_anon_rate_limits`) plus a `check_page_visit_rate_limit()` trigger on `page_visits`.
## 7. Theme & Design Tokens

Sources: `tailwind.config.ts`, `src/index.css`.

Theme model: Tailwind `colors` map to `hsl(var(--token))` references (`tailwind.config.ts` lines 16–98). Actual values live as CSS custom properties in `src/index.css` `:root` (light, lines 10–96) and `.dark` (dark, lines 98–134). Dark mode is class-based (`darkMode: ["class"]`, config line 4). All colour values are HSL triplets (no `hsl()` wrapper stored in the vars; the wrapper is applied at usage).

### 7.1 Colour Tokens

Note on dark mode: `.dark` only overrides the shadcn base tokens (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, and sidebar-*). The custom cake tokens (gold, silver, party-*, surface, success, warning, info, brand-*) have NO dark override — they keep their light values in dark mode.

#### Base / shadcn semantic tokens

| Token (Tailwind) | CSS var | Light value (HSL) | Dark value (HSL) | Semantic role |
|---|---|---|---|---|
| `background` | `--background` | `35 50% 98%` (warm cream) | `222.2 84% 4.9%` | Background |
| `foreground` | `--foreground` | `35 15% 15%` | `210 40% 98%` | Text |
| `card` | `--card` | `0 0% 100%` | `222.2 84% 4.9%` | Background (card surface) |
| `card-foreground` | `--card-foreground` | `35 15% 15%` | `210 40% 98%` | Text (on card) |
| `popover` | `--popover` | `0 0% 100%` | `222.2 84% 4.9%` | Background (popover) |
| `popover-foreground` | `--popover-foreground` | `35 15% 15%` | `210 40% 98%` | Text (on popover) |
| `primary` | `--primary` | `315 88% 62%` (party pink) | `210 40% 98%` | Accent (bg + text); used for both |
| `primary-foreground` | `--primary-foreground` | `0 0% 100%` | `222.2 47.4% 11.2%` | Text (on primary) |
| `secondary` | `--secondary` | `45 90% 58%` (gold) | `217.2 32.6% 17.5%` | Accent (bg + text); used for both |
| `secondary-foreground` | `--secondary-foreground` | `35 15% 15%` | `210 40% 98%` | Text (on secondary) |
| `muted` | `--muted` | `35 20% 95%` | `217.2 32.6% 17.5%` | Background (muted surface) |
| `muted-foreground` | `--muted-foreground` | `35 12% 45%` | `215 20.2% 65.1%` | Text (secondary/muted text) |
| `accent` | `--accent` | `270 85% 72%` (party purple) | `217.2 32.6% 17.5%` | Accent (bg + text) |
| `accent-foreground` | `--accent-foreground` | `0 0% 100%` | `210 40% 98%` | Text (on accent) |
| `destructive` | `--destructive` | `0 84% 60%` | `0 62.8% 30.6%` | Accent/status (bg + text) |
| `destructive-foreground` | `--destructive-foreground` | `0 0% 98%` | `210 40% 98%` | Text (on destructive) |
| `border` | `--border` | `35 25% 90%` | `217.2 32.6% 17.5%` | Border |
| `input` | `--input` | `35 25% 90%` | `217.2 32.6% 17.5%` | Border (input outline) |
| `ring` | `--ring` | `315 88% 62%` | `212.7 26.8% 83.9%` | Border (focus ring) |

#### Custom cake theme tokens (no dark override — light values apply in both modes)

| Token (Tailwind) | CSS var | Value (HSL) | Semantic role |
|---|---|---|---|
| `gold` (DEFAULT) | `--gold` | `45 90% 58%` | Accent (bg + text); brand |
| `gold-muted` | `--gold-muted` | `45 65% 48%` | Accent (muted gold) |
| `silver` (DEFAULT) | `--silver` | `0 0% 75%` | Accent |
| `silver-muted` | `--silver-muted` | `0 0% 65%` | Accent (muted silver) |
| `party.pink` | `--party-pink` | `315 88% 62%` | Accent (bg + text); brand — same as primary |
| `party.purple` | `--party-purple` | `270 85% 72%` | Accent — same as accent |
| `party.coral` | `--party-coral` | `15 90% 68%` | Accent |
| `party.mint` | `--party-mint` | `150 55% 68%` | Accent |
| `party.gold` | `--party-gold` | `45 90% 58%` | Accent (same value as gold) |
| `party.orange` | `--party-orange` | `30 90% 60%` | Accent |
| `surface` (DEFAULT) | `--surface` | `35 40% 97%` | Background (surface) |
| `surface.elevated` | `--surface-elevated` | `0 0% 100%` | Background (elevated surface) |

#### Semantic status tokens (no dark override)

| Token (Tailwind) | CSS var | Value (HSL) | Semantic role |
|---|---|---|---|
| `success` (DEFAULT) | `--success` | `150 60% 42%` | Status accent (bg) |
| `success-foreground` | `--success-foreground` | `0 0% 100%` | Text (on success) |
| `warning` (DEFAULT) | `--warning` | `45 90% 48%` | Status accent (bg) |
| `warning-foreground` | `--warning-foreground` | `35 15% 15%` | Text (on warning) |
| `info` (DEFAULT) | `--info` | `270 75% 58%` | Status accent (bg) |
| `info-foreground` | `--info-foreground` | `0 0% 100%` | Text (on info) |

#### Brand (social-sharing) tokens (no dark override)

| Token (Tailwind) | CSS var | Value (HSL) | Semantic role |
|---|---|---|---|
| `brand.whatsapp` | `--brand-whatsapp` | `142 70% 42%` | Brand accent |
| `brand.pinterest` | `--brand-pinterest` | `351 78% 49%` | Brand accent |
| `brand.facebook` | `--brand-facebook` | `221 44% 41%` | Brand accent |
| `brand.twitter` | `--brand-twitter` | `0 0% 9%` | Brand accent |

#### Sidebar tokens (light + dark)

| Token (Tailwind) | CSS var | Light value | Dark value | Role |
|---|---|---|---|---|
| `sidebar` (DEFAULT) | `--sidebar-background` | `0 0% 98%` | `240 5.9% 10%` | Background |
| `sidebar.foreground` | `--sidebar-foreground` | `240 5.3% 26.1%` | `240 4.8% 95.9%` | Text |
| `sidebar.primary` | `--sidebar-primary` | `240 5.9% 10%` | `224.3 76.3% 48%` | Accent |
| `sidebar.primary-foreground` | `--sidebar-primary-foreground` | `0 0% 98%` | `0 0% 100%` | Text |
| `sidebar.accent` | `--sidebar-accent` | `240 4.8% 95.9%` | `240 3.7% 15.9%` | Accent/bg |
| `sidebar.accent-foreground` | `--sidebar-accent-foreground` | `240 5.9% 10%` | `240 4.8% 95.9%` | Text |
| `sidebar.border` | `--sidebar-border` | `220 13% 91%` | `240 3.7% 15.9%` | Border |
| `sidebar.ring` | `--sidebar-ring` | `217.2 91.2% 59.8%` | `217.2 91.2% 59.8%` | Border (focus ring) |

Total distinct colour tokens (Tailwind color keys / CSS colour vars): 55 colour-valued custom properties in `:root` (excludes gradients, shadows, `--radius`).

### 7.2 Gradients

Defined as CSS vars in `:root` (`src/index.css` lines 69–72) and exposed as Tailwind `backgroundImage` utilities `bg-gradient-*` (`tailwind.config.ts` lines 104–109):

| Utility | CSS var | Definition |
|---|---|---|
| `bg-gradient-gold` | `--gradient-gold` | `linear-gradient(135deg, hsl(45 90% 58%), hsl(30 90% 63%))` |
| `bg-gradient-surface` | `--gradient-surface` | `linear-gradient(135deg, hsl(35 40% 97%), hsl(35 30% 95%))` |
| `bg-gradient-party` | `--gradient-party` | `linear-gradient(135deg, hsl(315 88% 62%), hsl(270 85% 72%), hsl(45 90% 58%))` |
| `bg-gradient-celebration` | `--gradient-celebration` | `linear-gradient(45deg, hsl(315 88% 82%), hsl(270 85% 82%), hsl(45 90% 82%))` |

Additional inline gradients (in CSS classes, not `bg-gradient-*` utilities):
- `.shimmer` — `linear-gradient(90deg, transparent, hsl(var(--party-pink) / 0.2), transparent)` (index.css 257–262).
- `.animate-rainbow-shimmer` — `linear-gradient(90deg, hsl(var(--party-pink)), hsl(var(--party-purple)), hsl(var(--gold)), hsl(var(--party-pink)))` (index.css 334).
- `.btn-shimmer::before` — `linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.3), transparent)` (index.css 446–451).

Shadows (Tailwind `boxShadow`, config lines 110–114, backed by CSS vars 75–77):
- `shadow-elegant` = `0 20px 40px -12px hsl(315 45% 65% / 0.25)`
- `shadow-gold` = `0 8px 32px hsl(45 90% 55% / 0.35)`
- `shadow-party` = `0 12px 40px hsl(315 75% 65% / 0.3)`

### 7.3 Custom Utility / Component Classes

All in `@layer components` in `src/index.css`.

| Class | What it does |
|---|---|
| `.candle-flame` | Applies `animate-flame-flicker`; `blur(0.5px)`, transform-origin bottom center (162). |
| `.candle-flame-large` | Applies `animate-flame-dance`; `blur(0.3px)` (168). |
| `.candle-glow` | Applies `animate-candle-glow` (174). |
| `.floating-flame` | Flame emoji: flame-flicker + pulse-glow animations, gold drop-shadow glow (179). |
| `.dancing-flame` | Like floating-flame but flame-dance + pulse-glow, purple (`280 80% 60%`) glow (187). |
| `.bounce-slow` | `bounce 3s ease-in-out infinite` (defined twice, 205 and 366). |
| `.pulse-glow` | `pulse-glow 2s ease-in-out infinite` (box-shadow pink/purple glow) (210). |
| `.float` | `float 3s ease-in-out infinite` (translateY -10px bob) (224). |
| `.animate-wall-bob` | `wall-bob 5s` gentle vertical bob; disabled under reduced-motion (246). |
| `.shimmer` | Moving pink shimmer gradient (200% bg, `shimmer 2s infinite`) (256). |
| `.animate-float-up` | `float-up 10s` — rises full viewport + rotates 360deg (325). |
| `.animate-sparkle` | `sparkle 1.5s` scale/opacity pop (329). |
| `.animate-rainbow-shimmer` | Rainbow gradient bg + `rainbow-shimmer 3s linear infinite` (333). |
| `.animate-confetti` | `confetti-fall 6s linear infinite`; reduced-motion disables (339). |
| `.animate-sparkle-fade` | `sparkle-fade 0.8s ease-out forwards` (one-shot) (362). |
| `.carousel-dot` | `w-2 h-2 rounded-full bg-muted` with transition (371). |
| `.carousel-dot.active` | Widens to `w-8` and `bg-primary` (375). |
| `.touch-none` | `touch-action: none` (380). |
| `.select-none` | Disables user text selection (webkit + std) (384). |
| `html.scroll-locked` / `html.scroll-locked body` | iOS-safe scroll lock (fixed position, hidden overflow) (414–425). |
| `.btn-shimmer` | Relative + overflow-hidden container; `::before` sweeps a white 30% shimmer across via `btn-shimmer-slide 2.5s` (434). |
| `.icon-hover-glow` | Transition on transform/filter; on `.group:hover` gets pink drop-shadow glow + scale 1.1 (462–469). |
| `.flame-outer` | `flame-flicker-outer 0.55s` — realistic outer flame flicker (534). |
| `.flame-inner` | `flame-flicker-inner 0.4s` — inner flame flicker (540). |
| `.flame-halo` | `flame-halo-pulse 1.6s` — glow halo pulse; pointer-events none (546). |
| `.smoke-wisp` | `smoke-rise 2.2s` — rising/fading smoke; pointer-events none (569). |

Note: shimmer/btn-shimmer-style `text-shimmer` and a standalone `shadow-gold` utility class were asked about — `shadow-gold` exists only as a Tailwind `boxShadow` key (config, usable as `shadow-gold`), NOT as a hand-written `@layer` class. No `text-shimmer` class exists (unclear: no such utility found).

Base-layer styling (`@layer base`, index.css 137–158): global `border-border` on `*`; body uses `bg-background text-foreground` with Inter font + `cv11`/`ss01` font-features; `h1/h2/h3` use Fraunces serif with `ss01`/`ss02` and `-0.02em` letter-spacing.

Fonts (config 100–103): `font-display` = Fraunces (serif), `font-sans` = Inter.

Border radius (config 115–119): `--radius: 0.75rem`; `lg` = radius, `md` = radius−2px, `sm` = radius−4px.

### 7.4 Animations (keyframes + utilities)

Keyframes defined in `tailwind.config.ts` (`theme.extend.keyframes`, lines 120–206), exposed via `animation` (207–214):

| Animation utility | Keyframes | Timing |
|---|---|---|
| `animate-accordion-down` | `accordion-down` (height 0 → content-height) | `0.2s ease-out` |
| `animate-accordion-up` | `accordion-up` (content-height → 0) | `0.2s ease-out` |
| `animate-flame-flicker` | `flame-flicker` (scale/rotate/opacity flicker) | `3.5s ease-in-out infinite` |
| `animate-flame-dance` | `flame-dance` (translateY/scale/rotate) | `4s ease-in-out infinite` |
| `animate-candle-glow` | `candle-glow` (box-shadow glow pulse) | `2s ease-in-out infinite` |
| `animate-sparkle` (config) | `sparkle` (brightness/drop-shadow flicker) | `2s ease-in-out infinite` |

Note: `sparkle` is defined BOTH in config (brightness/drop-shadow, 2s) and in index.css (opacity/scale, used by `.animate-sparkle` at 1.5s). These are two different `@keyframes sparkle` definitions — potential conflict (unclear which wins; CSS `.animate-sparkle` class references the index.css one). Similarly `pulse-glow` `@keyframes` is defined twice in index.css (195 drop-shadow version, 214 box-shadow version) — the later definition overrides for `.pulse-glow`.

Keyframes defined only in `src/index.css` `@layer components`: `pulse-glow` (×2), `float`, `wall-bob`, `shimmer`, `float-up`, `sparkle`, `rainbow-shimmer`, `confetti-fall`, `sparkle-fade`, `btn-shimmer-slide`, `flame-flicker-outer`, `flame-flicker-inner`, `flame-halo-pulse`, `smoke-rise`. Plus reference to built-in `bounce` (via `.bounce-slow`).

Reduced-motion: `@media (prefers-reduced-motion: reduce)` disables `.animate-wall-bob`, `.animate-confetti`, and the realistic flame set (`.flame-outer/.flame-inner/.flame-halo/.smoke-wisp`).

---

**Summary:** The theme defines ~55 colour tokens as HSL CSS custom properties consumed via `hsl(var(--token))` in `tailwind.config.ts`. Core brand palette is a warm-cream celebratory theme: party-pink (`315 88% 62%`, = primary), party-purple (`270 85% 72%`, = accent), and gold (`45 90% 58%`, = secondary), plus supporting party colours (coral/mint/orange), silver, status (success/warning/info), and social brand colours. Dark mode (`.dark`) overrides only the shadcn base + sidebar tokens; the custom cake/party/status/brand tokens have no dark values and stay constant. Notable custom utilities include `.btn-shimmer` (CSS-only sweeping shine), `.shimmer`/`.animate-rainbow-shimmer`, an extensive realistic candle-flame animation set (`.flame-outer/.flame-inner/.flame-halo/.smoke-wisp`), and celebration effects (`.animate-confetti`, `.animate-float-up`, `.animate-sparkle`); `shadow-gold` exists as a Tailwind boxShadow key (not a hand-written class) and no `text-shimmer` class was found.
## 8. Footguns

Code that could plausibly cause a confusing bug. Cited `file:line`. "suspected" marks items I could not fully confirm.

---

### 8.1 Prop defaults that are no-ops or silently disable behaviour

- **`ExitIntentModal` `country` defaults to `'US'` at the data layer.** `src/components/ExitIntentModal.tsx:54-55` — `LIFETIME_PRICES[country || 'US']` and `YEARLY_PRICES[country || 'US']`. If the prop is omitted OR passed a value not in the price map, it silently falls back to USD pricing rather than the visitor's actual region. Combined with 8.5 below, this is the single most impactful footgun.
- **`PostShareUpgradeModal` `country = "US"` default.** `src/components/PostShareUpgradeModal.tsx:23-24` — `country = "US"` default, then `const cc = COPY[country] ? country : "US"`. Any unmapped country silently shows US copy/pricing.
- **`PricingPlans` `country = "US"` default.** `src/components/PricingPlans.tsx:71-72` — `country = "US"`, then `const cc = (PRICING[country] ? country : "US")`. Same silent-US fallback pattern.
- No literal `= () => {}` no-op callback defaults were found in prop destructuring (grep for `= () =>` only returned `onerror`/`onChange` handlers, not defaulted props). So the "callback silently does nothing" variant does not appear to be present.

### 8.2 Silent catch blocks (swallow errors)

Notable empty / ignore-only catches (many are intentional teardown; the ones that can mask real failures are flagged):

- `src/components/Footer.tsx:75-77` — `catch { /* ignore */ }` around `localStorage.removeItem` / `sessionStorage.removeItem` in `handleAutoDetect`. If storage clearing fails, auto-detect silently proceeds to redirect anyway (low risk).
- `supabase/functions/generate-blog-post/index.ts:393` and `:514` — `} catch (_) { /* ignore */ }`. Two swallowed blocks in the blog generation path; a failure here (e.g. image-dedup query) is invisible, which can produce duplicate blog images with no log. **Notable.**
- `supabase/functions/generate-complete-cake/index.ts:786` — `messageTask.catch(() => {})` and `:873` — `} catch {}`. Background vendor-message task failures are fully swallowed. **Notable** (a failed message task produces no trace).
- `supabase/functions/send-reengagement-sequence/index.ts:276,336,400` — `} catch { failed++; }`. At least increments a counter, but the underlying error/reason is discarded, making per-recipient send failures undebuggable.
- Teardown catches that are fine (documented for completeness): `src/utils/birthdayJingle.ts:118,125`; `src/components/CakeCreator.tsx:454,714,1118,2549`; `src/components/AudioRecorder.tsx:143,145`; `src/pages/SharedCake.tsx:147,196`.

### 8.3 Duplicated logic in two+ places

- **`is_premium` check is inconsistent — lifetime-only users treated as non-premium on most pages.** Most content pages check only `is_premium`:
  `src/pages/EgglessCakeDesign.tsx:38`, `PersonalizedCakeOnline.tsx:38`, `EidCakeDesigner.tsx:38`, `WeddingCakeDesigner.tsx:38`, `AiBirthdayCakeWithName.tsx:58`, `RakhiCakeIdeas.tsx:38`, `Recipes.tsx:53`, `AiCakeGeneratorFree.tsx:65`, `ThreeDCakeDesigner.tsx:76`, `GraduationCakeDesigner.tsx:38`, `AnniversaryCakeDesigner.tsx:38`, `PhotoCakeMaker.tsx:38`, `FreeCakeDesigner.tsx:44`, `Index.tsx:177`, `PartyPlannerDetail.tsx:621`.
  But two places ALSO OR-in `lifetime_access`: `src/pages/PartyPlanner.tsx:313,316` (`is_premium, lifetime_access`) and `src/hooks/usePartyPackAccess.ts:47` (`!!profile?.is_premium || !!profile?.lifetime_access`). **A user with `lifetime_access: true` but `is_premium: false` is premium on PartyPlanner/party-pack but non-premium everywhere else** — this is a genuine bug-prone divergence. (`Admin.tsx:714-718` sets both together, so it may not trigger in practice — suspected: whether any user can have lifetime without is_premium; depends on grant logic in Razorpay/edge functions.)
- **`SHARE_BASE_URL = "https://cakeaiartist.com"` duplicated** in `src/components/CakeCreator.tsx:167` and `src/pages/SharedCake.tsx:34` (also `PageSeo.tsx:13` as `SITE`, `PartyPlanner.tsx:30` as `SEO_URL`, `App.tsx:85`). No single source of truth for the site origin.
- **`getElementById('plans')?.scrollIntoView(...)` copy-pasted** across every landing page: `src/pages/CanadaLanding.tsx:245`, `UKLanding.tsx:297`, `AustraliaLanding.tsx:270`, `USALanding.tsx:274`, `IndiaLanding.tsx:280`. Same for `getElementById('creator')` in `FreeCakeDesigner.tsx:67,357`. If the target id is ever renamed, silent no-op scroll on some pages only.
- **7-day "first week eligible" window duplicated:** `src/components/PricingPlans.tsx:89` (`age < 7 * 24 * 60 * 60 * 1000`) and `src/components/PostShareUpgradeModal.tsx:41` (identical). Two independent copies of the same promo-eligibility rule.
- **24h cooldown magic number** repeated: `src/components/ExitIntentModal.tsx:15`, `FeedbackWidget.tsx:35` (`24 * 60 * 60 * 1000`).

### 8.4 Hardcoded values that should be config

- **Ratings/counts hardcoded and scattered across ~25 files** — changing the marketing number means editing every file:
  - `"4.9"` rating: `SEOSchema.tsx:56`, `Index.tsx:276,518,978`, `Pricing.tsx:104,156`, plus every landing page (`USALanding.tsx:219,367`, `UKLanding.tsx:241,389`, `CanadaLanding.tsx:215,309`, `AustraliaLanding.tsx:238,334`, `IndiaLanding.tsx:217,373`) and ~15 content pages (`WeddingCakeDesigner.tsx:178`, `PhotoCakeMaker.tsx:178`, etc.).
  - `ratingCount "2847"`: `SEOSchema.tsx:57`, `Pricing.tsx:105,157`.
  - `"2,800+"` users copy: `FreeCakeDesigner.tsx:345`, `WeddingCakeDesigner.tsx:178`, `PersonalizedCakeOnline.tsx:173`, `AiCakeGeneratorFree.tsx:134`, `EidCakeDesigner.tsx:167`, `GraduationCakeDesigner.tsx:165`, `AnniversaryCakeDesigner.tsx:174`, `AiBirthdayCakeWithName.tsx:119`, and more.
  - `"10,000+"` users: `TrustBadges.tsx:19`, `Index.tsx:1142`.
  - Note the numbers are already **internally inconsistent**: `PartyPlanner.tsx:133` uses `ratingValue "4.8"` / `ratingCount "1240"` while everything else uses `4.9` / `2847`. `EgglessCakeDesign.tsx:174` says "4.9/5 · 20+ occasions" (different count entirely).
- **Prices hardcoded in THREE independent tables** that can drift apart:
  - `src/components/PricingPlans.tsx:20-47` (`PRICING`) — full display + tier ids.
  - `src/components/ExitIntentModal.tsx:34-47` (`LIFETIME_PRICES` / `YEARLY_PRICES`) — separate copy.
  - `src/pages/FAQ.tsx:20-23`, `src/components/PremiumComparison.tsx:9`, and inline FAQ answers in `USALanding.tsx:190-191`, `UKLanding.tsx:207`.
  - **Confirmed drift:** US yearly price is `$29` in `PricingPlans.tsx:44`, `FAQ.tsx:23`, and `ExitIntentModal.tsx:46` (`$29/yr`), but the USALanding FAQ answer at `src/pages/USALanding.tsx:191` states **"Yearly $19.99/year"**. Users reading the USA landing FAQ see a different yearly price than the actual pricing table. **This is a live inconsistency.**
- **Site origin / emails hardcoded:** `support@cakeaiartist.com` in `Footer.tsx:195`, `Terms.tsx:110,168`, `Settings.tsx:358,361`, `useRazorpayPayment.ts:257,328`; `https://cakeaiartist.com` littered across pages (see 8.3).

### 8.5 Components mounted in many places with DIFFERING props

- **`ExitIntentModal country="US"` HARDCODED on non-US content pages** — highest-value footgun. The five landing pages correctly pass their region (`USALanding.tsx:672` US, `UKLanding.tsx:808` GB, `CanadaLanding.tsx:503` CA, `AustraliaLanding.tsx:568` AU, `IndiaLanding.tsx:750` IN), and `Index.tsx:327` passes `detectedCountry || 'US'`. But every generic content page passes a **literal `country="US"`**:
  `EgglessCakeDesign.tsx:267`, `PartyPlanner.tsx:494`, `PersonalizedCakeOnline.tsx:266`, `EidCakeDesigner.tsx:260`, `WeddingCakeDesigner.tsx:271`, `AiBirthdayCakeWithName.tsx:196`, `RakhiCakeIdeas.tsx:267`, `Recipes.tsx:229`, `AiCakeGeneratorFree.tsx:231`, `ThreeDCakeDesigner.tsx:322`, `AnniversaryCakeDesigner.tsx:267`, `GraduationCakeDesigner.tsx:258`, `PhotoCakeMaker.tsx:271`.
  These pages don't read geo at all (grep for `detectedCountry`/`useGeo` in them returns nothing). **Result: a UK/IN/CA/AU visitor on any of these ~13 pages gets the exit-intent modal quoting USD prices** (e.g. "$49 lifetime") regardless of their actual region — a confusing pricing mismatch versus the Footer/pricing page which resolve region correctly via `resolveRegion`.
- `PricingPlans` is passed the correct region on landing pages (`USALanding.tsx:641` US, `UKLanding.tsx:775` GB, etc.) and `userCountry` on `Pricing.tsx:180`, so that component is consistent — the divergence is specific to `ExitIntentModal`.

### 8.6 TODO / FIXME / HACK / XXX comments

- No actionable `TODO`/`FIXME`/`HACK`/`XXX` comments exist. All grep hits are false positives inside string data: character-name lists (`todoroki-shoto`, `CakeCreator.tsx:209`, `CharacterPicker.tsx:343`) and phone placeholders (`+91 98xxxxxxx`, `PartyPlannerDetail.tsx:1244,1409`).

---

### Summary — top footguns

1. **`ExitIntentModal country="US"` is hardcoded on ~13 generic content pages** (`EgglessCakeDesign.tsx:267`, `WeddingCakeDesigner.tsx:271`, etc.) that have no geo detection, so non-US visitors see USD exit-intent pricing while the rest of the site shows their local currency.
2. **Pricing lives in three independent hardcoded tables** (`PricingPlans.tsx`, `ExitIntentModal.tsx`, FAQ pages) and has already drifted: US yearly is `$29` everywhere except the USALanding FAQ (`USALanding.tsx:191`) which says `$19.99/year`.
3. **`is_premium` vs `is_premium || lifetime_access` is inconsistent** — only `PartyPlanner.tsx:316` and `usePartyPackAccess.ts:47` honor `lifetime_access`, so a lifetime-only user is treated as non-premium on ~15 other pages.
4. **Ratings/counts (`4.9`, `2847`, `2,800+`, `10,000+`) are copy-pasted across ~25 files** and are already internally inconsistent (`PartyPlanner.tsx:133` uses `4.8`/`1240`), making the social proof impossible to update coherently.
5. **Swallowed errors in edge functions** (`generate-blog-post/index.ts:393,514`; `generate-complete-cake/index.ts:786,873`; `send-reengagement-sequence/index.ts:276,336,400`) hide real failures in blog-image dedup, background vendor messaging, and re-engagement sends.
