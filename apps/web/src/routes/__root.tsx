import * as React from "react"
import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@repo/ui/components/sonner"
import { TooltipProvider } from "@repo/ui/components/tooltip"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <TooltipProvider>
      <Navbar />
      <Outlet />
      <Toaster />
    </TooltipProvider>
  )
}
