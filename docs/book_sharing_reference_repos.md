# Open Source Reference Repositories for Book Sharing App Stack

This document lists open-source repositories relevant to the technologies used in the **Book Sharing App**, providing examples for Claude Code to analyze folder structures, configurations, and integration patterns.

---

## 1. Turborepo + shadcn/ui + TailwindCSS

### **Repository:** [henriqpohl/turborepo-shadcn-ui-tailwindcss](https://github.com/henriqpohl/turborepo-shadcn-ui-tailwindcss)
- **Tech Stack:** Turborepo, React, TailwindCSS, shadcn/ui
- **Why Relevant:** Demonstrates a monorepo architecture with reusable UI components using shadcn/ui.
- **Key References:**
  - `apps/` and `packages/ui` structure
  - Tailwind + shadcn integration setup
  - Turborepo configuration for shared components

---

## 2. Turborepo + Vite + shadcn/ui

### **Repository:** [evgenius1424/turborepo-vite-shadcn-ui](https://github.com/evgenius1424/turborepo-vite-shadcn-ui)
- **Tech Stack:** Turborepo, React, Vite, shadcn/ui
- **Why Relevant:** Matches your planned setup almost exactly (React + Vite + shadcn + Turborepo).
- **Key References:**
  - Vite configuration within a Turborepo
  - Cross-package component imports
  - shadcn/ui integration with shared UI package

---

## 3. Supabase + React + Vite Example

### **Repository:** [MichaelZalla/supabase-react-vite-example](https://github.com/MichaelZalla/supabase-react-vite-example)
- **Tech Stack:** React, TypeScript, Vite, Supabase
- **Why Relevant:** Demonstrates how to integrate Supabase (Auth + Database) with React using Vite.
- **Key References:**
  - Auth flow and user session management
  - Supabase client setup (`supabaseClient.ts`)
  - Environment variable handling for Supabase keys

---

## 4. React + Supabase Auth Template

### **Repository:** [mmvergara/react-supabase-auth-template](https://github.com/mmvergara/react-supabase-auth-template)
- **Tech Stack:** React, Supabase, TypeScript
- **Why Relevant:** Provides a solid example of Supabase authentication patterns.
- **Key References:**
  - Protected route handling
  - Auth context and hooks for Supabase sessions
  - Reusable form components for login/signup

---

## 5. React Native (Expo) + Supabase Starter

### **Repository:** [supabase-community/expo-supabase-starter](https://github.com/supabase-community/expo-supabase-starter)
- **Tech Stack:** React Native (Expo), Supabase
- **Why Relevant:** Ideal starting point for the future mobile app.
- **Key References:**
  - Supabase auth integration in Expo environment
  - Session persistence and deep linking
  - Cross-platform Supabase client setup

---

## Summary Table

| # | Repository | Core Tech Stack | Relevance to Book Sharing App |
|---|-------------|------------------|--------------------------------|
| 1 | turborepo-shadcn-ui-tailwindcss | Turborepo, shadcn/ui, TailwindCSS | Monorepo + UI design system |
| 2 | turborepo-vite-shadcn-ui | Turborepo, Vite, shadcn/ui | Monorepo structure closest to your plan |
| 3 | supabase-react-vite-example | Supabase, React, Vite | Supabase integration pattern |
| 4 | react-supabase-auth-template | Supabase, React | Auth implementation reference |
| 5 | expo-supabase-starter | Expo, Supabase | Mobile app groundwork |

---

These repositories provide a comprehensive reference foundation for structuring your Turborepo, implementing Supabase integrations, designing the UI system with shadcn/ui, and planning the eventual Expo mobile expansion.

