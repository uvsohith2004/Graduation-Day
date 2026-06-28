import { useEffect, useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useOverviewStatsQuery, useBranchesQuery } from "@/api/admin-queries"
import { Skeleton } from "@repo/ui/components/skeleton"
import { GraduationCap, Users, UserX, TrendingUp } from "lucide-react"
import gsap from "gsap"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
})

// ── Animated number counter ──────────────────────────────────────────────────
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: value,
      duration: 0.9,
      ease: "power3.out",
      onUpdate() {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString()
      },
    })
  }, [value])

  return <span ref={ref} className={className}>0</span>
}

// ── Main component ────────────────────────────────────────────────────────────
function DashboardOverview() {
  const { data: stats, isLoading: isOverviewLoading } = useOverviewStatsQuery()
  const { data: branchesData, isLoading: isBranchesLoading } = useBranchesQuery()

  const dashboardBranches = branchesData?.map((b) => b.name) || []
  const isLoading = isOverviewLoading || isBranchesLoading

  const heroRef = useRef<HTMLDivElement>(null)
  const branchGridRef = useRef<HTMLDivElement>(null)

  // Stagger-in top section on data arrive
  useEffect(() => {
    if (isLoading || !heroRef.current) return
    const cards = heroRef.current.querySelectorAll("[data-stat]")
    gsap.fromTo(
      cards,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
    )
  }, [isLoading])

  // Stagger-in branch cards
  useEffect(() => {
    if (isLoading || !branchGridRef.current) return
    const cards = branchGridRef.current.querySelectorAll("[data-branch]")
    gsap.fromTo(
      cards,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out", delay: 0.2 }
    )
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-4 w-52 rounded-lg" />
        </div>
        {/* Hero stat skeletons */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-25 rounded-xl" />
          ))}
        </div>
        {/* Branch skeletons */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-36 rounded-lg" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-27.5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalRegistered = stats?.totalRegistered ?? 0
  const totalUnregistered = stats?.totalUnregistered ?? 0
  const totalAlumni = totalRegistered + totalUnregistered
  const overallPct =
    totalAlumni > 0 ? Math.round((totalRegistered / totalAlumni) * 100) : 0

  return (
    <div className="space-y-10">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            {overallPct}% of alumni registered across all branches
          </p>
        </div>
      </div>

      {/* ── Top stat strip ──────────────────────────────────────────────── */}
      <div ref={heroRef} className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        {/* Registered — primary, gets the most weight */}
        <div
          data-stat
          className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-5 opacity-0"
        >
          {/* Subtle decorative arc */}
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-primary/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-1 -top-1 h-12 w-12 rounded-full border border-primary/15"
            aria-hidden
          />
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Registered</span>
          </div>
          <AnimatedNumber
            value={totalRegistered}
            className="text-3xl font-bold tabular-nums text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">{overallPct}% completion</p>
        </div>

        {/* Unregistered */}
        <div
          data-stat
          className="relative overflow-hidden rounded-xl border border-border bg-card p-5 opacity-0"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/10">
              <UserX className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Unregistered</span>
          </div>
          <AnimatedNumber
            value={totalUnregistered}
            className="text-3xl font-bold tabular-nums text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {totalAlumni > 0 ? 100 - overallPct : 0}% remaining
          </p>
        </div>

        {/* Total */}
        <div
          data-stat
          className="relative overflow-hidden rounded-xl border border-border bg-card p-5 opacity-0"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
              <Users className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Total alumni</span>
          </div>
          <AnimatedNumber
            value={totalAlumni}
            className="text-3xl font-bold tabular-nums text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">across all branches</p>
        </div>
      </div>

      {/* ── Global progress bar ─────────────────────────────────────────── */}
      <GlobalProgressBar pct={overallPct} />

      {/* ── Branch breakdown ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            By branch
          </h2>
          <span className="text-xs text-muted-foreground">
            {dashboardBranches.length} branches
          </span>
        </div>

        <div
          ref={branchGridRef}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {dashboardBranches.map((branch) => {
            const branchStats = stats?.branches?.[branch]
            const registered = branchStats?.registered ?? 0
            const total = branchStats?.total ?? 0
            const pct = total > 0 ? Math.round((registered / total) * 100) : 0
            const isComplete = pct === 100

            return (
              <BranchCard
                key={branch}
                branch={branch}
                registered={registered}
                total={total}
                pct={pct}
                isComplete={isComplete}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}


function GlobalProgressBar({ pct }: { pct: number }) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barRef.current) return
    gsap.fromTo(
      barRef.current,
      { width: "0%" },
      { width: `${pct}%`, duration: 1.1, ease: "power3.out", delay: 0.3 }
    )
  }, [pct])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3" />
          Overall registration progress
        </span>
        <span className="font-semibold tabular-nums text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          ref={barRef}
          className="h-full rounded-full bg-primary"
          style={{ width: "0%" }}
        />
      </div>
    </div>
  )
}

// ── Branch card ───────────────────────────────────────────────────────────────
function BranchCard({
  branch,
  registered,
  total,
  pct,
  isComplete,
}: {
  branch: string
  registered: number
  total: number
  pct: number
  isComplete: boolean
}) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barRef.current) return
    gsap.fromTo(
      barRef.current,
      { width: "0%" },
      { width: `${pct}%`, duration: 0.8, ease: "power3.out", delay: 0.35 }
    )
  }, [pct])

  return (
    <div
      data-branch
      className={`group flex flex-col justify-between rounded-xl border p-4 opacity-0 transition-colors duration-150 ${
        isComplete
          ? "border-primary/25 bg-primary/5 hover:border-primary/40"
          : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
      }`}
    >
      {/* Top row: branch name + pct */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-tight">{branch}</span>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
            isComplete
              ? "bg-primary/15 text-primary"
              : pct >= 75
              ? "bg-muted text-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-0.75 w-full overflow-hidden rounded-full bg-muted">
        <div
          ref={barRef}
          className={`h-full rounded-full ${isComplete ? "bg-primary" : "bg-primary/60"}`}
          style={{ width: "0%" }}
        />
      </div>

      {/* Bottom: counts */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-base font-bold tabular-nums leading-none">{registered}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">registered</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium tabular-nums text-muted-foreground">{total}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">total</p>
        </div>
      </div>
    </div>
  )
}
