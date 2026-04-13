import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  /** "ghost" variant for dashboard headers, "outline" for light pages */
  variant?: "ghost" | "outline";
}

export function ThemeToggle({ className = "", variant = "ghost" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      id="theme-toggle-btn"
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={`relative transition-all duration-300 ${className}`}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
        }`}
      >
        <Sun className="h-4 w-4" />
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          theme === "light" ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
        }`}
      >
        <Moon className="h-4 w-4" />
      </span>
      {/* invisible spacer to maintain button size */}
      <span className="h-4 w-4 opacity-0 pointer-events-none" />
    </Button>
  );
}
