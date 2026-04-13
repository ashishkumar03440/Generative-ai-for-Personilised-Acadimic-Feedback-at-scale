# 🔧 lib — Utility Functions

> **Location:** `FrontEnd/src/lib/`  
> **Purpose:** Pure, stateless utility functions shared across the entire frontend application.

---

## 📁 Folder Contents

```
lib/
└── utils.ts    # cn() — Tailwind CSS class merging helper
```

---

## 📄 `utils.ts` — `cn()` Utility Function

The single most-used utility in the codebase. Virtually every component file imports and uses it.

### What it does

`cn()` merges Tailwind CSS class names intelligently, resolving conflicts so the **last class wins** rather than unpredictably stacking conflicting utilities.

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### The two libraries it combines:

| Library | Role |
|---------|------|
| **`clsx`** | Conditionally joins class names. Handles arrays, objects, and boolean expressions |
| **`tailwind-merge`** | Resolves Tailwind conflicts. E.g., `px-2 px-4` → only `px-4` is kept |

---

### Why this matters — The Problem It Solves

Without `cn()`, you'd run into Tailwind conflict issues:

```tsx
// ❌ Without cn() — BROKEN: both px-2 and px-4 are applied, px-2 wins based on
//    stylesheet order, NOT declaration order. Unpredictable!
<div className={`px-2 ${isLarge ? "px-4" : ""}`} />

// ✅ With cn() — CORRECT: tailwind-merge ensures px-4 overrides px-2
<div className={cn("px-2", isLarge && "px-4")} />
```

---

### Usage Examples

```tsx
import { cn } from "@/lib/utils";

// 1. Basic conditional classes
<div className={cn("rounded-md p-4", isActive && "bg-blue-500")} />

// 2. External className prop (component customization)
function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded font-medium bg-primary text-white",
        className    // ← caller's classes override defaults cleanly
      )}
      {...props}
    />
  );
}

// 3. Variant-based styling
<div className={cn(
  "base-styles",
  variant === "outline" && "border border-current bg-transparent",
  variant === "ghost" && "bg-transparent hover:bg-accent",
  size === "sm" && "h-8 px-3 text-sm",
  size === "lg" && "h-12 px-6 text-lg",
)} />

// 4. Array syntax (also valid)
<div className={cn(["p-4", "rounded"], { "opacity-50": isDisabled })} />
```

---

### Import Alias

The project uses TypeScript path aliases configured in `tsconfig.app.json`, so imports use `@/` instead of relative paths:

```ts
// ✅ Preferred (works from any depth in the project)
import { cn } from "@/lib/utils";

// ❌ Relative (fragile, path changes with file depth)
import { cn } from "../../lib/utils";
```

---

## 🔗 Related Files

- `tsconfig.app.json` — Defines the `@/` path alias pointing to `src/`
- `vite.config.ts` — Mirrors the same alias for Vite's module resolver
- `components/ui/*.tsx` — Every shadcn/ui component imports `cn` from this file
