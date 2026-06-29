import { useEffect, useRef, useState } from "react"
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router"
import {
  BarChart3,
  GitBranch,
  Users,
  UserX,
  Shield,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  X,
  LayoutTemplate,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import gsap from "gsap"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (!session || session.user?.role !== "admin") {
      throw redirect({ to: "/" })
    }
  },
  component: DashboardLayout,
})

const navItems = [
  { title: "Overview", url: "/dashboard", icon: BarChart3, exact: true },
  {
    title: "Registered",
    url: "/dashboard/registered",
    icon: Users,
    exact: false,
  },
  {
    title: "Unregistered",
    url: "/dashboard/unregistered",
    icon: UserX,
    exact: false,
  },
    {
    title: "Messages",
    url: "/dashboard/messages",
    icon: MessageSquare,
    exact: false,
  },
   {
    title: "Branches",
    url: "/dashboard/branches",
    icon: GitBranch,
    exact: false,
  },
  { 
    title: "Users",
    url: "/dashboard/users",
    icon: Shield, exact: false
  },
  {
    title: "Template",
    url: "/dashboard/template-editor",
    icon: LayoutTemplate,
    exact: false,
  },
 

  {
    title: "Import Trash",
    url: "/dashboard/import-errors",
    icon: Trash2,
    exact: false,
  },
]

// Bottom bar: first 4 items visible, rest go in the "More" panel
const mobileNavItems = navItems.slice(0, 4)
const mobileOverflowItems = navItems.slice(4)

// Sidebar width — keep in sync with the ml-* on the content wrapper
const SIDEBAR_W = "w-56"
const CONTENT_ML = "md:ml-56"

function DashboardLayout() {
  const sidebarItemsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!sidebarItemsRef.current) return
    const items = sidebarItemsRef.current.querySelectorAll("[data-nav-item]")
    gsap.fromTo(
      items,
      { opacity: 0, x: -8 },
      {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.1,
      }
    )
  }, [])

  return (
    <div className="relative min-h-svh">
      <aside
        className={`fixed top-0 left-0 z-30 hidden h-screen flex-col pt-20 md:flex ${SIDEBAR_W} border-r border-border bg-background`}
      >
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          <ul ref={sidebarItemsRef} className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.title} data-nav-item className="opacity-0">
                <Link
                  to={item.url}
                  activeOptions={{ exact: item.exact }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  activeProps={{
                    className:
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm bg-muted text-foreground font-medium",
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-4 py-3">
          <p className="text-[10px] text-muted-foreground/50 tabular-nums">
            Admin access only
          </p>
        </div>
      </aside>

      {/* ── Content area ──────────────────────────────────────────────────
          Left margin matches sidebar width on desktop.
          Bottom padding on mobile leaves room for the fixed tab bar.
      ──────────────────────────────────────────────────────────────────── */}
      <main className={`${CONTENT_ML} min-h-svh p-6 pb-24 md:p-8 md:pb-8`}>
        <Outlet />
      </main>

      {/* ── Mobile bottom tab bar (md:hidden) ────────────────────────────── */}
      <MobileBottomBar />
    </div>
  )
}

/* ── Mobile bottom tab bar with "More" overflow panel ── */
function MobileBottomBar() {
  const location = useRouterState({ select: (s) => s.location.pathname })
  const [moreOpen, setMoreOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close when navigating
  useEffect(() => {
    setMoreOpen(false)
  }, [location])

  // Close on outside click
  useEffect(() => {
    if (!moreOpen) return
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    const id = setTimeout(() => document.addEventListener("click", handle), 10)
    return () => {
      clearTimeout(id)
      document.removeEventListener("click", handle)
    }
  }, [moreOpen])

  const overflowActive = mobileOverflowItems.some((item) =>
    item.exact ? location === item.url : location.startsWith(item.url)
  )

  return (
    <>
      {/* Overflow panel — floats just above the bar */}
      {moreOpen && (
        <div
          ref={panelRef}
          className="fixed right-0 bottom-16 left-0 z-50 mx-3 mb-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg md:hidden"
          role="dialog"
          aria-label="More navigation options"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              More
            </span>
            <button
              onClick={() => setMoreOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <nav className="p-2" aria-label="Additional navigation">
            {mobileOverflowItems.map((item) => {
              const isActive = item.exact
                ? location === item.url
                : location.startsWith(item.url)
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{item.title}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Tab bar */}
      <nav
        className="fixed right-0 bottom-0 left-0 z-40 flex h-16 items-stretch border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
        aria-label="Mobile navigation"
      >
        {mobileNavItems.map((item) => {
          const isActive = item.exact
            ? location === item.url
            : location.startsWith(item.url)
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span>{item.title}</span>
            </Link>
          )
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
            moreOpen || overflowActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="More navigation options"
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
              moreOpen || overflowActive ? "bg-primary/10" : ""
            }`}
          >
            {moreOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </div>
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
