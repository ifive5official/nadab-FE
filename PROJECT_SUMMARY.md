# Nadab (나답) Project Summary

## Overview
**Nadab (나답)** is a hybrid mobile application designed for self-discovery and reflection. The name "Nadab" translates to "Like myself" in Korean, reflecting the app's goal of helping users understand themselves better through daily questions, answers, and data-driven reporting.

## Tech Stack

### Frontend Core
- **Framework:** React 19 (Functional Components, Hooks)
- **Build Tool:** Vite 7
- **Language:** TypeScript
- **Routing:** TanStack Router (File-based routing)
- **State Management:** 
  - **Server State:** TanStack Query (React Query) v5
  - **Global/Client State:** Zustand
- **Styling:** Tailwind CSS 4, Framer Motion (for animations)
- **Form/Data Validation:** Zod
- **API Client:** Axios (with OpenAPI-generated types)

### Mobile & Hybrid
- **Framework:** Capacitor 8
- **Platforms:** Android, iOS, Web
- **Key Plugins:**
  - Social Login: Kakao, Naver, Apple
  - Notifications: Firebase Cloud Messaging (FCM)
  - Hardware: Camera, Device, Network, Splash Screen

### Infrastructure & Tools
- **Package Manager:** pnpm 10
- **Testing:** Vitest, React Testing Library
- **Linting & Formatting:** ESLint, Prettier
- **API Documentation:** OpenAPI (Swagger) integration for type generation

## Project Structure

```text
src/
├── components/       # Shared UI components (Modals, Buttons, Inputs, etc.)
├── constants/        # Global constants (categories, emotions, etc.)
├── features/         # Feature-based modules
│   ├── auth/         # Login, Signup, Onboarding logic
│   ├── calendar/     # User's history and records in calendar view
│   ├── daily/        # Daily activities and recording
│   ├── home/         # Main dashboard and status
│   ├── question/     # Question-related logic (daily questions, rerolls)
│   ├── report/       # Analysis and reporting (Weekly, Monthly, Type-based)
│   ├── social/       # Friend requests, social feed
│   └── user/         # Profile management
├── generated/        # Auto-generated API types and client
├── hooks/            # Global custom hooks (push management, validation, etc.)
├── lib/              # Utility functions and shared library configurations
├── routes/           # TanStack Router file-based route definitions
├── store/            # Zustand store definitions
└── types/            # Common TypeScript interfaces and types
```

## Key Features

1. **Self-Discovery Questions:** Delivers personalized daily questions to encourage user reflection.
2. **Periodic Reports:** Generates weekly and monthly reports based on user's answers, providing insights into their emotions and thoughts.
3. **Type-based Analysis:** Analyzes user responses to categorize their personality or behavioral types.
4. **Social Interaction:** Allows users to connect with friends, view shared records, and manage social connections.
5. **Multi-platform Support:** Seamless experience across Android, iOS, and Web via Capacitor.
6. **Social Authentication:** Simplified onboarding through popular Korean social platforms (Kakao, Naver) and Apple.

## Architectural Patterns

- **Feature-First Organization:** Code is grouped by business features rather than technical layers, improving maintainability and scalability.
- **Type-Safe API Layer:** Uses `openapi-typescript` to ensure end-to-end type safety between the backend and frontend.
- **Centralized State:** Clearly separates server state (TanStack Query) and UI state (Zustand).
- **Mobile-First Design:** UI is optimized for a mobile aspect ratio (fixed width on wider screens) and leverages native capabilities through Capacitor.
- **Robust Error Handling:** Global error boundaries and network status listeners ensure a smooth user experience even in unstable conditions.
