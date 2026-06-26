import { cn } from "@repo/ui/lib/utils";

export function Logo({ 
  className = "w-6 h-6", 
  dotClassName = "w-2 h-2",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { dotClassName?: string }) {
  return (
    <div 
      className={cn("flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20", className)}
      {...props}
    >
      <div className={cn("rounded-full bg-primary", dotClassName)} />
    </div>
  );
}
