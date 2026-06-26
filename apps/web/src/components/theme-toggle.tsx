import { Button } from "@repo/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useRef } from "react";
import { gsap } from "gsap";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const iconRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");

    gsap.fromTo(
      iconRef.current,
      { rotation: -180, scale: 0.5, opacity: 0 },
      { 
        rotation: 0, 
        scale: 1, 
        opacity: 1, 
        duration: 0.7, 
        ease: "elastic.out(1, 0.4)" 
      }
    );
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="rounded-full w-9 h-9 border border-border/50 bg-background/50 hover:bg-accent transition-colors"
    >
      <div ref={iconRef} className="flex items-center justify-center">
        {isDark ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-foreground" />}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
