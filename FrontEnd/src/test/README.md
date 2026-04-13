# 🧪 test — Test Setup & Configuration

> **Location:** `FrontEnd/src/test/`  
> **Purpose:** Global configuration for the **Vitest** unit test framework and testing utilities.

---

## 📁 Folder Contents

```
test/
├── setup.ts          # Global test setup — configures testing utilities before each test file
└── example.test.ts   # Minimal example test — verifies the test runner is working
```

---

## 📄 `setup.ts` — Global Test Setup

This file runs **before every test file** in the suite. It extends Jest/Vitest's `expect` with DOM-specific matchers from `@testing-library/jest-dom`.

```ts
import "@testing-library/jest-dom";
```

### What `@testing-library/jest-dom` adds:

Without it, standard Jest assertions are limited to JavaScript values. This extension adds DOM-aware matchers:

| Matcher | Example |
|---------|---------|
| `toBeInTheDocument()` | `expect(button).toBeInTheDocument()` |
| `toBeVisible()` | `expect(modal).toBeVisible()` |
| `toHaveTextContent()` | `expect(el).toHaveTextContent("Submit")` |
| `toHaveValue()` | `expect(input).toHaveValue("hello@email.com")` |
| `toBeDisabled()` | `expect(btn).toBeDisabled()` |
| `toHaveClass()` | `expect(el).toHaveClass("bg-primary")` |
| `toHaveFocus()` | `expect(input).toHaveFocus()` |

### How it's registered:

In `vitest.config.ts`:
```ts
export default defineConfig({
  test: {
    setupFiles: ["./src/test/setup.ts"],  // ← runs setup.ts before every test
    environment: "jsdom",                 // ← simulates a browser DOM
  }
});
```

---

## 📄 `example.test.ts` — Smoke Test

A minimal test that verifies the Vitest + testing library setup is working correctly. Serves as a template for writing real tests.

```ts
import { describe, it, expect } from "vitest";

describe("Example test", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
```

---

## 🧪 How to Write Component Tests

Here's how you'd write a real component test using this setup:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "@/pages/LoginPage";

describe("LoginPage", () => {
  it("renders email and password inputs", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows error on empty submit", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(await screen.findByText(/email is required/i)).toBeVisible();
  });
});
```

---

## 🔧 Testing Configuration Files

| File | Purpose |
|------|---------|
| `vitest.config.ts` (in FrontEnd root) | Configures Vitest: environment, setup files, coverage settings |
| `playwright.config.ts` (in FrontEnd root) | Configures Playwright for end-to-end browser tests |
| `playwright-fixture.ts` (in FrontEnd root) | Custom Playwright test fixtures |

---

## ▶ Running Tests

```bash
# Run unit tests (Vitest)
npm run test

# Run tests with coverage report
npm run test -- --coverage

# Run end-to-end tests (Playwright)
npx playwright test
```

---

## 🔗 Related Files

- `FrontEnd/vitest.config.ts` — Vitest configuration
- `FrontEnd/playwright.config.ts` — Playwright configuration
- `package.json` — `"test"` script definition
