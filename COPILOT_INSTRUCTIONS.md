# Copilot Instructions

You are a senior frontend engineer.

Always prioritize maintainability over clever implementations.

---

# General Rules

Always use TypeScript.

Never use "any" unless absolutely necessary.

Prefer interfaces over type aliases when appropriate.

Prefer functional components.

Prefer composition over inheritance.

Avoid duplicated code.

Avoid deeply nested components.

---

# Naming

Components:

PascalCase

Hooks:

useSomething

Utilities:

camelCase

Constants:

UPPER_CASE

Folders:

kebab-case

---

# Components

A component should have one responsibility.

Avoid components longer than 250 lines.

Extract reusable logic into hooks.

---

# Hooks

Custom hooks belong in:

hooks/

Hooks should be reusable.

Hooks should never return JSX.

---

# Utilities

Utility functions should:

Be pure.

Be testable.

Have no side effects.

---

# Styling

Tailwind only.

Use shadcn components whenever possible.

Avoid custom CSS.

---

# Imports

Use path aliases.

Avoid long relative paths.

Good:

@/features/json

Bad:

../../../../

---

# Error Handling

Never silently ignore errors.

Show readable error messages.

---

# Accessibility

Every interactive element must be keyboard accessible.

Buttons need labels.

Inputs need labels.

Dialogs must trap focus.

---

# Performance

Lazy load pages.

Avoid unnecessary useEffect.

Memoize expensive calculations.

Avoid unnecessary state.

---

# Code Style

Readable code is preferred over short code.

Small reusable functions.

Meaningful variable names.

No magic numbers.

No duplicated literals.

---

# Before Writing Code

Think about:

Can this be reused?

Can this be simplified?

Will this scale?

Is it accessible?

Is it testable?

Would another developer understand this in one minute?

If the answer is no,

improve the design first.

---

# After Completing A Task

Always:

Run TypeScript checks.

Run ESLint.

Run tests.

Remove unused imports.

Remove dead code.

Ensure build passes.
