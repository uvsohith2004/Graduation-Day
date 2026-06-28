import { useState, useRef, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import {
  useOverviewStatsQuery,
  useBranchesQuery,
  useBranchDataQuery,
  type UnregisteredAlumni,
} from "@/api/admin-queries"
import {
  useDeleteEligibilityMutation,
  useAddEligibilityMutation,
  useImportEligibilityMutation,
} from "@/api/mutation"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet"
import {
  Loader2,
  Download,
  Trash2,
  CheckCircle2,
  Plus,
  Upload,
  Users,
} from "lucide-react"
import * as XLSX from "xlsx"
import gsap from "gsap"

export const Route = createFileRoute("/dashboard/unregistered")({
  component: DashboardUnregistered,
})

function DashboardUnregistered() {
  const queryClient = useQueryClient()
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: branchesData } = useBranchesQuery()
  const dashboardBranches = branchesData?.map((b) => b.name) || []

  const { data: overviewStats } = useOverviewStatsQuery()

  const { data: branchData, isLoading } = useBranchDataQuery(
    selectedBranch,
    "unregistered"
  )

  const deleteEligMutation = useDeleteEligibilityMutation()
  const addEligMutation = useAddEligibilityMutation()
  const importEligMutation = useImportEligibilityMutation()

  const [manualOpen, setManualOpen] = useState(false)
  const [manualRoll, setManualRoll] = useState("")
  const [manualName, setManualName] = useState("")

  const [importOpen, setImportOpen] = useState(false)
  const [startRow, setStartRow] = useState("2")
  const [rollCol, setRollCol] = useState("A")
  const [nameCol, setNameCol] = useState("B")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Refs for GSAP
  const pillsRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const headerActionsRef = useRef<HTMLDivElement>(null)

  // Animate branch pills on mount
  useEffect(() => {
    if (!pillsRef.current) return
    const pills = pillsRef.current.querySelectorAll("[data-pill]")
    gsap.fromTo(
      pills,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
    )
  }, [dashboardBranches.length])

  // Animate table rows when branchData arrives
  useEffect(() => {
    if (!tableRef.current || !branchData?.length) return
    const rows = tableRef.current.querySelectorAll("[data-row]")
    gsap.fromTo(
      rows,
      { opacity: 0, x: -6 },
      { opacity: 1, x: 0, duration: 0.28, stagger: 0.03, ease: "power2.out" }
    )
  }, [branchData])

  // Animate header actions when branch selected
  useEffect(() => {
    if (!headerActionsRef.current || !selectedBranch) return
    gsap.fromTo(
      headerActionsRef.current,
      { opacity: 0, y: -4 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
    )
  }, [selectedBranch])

  const handleDelete = async (idOrRoll: string) => {
    if (!confirm("Remove this record from the eligibility list?")) return
    setDeletingId(idOrRoll)
    await deleteEligMutation.mutateAsync(idOrRoll)
    setDeletingId(null)
    queryClient.invalidateQueries({ queryKey: ["admin", "branchData"] })
    queryClient.invalidateQueries({ queryKey: ["admin", "overview"] })
  }

  const handleManualAdd = async () => {
    if (!manualRoll || !manualName || !selectedBranch) return
    await addEligMutation.mutateAsync({
      rollNumber: manualRoll,
      studentName: manualName,
      branch: selectedBranch,
    })
    setManualOpen(false)
    setManualRoll("")
    setManualName("")
    queryClient.invalidateQueries({ queryKey: ["admin", "branchData"] })
    queryClient.invalidateQueries({ queryKey: ["admin", "overview"] })
  }

  const colToIndex = (col: string) => {
    let index = 0
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + col.charCodeAt(i) - 64
    }
    return index - 1
  }

  const handleImportSubmit = () => {
    if (!selectedFile || !selectedBranch) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: "binary" })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
      const startIdx = Math.max(0, parseInt(startRow) - 1)
      const rollIdx = colToIndex(rollCol.toUpperCase())
      const nameIdx = colToIndex(nameCol.toUpperCase())
      const parsedData = []
      for (let i = startIdx; i < rawData.length; i++) {
        const row = rawData[i]
        if (!row || row.length === 0) continue
        const roll = row[rollIdx]
        const name = row[nameIdx]
        if (roll || name) {
          parsedData.push({
            rollNumber: String(roll || ""),
            studentName: String(name || ""),
          })
        }
      }
      if (parsedData.length > 0) {
        await importEligMutation.mutateAsync({
          rows: parsedData,
          branch: selectedBranch,
        })
        setImportOpen(false)
        setSelectedFile(null)
        queryClient.invalidateQueries({ queryKey: ["admin", "branchData"] })
        queryClient.invalidateQueries({ queryKey: ["admin", "overview"] })
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleExport = () => {
    if (!branchData || !branchData.length) return
    const exportData = (branchData as UnregisteredAlumni[]).map((r) => ({
      "Roll Number": r.rollNumber,
      Name: r.studentName,
      Branch: r.branch,
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Unregistered")
    XLSX.writeFile(wb, `unregistered_${selectedBranch}.xlsx`)
  }

  const totalUnregistered = overviewStats
    ? Object.values(overviewStats.branches ?? {}).reduce(
        (acc: number, b: any) => acc + (b?.unregistered ?? 0),
        0
      )
    : null

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Unregistered Alumni
            </h1>
            {totalUnregistered !== null && (
              <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {totalUnregistered} total
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedBranch
              ? `Showing records for ${selectedBranch}`
              : "Select a branch to view and manage eligibility"}
          </p>
        </div>

        {selectedBranch && (
          <div
            ref={headerActionsRef}
            className="flex items-center gap-2 opacity-0"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs font-medium"
              onClick={() => setManualOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add entry
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs font-medium"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Import
            </Button>
            {branchData && branchData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-medium"
                onClick={handleExport}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Branch filter pills ── */}
      <div ref={pillsRef} className="flex flex-wrap gap-2">
        {dashboardBranches.map((branch) => {
          const branchStats = overviewStats?.branches?.[branch]
          const count = branchStats?.unregistered ?? 0
          const isSelected = selectedBranch === branch

          return (
            <button
              key={branch}
              data-pill
              onClick={() => setSelectedBranch(branch)}
              className={`group relative flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all duration-150 ${
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
          description="Choose a branch above to load its unregistered alumni list."
        />
      ) : isLoading || importEligMutation.isPending ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">
              {importEligMutation.isPending
                ? "Importing records..."
                : "Loading..."}
            </span>
          </div>
        </div>
      ) : !branchData || branchData.length === 0 ? (
        <EmptyPrompt
          icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
          title="All clear"
          description={`Every student from ${selectedBranch} has registered.`}
        />
      ) : (
        <div
          ref={tableRef}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-10 pl-5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Roll No.
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Name
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Branch
                </TableHead>
                <TableHead className="h-10 pr-5 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(branchData as UnregisteredAlumni[]).map((user, idx) => (
                <TableRow
                  key={user.id}
                  data-row
                  className={`border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30 ${
                    deletingId === user.rollNumber ? "opacity-40" : ""
                  }`}
                >
                  <TableCell className="py-3 pl-5 font-mono text-sm font-medium">
                    {user.rollNumber}
                  </TableCell>
                  <TableCell className="py-3 text-sm">
                    {user.studentName}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {user.branch}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 pr-5 text-right">
                    <button
                      onClick={() => handleDelete(user.rollNumber)}
                      disabled={deletingId === user.rollNumber}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none"
                      title="Remove from eligibility list"
                    >
                      {deletingId === user.rollNumber ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Table footer with count */}
          <div className="border-t border-border/50 bg-muted/20 px-5 py-2.5">
            <span className="text-xs text-muted-foreground tabular-nums">
              {branchData.length}{" "}
              {branchData.length === 1 ? "record" : "records"}
            </span>
          </div>
        </div>
      )}

      {/* ── Manual add sheet ── */}
      <Sheet open={manualOpen} onOpenChange={setManualOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="space-y-1 pb-6">
            <SheetTitle className="text-base font-semibold">
              Add entry
            </SheetTitle>
            <SheetDescription className="text-sm">
              Adding to{" "}
              <span className="font-medium text-foreground">
                {selectedBranch}
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            <FormField label="Roll number">
              <Input
                value={manualRoll}
                onChange={(e) => setManualRoll(e.target.value)}
                placeholder="e.g. 22BD1A0501"
                className="font-mono"
              />
            </FormField>
            <FormField label="Student name">
              <Input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Full name"
              />
            </FormField>

            <Button
              className="mt-2 w-full"
              onClick={handleManualAdd}
              disabled={addEligMutation.isPending || !manualRoll || !manualName}
            >
              {addEligMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add entry
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Import sheet ── */}
      <Sheet open={importOpen} onOpenChange={setImportOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="space-y-1 pb-6">
            <SheetTitle className="text-base font-semibold">
              Import from spreadsheet
            </SheetTitle>
            <SheetDescription className="text-sm">
              Importing into{" "}
              <span className="font-medium text-foreground">
                {selectedBranch}
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            {/* File picker */}
            <FormField label="File" hint="Accepts .xlsx and .xls">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/50">
                <Upload className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {selectedFile ? selectedFile.name : "Choose file..."}
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="sr-only"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>
            </FormField>

            {/* Column mapping */}
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Column mapping
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Roll no. column">
                  <Input
                    value={rollCol}
                    onChange={(e) => setRollCol(e.target.value)}
                    placeholder="A"
                    className="font-mono uppercase"
                  />
                </FormField>
                <FormField label="Name column">
                  <Input
                    value={nameCol}
                    onChange={(e) => setNameCol(e.target.value)}
                    placeholder="B"
                    className="font-mono uppercase"
                  />
                </FormField>
              </div>
            </div>

            {/* Start row */}
            <FormField
              label="Start row"
              hint="Row 1 is typically the header row"
            >
              <Input
                type="number"
                value={startRow}
                onChange={(e) => setStartRow(e.target.value)}
                placeholder="2"
                min={1}
              />
            </FormField>

            <Button
              className="mt-2 w-full"
              onClick={handleImportSubmit}
              disabled={importEligMutation.isPending || !selectedFile}
            >
              {importEligMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Import data
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* ── Small helpers ── */

function FormField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm leading-none font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

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
