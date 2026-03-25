# MyLink - Project Guidelines

## 1. Project Overview
**MyLink** is a "Link in Bio" landing page service that connects multiple links to social media profiles like Instagram and TikTok.

### Core Objectives
- Help influencers, creators, and brands consolidate their various channels into a single page.
- Provide a unique URL based on the user's nickname (e.g., `mylink.com/nickname`).
- Aim for an intuitive UI for managing links and customizing profiles without complex settings.

---

## 2. Tech Stack
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**:
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) (Component Library)
  - [Tabler Icons](https://tabler-icons.io/)
- **Backend & Database**:
  - [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Social Login only)
  - [Cloud Firestore](https://firebase.google.com/docs/firestore) (Data Storage)
- **External API**: Google Favicon API (Automatic favicon extraction)

---

## 3. Key Commands
- **Run Dev Server**: `npm run dev` (with Turbopack)
- **Build Project**: `npm run build`
- **Start Production**: `npm run start`
- **Lint Check**: `npm run lint`
- **Code Formatting**: `npm run format`
- **Type Check**: `npm run typecheck`
- **Add Component**: `npx shadcn@latest add [component-name]`

---

## 4. Development Conventions & Rules

### Architecture & Folder Structure
- `app/`: Pages and layouts based on Next.js App Router.
- `components/ui/`: Reusable UI components installed via shadcn/ui.
- `components/`: Common components containing business logic.
- `hooks/`: Reusable React Hooks.
- `lib/`: Utility functions and external service configurations (e.g., Firebase).
- `docs/`: Project documentation (PRD, wireframes, etc.).

### Coding Style
- **Tailwind CSS**: Prefer inline classes; use `cn()` utility for complex cases.
- **Inline Edit**: Adopt a structure where profile info and links are edited directly on the screen without navigating to a separate form page. (Refer to wireframes)
- **Mobile-First**: Design all UI with mobile environments as the priority.
- **Firebase**: Support Google Social Login only; manage data using a sub-collection structure per user (`users/{userId}/links`).

### Data Structure (Firestore)
- **users (Collection)**: `email`, `displayName`, `photoUrl`, `bio`, `createdAt`, `updatedAt`
- **links (Sub-collection)**: `title`, `url`, `faviconUrl`, `createdAt`

### User Flow
1. **Initial Access**: Google Login -> (For new users) Set nickname in onboarding -> Enter Dashboard.
2. **Management**: Inline edit profile and links in Dashboard -> Real-time DB sync.
3. **Sharing**: Expose link page to visitors via `mylink.com/nickname` path.

### Testing & Validation
- Always run `npm run build` after implementing features to ensure no build errors.
- Write or update relevant test cases when adding new features.

---

## 5. Implementation Priorities (MVP)
1. **Firebase Setup & Auth**: Google login integration and onboarding process.
2. **Profile Management**: Inline editing for nickname and bio.
3. **Link Management**: Add, edit, delete links with automatic favicon integration.
4. **Landing Page**: Public-facing multi-link page based on nickname.
5. **Theme Customization**: Background color and button style settings.
