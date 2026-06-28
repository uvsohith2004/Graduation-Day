import { cn } from "@repo/ui/lib/utils"
import logo from "@/assets/logo.png"
export function Logo({
  className = "w-8 h-8",
  dotClassName = "w-6 h-6",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { dotClassName?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-sm border border-primary/20 bg-primary/10 p-1 ",
        className
      )}
      {...props}
    >
      <img src={logo} alt="" className="" />
    </div>
  )
}
