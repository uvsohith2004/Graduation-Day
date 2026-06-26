import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/schedule')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
