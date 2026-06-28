import { useState, useEffect, useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import {
  useOverviewStatsQuery,
  useBranchesQuery,
  useBranchDataQuery,
  type RegisteredAlumni,
} from "@/api/admin-queries"
import { useDeleteRegistrationMutation } from "@/api/mutation"
import gsap from "gsap"
import { Button } from "@repo/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table"
import { Loader2, Download, Trash2, CheckCircle2, Users } from "lucide-react"
import * as XLSX from "xlsx"

export const Route = createFileRoute("/dashboard/registered")({
  component: DashboardRegistered,
})

function DashboardRegistered() {
  const queryClient = useQueryClient()
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: branchesData } = useBranchesQuery()
  const { data: overviewStats } = useOverviewStatsQuery()
  const { data: branchData, isLoading } = useBranchDataQuery(selectedBranch, "registered")
  const deleteRegMutation = useDeleteRegistrationMutation()

  const pillsRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const headerActionsRef = useRef<HTMLDivElement>(null)

  const dashboardBranches = branchesData?.map((b) => b.name) || []

  // Stagger branch pills on mount
  useEffect(() => {
    if (!pillsRef.current || !dashboardBranches.length) return
    const pills = pillsRef.current.querySelectorAll("[data-pill]")
    gsap.fromTo(
      pills,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
    )
  }, [dashboardBranches.length])

  // Stagger table rows when data arrives — uses ref, not class selector
  useEffect(() => {
    if (isLoading || !branchData?.length || !tableRef.current) return
    const rows = tableRef.current.querySelectorAll("[data-row]")
    gsap.fromTo(
      rows,
      { opacity: 0, x: -6 },
      { opacity: 1, x: 0, duration: 0.28, stagger: 0.03, ease: "power2.out" }
    )
  }, [isLoading, branchData])

  // Animate header actions in when branch selected
  useEffect(() => {
    if (!headerActionsRef.current || !selectedBranch) return
    gsap.fromTo(
      headerActionsRef.current,
      { opacity: 0, y: -4 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
    )
  }, [selectedBranch])

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this registration record?")) return
    setDeletingId(id)
    await deleteRegMutation.mutateAsync(id)
    setDeletingId(null)
    queryClient.invalidateQueries({ queryKey: ["admin", "branchData"] })
    queryClient.invalidateQueries({ queryKey: ["admin", "overview"] })
  }

  const handleExport = () => {
    if (!branchData?.length) return
    const exportData = (branchData as RegisteredAlumni[]).map((r) => ({
      "Roll Number": r.hall_ticket_number,
      Name: r.student_name,
      Branch: r.branch,
      Mobile: r.mobile_number,
      Attending: r.will_attend ? "Yes" : "No",
      Guests: r.guest_count,
      Email: r.email,
      "Registered At": new Date(r.createdAt).toLocaleString(),
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Registered")
    XLSX.writeFile(wb, `registered_${selectedBranch}.xlsx`)
  }

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Registered Alumni</h1>
            {branchData && branchData.length > 0 && (
              <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {branchData.length} records
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedBranch
              ? `Showing registrations for ${selectedBranch}`
              : "Select a branch to view registration data"}
          </p>
        </div>

        {selectedBranch && (
          <div ref={headerActionsRef} className="opacity-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs font-medium"
              onClick={handleExport}
              disabled={!branchData?.length}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* ── Branch filter pills ── */}
      <div ref={pillsRef} className="flex flex-wrap gap-2">
        {dashboardBranches.map((branch) => {
          const count = overviewStats?.branches?.[branch]?.registered ?? 0
          const isSelected = selectedBranch === branch

          return (
            <button
              key={branch}
              data-pill
              onClick={() => setSelectedBranch(branch)}
              className={`group flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all duration-150 ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span>{branch}</span>
              <span
                className={`min-w-[20px] rounded-sm px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums transition-colors ${
                  isSelected
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Content area ── */}
      {!selectedBranch ? (
        <EmptyPrompt
          icon={<Users className="h-6 w-6" />}
          title="No branch selected"
          description="Choose a branch above to load its registered alumni list."
        />
      ) : isLoading ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-10 pl-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roll No.</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attending</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guests</TableHead>
                <TableHead className="h-10 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-b border-border/50 last:border-0">
                  <TableCell className="py-3 pl-5"><div className="h-3.5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell className="py-3"><div className="h-3.5 w-32 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell className="py-3"><div className="h-3.5 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell className="py-3"><div className="h-5 w-10 animate-pulse rounded-sm bg-muted" /></TableCell>
                  <TableCell className="py-3"><div className="h-3.5 w-6 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell className="py-3 pr-5 text-right"><div className="ml-auto h-7 w-7 animate-pulse rounded bg-muted" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !branchData || branchData.length === 0 ? (
        <EmptyPrompt
          icon={<CheckCircle2 className="h-6 w-6 text-muted-foreground/60" />}
          title="No registrations yet"
          description={`Nobody from ${selectedBranch} has registered so far.`}
        />
      ) : (
        <div ref={tableRef} className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-10 pl-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roll No.</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attending</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guests</TableHead>
                <TableHead className="h-10 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(branchData as RegisteredAlumni[]).map((user) => {
                const isDeleting = deletingId === user.id
                return (
                  <TableRow
                    key={user.id}
                    data-row
                    className={`group border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30 ${
                      isDeleting ? "opacity-40" : ""
                    }`}
                  >
                    <TableCell className="py-3 pl-5 font-mono text-sm font-medium">
                      {user.hall_ticket_number}
                    </TableCell>
                    <TableCell className="py-3 text-sm font-medium">
                      {user.student_name}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground tabular-nums">
                      {user.mobile_number}
                    </TableCell>
                    <TableCell className="py-3">
                      <AttendancePill attending={user.will_attend} />
                    </TableCell>
                    <TableCell className="py-3 text-sm tabular-nums">
                      {user.guest_count}
                    </TableCell>
                    <TableCell className="py-3 pr-5 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none"
                        title="Remove registration"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="border-t border-border/50 bg-muted/20 px-5 py-2.5">
            <span className="text-xs text-muted-foreground tabular-nums">
              {branchData.length} {branchData.length === 1 ? "record" : "records"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Attendance pill — not a Badge, just a styled span ── */
function AttendancePill({ attending }: { attending: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium ${
        attending
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {attending ? "Yes" : "No"}
    </span>
  )
}

/* ── Shared empty state ── */
function EmptyPrompt({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
