import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@repo/ui/components/sonner"
import { TooltipProvider } from "@repo/ui/components/tooltip"
import { Code2 } from "lucide-react"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <TooltipProvider>
      <Navbar />
      <Outlet />
      <Toaster />
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-background/90 hover:text-foreground hover:shadow-md hover:-translate-y-0.5">
        <Code2 className="h-3.5 w-3.5 text-primary" />
        <span>Developed by <strong className="font-semibold text-foreground">UV Sohith</strong></span>
      </div>
    </TooltipProvider>
  )
}
