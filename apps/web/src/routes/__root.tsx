import * as React from "react"
import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@repo/ui/components/sonner"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
      <Navbar />
      <Outlet />
      <Toaster />
    </React.Fragment>
  )
}
