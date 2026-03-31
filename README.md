# HR Appraisal System - Frontend

This repository contains the frontend application for the HR Appraisal System. It is designed to provide a seamless interface for Employees, Managers, and HR personnel to conduct, review, and manage performance appraisals through defined cycles.

## 🚀 Tech Stack & Core Technologies

The application is built using a modern, fast, and scalable frontend stack:

- **React 19**: Core UI library for building dynamic, component-driven interfaces.
- **TypeScript**: Provides static typing to ensure code reliability and better developer experience.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS v4**: Utility-first CSS framework for rapid and responsive UI styling.
- **Radix UI**: Unstyled, accessible component primitives (used for Select, Dialogs, Tooltips, Tabs, Dropdowns, etc.), allowing custom styling via Tailwind.
- **React Router v7**: Application routing for navigating between dashboards and pages seamlessly.
- **React Query (TanStack Query)**: Handles data fetching, caching, synchronization, and state management for API resources.
- **Axios**: Promise-based HTTP client for API communication, often configured with interceptors for JWT token attachment.
- **React Hook Form & Zod**: Schema-based form validation and optimized form state management.
- **Lucide React**: Beautiful and consistent iconography.
- **Date-fns**: Lightweight JavaScript date utility library for easy date manipulations.

## 🏗️ Architecture & How It Works

### Flow & Core Mechanism
1. **Authentication:** 
   Users log in with their credentials. A successful login retrieves a JWT token from the backend, which is stored securely (usually strictly in memory or safe local storage) and attached to the Authorization header of every subsequent API request using Axios interceptors.
2. **Role-Based Routing:** 
   Upon decoding the user's role from the token/API, the app directs the user to their specific dashboard (`/employee`, `/manager`, `/hr`). The application employs protected routes that only render the dashboard if the user holds the valid role.
3. **State & Caching:** 
   `@tanstack/react-query` is heavily utilized to fetch lists (e.g., active appraisal cycles, assigned goals, team members). This ensures that the UI reflects real-time changes without unnecessary loading spinners or redundant network payload.
4. **Form Handling:** 
   Forms such as 'Self-Assessment', 'Goal Setting', and 'Manager Review' use `react-hook-form` paired with `zod`. Zod defines the rigid schema on client-side constraints (min length, max score limits, required remarks), blocking submission and displaying rich validation feedback before hitting the backend.

### Key Sections:
- **/src/api/**: Contains API layer configurations, Axios instances, and query mutation hooks.
- **/src/components/**: Reusable UI elements (Buttons, Layouts, Cards, form controls) powered by Radix UI + Tailwind.
- **/src/pages/**: High-level page components mapping to route definitions (e.g., Login, HR Dashboard, Employee Dashboard).
- **/src/context/** or **/src/lib/**: Providers acting as global state managers (like Authentication providers), and utility functions (formatting dates via `date-fns`, class mergers like `clsx` and `tailwind-merge`).

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone this repository structure and navigate to the root directory.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the Vite development server:
```bash
npm run dev
```

### Build for Production

Compile TypeScript and build the static assets:
```bash
npm run build
```
Once built, the production-ready application will be output into the `dist/` directory, which can be previewed locally using:
```bash
npm run preview
```

## 🧠 Linting and Code Quality

- The codebase enforces strict Linting via ESLint configured for React hooks and TypeScript best practices (`npm run lint`).
- UI consistency is guaranteed using `class-variance-authority` (cva) to create variant-based Tailwind components securely.
