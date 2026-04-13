# 🪝 hooks — Custom React Hooks

> **Location:** `FrontEnd/src/hooks/`  
> **Purpose:** Encapsulates reusable stateful logic into custom React hooks. Any component that needs the same behaviour imports the hook instead of duplicating the code.

---

## 📁 Folder Contents

```
hooks/
├── use-mobile.tsx    # useIsMobile() — detects mobile viewport
└── use-toast.ts      # useToast() — manages toast notification queue
```

---

## 📄 `use-mobile.tsx` — `useIsMobile()`

**Purpose:** Returns a boolean indicating whether the current browser viewport is below the mobile breakpoint (768px). Used to conditionally render mobile vs desktop layouts.

### API

```tsx
const isMobile = useIsMobile();
```

| Return | Type | Description |
|--------|------|-------------|
| `isMobile` | `boolean` | `true` if viewport width < 768px |

### How it works:

```tsx
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    // Listen for viewport size changes
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
```

- Uses `window.matchMedia` (the browser's native responsive query API) rather than polling `window.innerWidth`
- Automatically updates when the user resizes the browser window
- Cleanup removes the event listener when the component unmounts

### Example usage:

```tsx
import { useIsMobile } from "@/hooks/use-mobile";

function AppSidebar() {
  const isMobile = useIsMobile();
  return isMobile
    ? <Sheet>...</Sheet>      // Mobile: slide-in drawer
    : <aside>...</aside>;     // Desktop: fixed sidebar
}
```

---

## 📄 `use-toast.ts` — `useToast()`

**Purpose:** Manages a queue of toast notifications. Used with the `<Toaster />` component from `components/ui/toaster.tsx`.

### API

```tsx
const { toast, toasts, dismiss } = useToast();
```

| Property | Type | Description |
|----------|------|-------------|
| `toast(options)` | Function | Adds a new toast to the display queue |
| `toasts` | Array | Current list of active toasts (used by `<Toaster />`) |
| `dismiss(id?)` | Function | Removes a specific toast, or all toasts if no ID given |

### `toast()` Options:

```tsx
toast({
  title: "Submission Successful! ✅",
  description: "Your assignment has been submitted for review.",
  variant: "default" | "destructive",
  duration: 5000,       // Auto-dismiss after 5 seconds
});
```

### How it works:

- Uses a **reducer pattern** to manage toast state (add, update, remove)
- Implements an auto-dismiss timer when `duration` is set
- `<Toaster />` in `App.tsx` subscribes to `toasts` and renders them in a fixed corner overlay
- Toast limit prevents UI clutter (only N toasts visible at once)

### Example usage:

```tsx
import { useToast } from "@/hooks/use-toast";

function SubmissionPage() {
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      await uploadFile();
      toast({ title: "Uploaded!", description: "Submission received." });
    } catch {
      toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
    }
  };
}
```

---

## 🔗 Related Files

- `components/ui/toaster.tsx` — Renders the toast stack in the DOM
- `components/ui/toast.tsx` — The individual toast component UI
- `components/ui/use-toast.ts` — Re-exports `useToast` for convenience from the `ui/` path
- `components/AppSidebar.tsx` — Uses `useIsMobile()` for responsive sidebar behaviour
