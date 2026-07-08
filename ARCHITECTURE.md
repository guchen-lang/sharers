# DevBox Architecture

## Principles

The project follows:

- Feature Based Architecture
- SOLID
- DRY
- KISS
- Clean Architecture
- Composition over inheritance

---

# Folder Structure

src/

app/

components/

features/

hooks/

store/

utils/

types/

assets/

---

# Feature Structure

Each feature contains:

feature/

components/

hooks/

types/

utils/

index.ts

Example:

features/json/

components/

hooks/

types/

utils/

index.ts

---

# Shared Components

Common reusable components belong in

components/

Never duplicate UI.

---

# Business Logic

Business logic belongs in

utils/

or

hooks/

Never place business logic inside JSX.

---

# State Management

Global state:

Zustand

Component state:

React useState

Forms:

React Hook Form

Validation:

Zod

---

# Routing

Every tool has its own route.

Example:

/json

/base64

/jwt

/hash

/regex

No nested routing unless necessary.

---

# Tool Registration

All tools are registered in a central Tool Registry.

Sidebar should never be hardcoded.

Search should never be hardcoded.

Adding a tool should require only one configuration entry.

---

# Styling

Tailwind CSS

shadcn/ui

No inline styles.

No custom CSS unless necessary.

---

# Icons

Lucide React

Use consistent icon style.

---

# Utilities

All reusable helper functions belong in utils.

Never duplicate helper functions.

---

# Error Handling

Every feature should gracefully handle invalid input.

No application crashes.

Readable error messages.

---

# Performance

Use lazy loading.

Memoize expensive calculations.

Avoid unnecessary renders.

Split bundles by feature.

---

# Testing

Vitest

React Testing Library

Every utility function should be testable.

Critical tools should include unit tests.

---

# Accessibility

Keyboard navigation.

ARIA labels.

Focus states.

Semantic HTML.

WCAG AA compliance.

---

# Browser Support

Latest Chrome

Latest Edge

Latest Firefox

Latest Safari
