import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Zap className="h-5 w-5 fill-accent text-accent" />
      </div>
      {showText && (
        <div className="leading-tight">
          <p className="text-base font-extrabold tracking-tight">
            Smart<span className="text-secondary">LUKU</span>
          </p>
        </div>
      )}
    </div>
  );
}
