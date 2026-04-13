# 🎨 ui — shadcn/ui Primitive Component Library

> **Location:** `FrontEnd/src/components/ui/`  
> **Purpose:** A collection of 49 accessible, composable, and themeable primitive UI components. Built on **Radix UI** headless primitives and styled with **Tailwind CSS**. These are the building blocks used throughout all pages.

---

## 📁 What is shadcn/ui?

shadcn/ui is **not an npm package** — it's a collection of components that are copied directly into your project source, giving you full ownership and control. Components can be freely modified.

Each component:
- Uses **Radix UI** for accessibility (keyboard navigation, ARIA attributes, focus management)
- Is styled via **Tailwind CSS** utility classes
- Supports **dark mode** via Tailwind's `dark:` variant
- Accepts a `className` prop for easy customization

---

## 📦 Component Catalogue

### Form & Input Components
| File | Component | Description |
|------|-----------|-------------|
| `input.tsx` | `<Input>` | Standard text input with consistent styling |
| `textarea.tsx` | `<Textarea>` | Multi-line text area |
| `select.tsx` | `<Select>` | Accessible dropdown select with Radix |
| `checkbox.tsx` | `<Checkbox>` | Accessible checkbox with animation |
| `radio-group.tsx` | `<RadioGroup>` | Group of radio button options |
| `switch.tsx` | `<Switch>` | Toggle switch (on/off) |
| `slider.tsx` | `<Slider>` | Range slider input |
| `label.tsx` | `<Label>` | Accessible form field label |
| `form.tsx` | `<Form>` | React Hook Form integration with field validation display |
| `input-otp.tsx` | `<InputOTP>` | OTP/PIN code input with individual digit boxes |

### Button & Action Components
| File | Component | Description |
|------|-----------|-------------|
| `button.tsx` | `<Button>` | Button with variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` |
| `toggle.tsx` | `<Toggle>` | Pressable toggle button (on/off state) |
| `toggle-group.tsx` | `<ToggleGroup>` | Group of toggle buttons (single/multiple select) |

### Layout & Container Components
| File | Component | Description |
|------|-----------|-------------|
| `card.tsx` | `<Card>` | Content card with `CardHeader`, `CardContent`, `CardFooter` sub-components |
| `separator.tsx` | `<Separator>` | Horizontal or vertical divider line |
| `scroll-area.tsx` | `<ScrollArea>` | Custom-styled scrollable container |
| `resizable.tsx` | `<ResizablePanel>` | Drag-to-resize panel layout |
| `aspect-ratio.tsx` | `<AspectRatio>` | Maintains fixed width-to-height ratio |
| `collapsible.tsx` | `<Collapsible>` | Show/hide content section |
| `accordion.tsx` | `<Accordion>` | Expand/collapse FAQ-style sections |

### Overlay & Dialog Components
| File | Component | Description |
|------|-----------|-------------|
| `dialog.tsx` | `<Dialog>` | Modal dialog with overlay backdrop |
| `alert-dialog.tsx` | `<AlertDialog>` | Confirmation dialog (OK/Cancel) |
| `sheet.tsx` | `<Sheet>` | Slide-in panel from screen edge (mobile-friendly drawer) |
| `drawer.tsx` | `<Drawer>` | Bottom drawer (mobile) or side panel |
| `popover.tsx` | `<Popover>` | Floating content bubble anchored to a trigger |
| `hover-card.tsx` | `<HoverCard>` | Card that appears on hover |
| `tooltip.tsx` | `<Tooltip>` | Small label on hover |

### Navigation Components
| File | Component | Description |
|------|-----------|-------------|
| `navigation-menu.tsx` | `<NavigationMenu>` | Top-level navigation with dropdowns |
| `menubar.tsx` | `<Menubar>` | Desktop application-style menu bar |
| `breadcrumb.tsx` | `<Breadcrumb>` | Page hierarchy breadcrumb trail |
| `pagination.tsx` | `<Pagination>` | Page navigation with prev/next/numbers |
| `tabs.tsx` | `<Tabs>` | Tabbed content panels |
| `sidebar.tsx` | `<Sidebar>` | Full-featured collapsible sidebar primitive |

### Dropdown & Command Components
| File | Component | Description |
|------|-----------|-------------|
| `dropdown-menu.tsx` | `<DropdownMenu>` | Click-triggered dropdown with menu items |
| `context-menu.tsx` | `<ContextMenu>` | Right-click context menu |
| `command.tsx` | `<Command>` | Command palette / keyboard-accessible search menu |

### Display & Feedback Components
| File | Component | Description |
|------|-----------|-------------|
| `badge.tsx` | `<Badge>` | Small status labels: `default`, `secondary`, `destructive`, `outline` |
| `alert.tsx` | `<Alert>` | Info/warning/error alert boxes |
| `avatar.tsx` | `<Avatar>` | User profile image with fallback initials |
| `progress.tsx` | `<Progress>` | Linear progress bar (0–100) |
| `skeleton.tsx` | `<Skeleton>` | Loading placeholder (grey animated shimmer) |
| `table.tsx` | `<Table>` | Full data table with header, body, row, cell sub-components |
| `calendar.tsx` | `<Calendar>` | Date picker calendar |
| `carousel.tsx` | `<Carousel>` | Image/content carousel with prev/next controls |
| `chart.tsx` | `<ChartContainer>` | Recharts wrapper with theming and tooltips |

### Notification Components
| File | Component | Description |
|------|-----------|-------------|
| `toast.tsx` | `<Toast>` | Toast notification primitive |
| `toaster.tsx` | `<Toaster>` | Toast container (place once in App) |
| `sonner.tsx` | `<Sonner>` | Alternative toast via the Sonner library |
| `use-toast.ts` | re-export | Re-exports `useToast` hook from `src/hooks/` |

---

## 🎨 Theming

All components use Tailwind CSS variables defined in `src/index.css`:

```css
/* Light mode */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --card: 0 0% 100%;
  --border: 214.3 31.8% 91.4%;
  ...
}

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  ...
}
```

Components reference these variables via Tailwind utilities like `bg-background`, `text-foreground`, `border-border`.

---

## ⚠ Important Note

> These files are managed by the **shadcn/ui CLI** (`npx shadcn-ui@latest add <component>`).  
> They can be modified freely, but re-running the CLI will overwrite your changes.  
> Always review diffs after running the CLI.

---

## 🔗 Related Files

- `src/index.css` — CSS variable definitions
- `tailwind.config.ts` — Maps CSS variables to Tailwind utility classes
- `src/lib/utils.ts` — The `cn()` helper used in every component
