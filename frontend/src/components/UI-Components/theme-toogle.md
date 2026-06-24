You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
theme-toggle.tsx
"use client";

import { Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToggleSize = "sm" | "md" | "lg";

function ThemeSunIcon({
  className,
  size,
}: {
  className?: string;
  size: number;
}) {
  return (
    <svg
      aria-hidden
      className={cn("block shrink-0", className)}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" fill="currentColor" r="3.25" />
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path d="M12 2.5v2.5" />
        <path d="M12 19v2.5" />
        <path d="M4.22 4.22l1.77 1.77" />
        <path d="M18.01 18.01l1.77 1.77" />
        <path d="M2.5 12h2.5" />
        <path d="M19 12h2.5" />
        <path d="M4.22 19.78l1.77-1.77" />
        <path d="M18.01 5.99l1.77-1.77" />
      </g>
    </svg>
  );
}

interface ThemeToggleProps {
  className?: string;
  size?: ToggleSize;
}

const sizeConfig = {
  sm: {
    track: "h-6 w-11",
    knob: "h-4 w-4",
    knobOffset: "left-[calc(100%-1.125rem)]",
    knobStart: "left-0.5",
    icon: 12,
    sunIcon: 12,
  },
  md: {
    track: "h-8 w-14",
    knob: "h-6 w-6",
    knobOffset: "left-[calc(100%-1.625rem)]",
    knobStart: "left-0.5",
    icon: 16,
    sunIcon: 16,
  },
  lg: {
    track: "h-10 w-[4.5rem]",
    knob: "h-8 w-8",
    knobOffset: "left-[calc(100%-2.125rem)]",
    knobStart: "left-0.5",
    icon: 20,
    sunIcon: 20,
  },
};

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const config = sizeConfig[size];

  useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDark(prefersDark);
    if (prefersDark) document.documentElement.classList.add("dark");
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={cn(
          "relative rounded-full border-2 border-border bg-muted",
          config.track,
          className
        )}
        type="button"
      />
    );
  }

  return (
    <button
      aria-label="Toggle theme"
      className={cn(
        "relative cursor-pointer rounded-full border-2 transition-colors duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
        config.track,
        isDark
          ? "border-[#2d2a4e] bg-[#1a1838]"
          : "border-[#e8d5b7] bg-[#fef3c7]",
        className
      )}
      onClick={toggle}
      type="button"
    >
      <div
        className={cn(
          "absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full transition-[left,background-color] duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
          config.knob,
          isDark ? config.knobOffset : config.knobStart,
          isDark ? "bg-[#e8e6f0] text-[#1a1838]" : "bg-[#ff9500] text-white"
        )}
      >
        <ThemeSunIcon
          className={cn(
            "col-start-1 row-start-1 origin-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
            isDark
              ? "rotate-90 scale-50 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
          size={config.sunIcon}
        />
        <Moon
          className={cn(
            "col-start-1 row-start-1 block shrink-0 origin-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-50 opacity-0"
          )}
          size={config.icon}
          strokeWidth={2}
        />
      </div>
    </button>
  );
}


demo.tsx
"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";

export function ThemeTogglePreview() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-muted-foreground text-sm">
        Click the toggle to switch between light and dark mode.
      </p>
      <ThemeToggle size="md" />
    </div>
  );
}

export default ThemeTogglePreview
```

Install NPM dependencies:
```bash
lucide-react
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
