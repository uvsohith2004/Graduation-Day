import { useEffect, useState, useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { useAdminDashboardStatsQuery } from "@/api/admin-queries"
import { BRANCHES } from "@/constants/register-data"
import { Button } from "@repo/ui/components/button"
import { Loader2, Download, Users, UserX, Filter } from "lucide-react"
import * as XLSX from "xlsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select"

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { data: session, isPending: isAuthPending } = authClient.useSession()
  const { data: stats, isLoading: isStatsLoading } =
    useAdminDashboardStatsQuery()

  const [activeTab, setActiveTab] = useState<"registered" | "unregistered">(
    "registered"
  )
  const [branchFilter, setBranchFilter] = useState<string>("all")

  const dashboardBranches = BRANCHES.filter((b) => b !== "Others")

  const filteredRegistered = useMemo(() => {
    if (!stats?.registered) return []
    return stats.registered.filter(
      (r) => branchFilter === "all" || r.branch === branchFilter
    )
  }, [stats?.registered, branchFilter])

  const filteredUnregistered = useMemo(() => {
    if (!stats?.unregistered) return []
    return stats.unregistered.filter(
      (r) => branchFilter === "all" || r.branch === branchFilter
    )
  }, [stats?.unregistered, branchFilter])

  useEffect(() => {
    if (!isAuthPending) {
      if (!session || session.user.role !== "admin") {
        navigate({ to: "/" })
      }
    }
  }, [session, isAuthPending, navigate])

  if (isAuthPending || (session && session.user.role !== "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleExportRegistered = () => {
    if (filteredRegistered.length === 0) return
    const exportData = filteredRegistered.map((r) => ({
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
    XLSX.utils.book_append_sheet(wb, ws, "Registered Alumni")
    XLSX.writeFile(wb, "registered_alumni.xlsx")
  }

  const handleExportUnregistered = () => {
    if (filteredUnregistered.length === 0) return
    const exportData = filteredUnregistered.map((r) => ({
      "Roll Number": r.rollNumber,
      Name: r.studentName,
      Branch: r.branch,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Unregistered Alumni")
    XLSX.writeFile(wb, "unregistered_alumni.xlsx")
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage graduation day registrations in real-time.
            </p>
          </div>
        </div>

        {isStatsLoading ? (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                className={`cursor-pointer rounded-3xl border p-6 transition-all ${activeTab === "registered" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:bg-accent/50"}`}
                onClick={() => setActiveTab("registered")}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Registered Alumni
                    </p>
                    <p className="text-3xl font-bold">
                      {stats?.registered?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`cursor-pointer rounded-3xl border p-6 transition-all ${activeTab === "unregistered" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:bg-accent/50"}`}
                onClick={() => setActiveTab("unregistered")}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
                    <UserX className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Unregistered (Eligible)
                    </p>
                    <p className="text-3xl font-bold">
                      {stats?.unregistered?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h2 className="text-lg font-semibold">
                  {activeTab === "registered"
                    ? "Registered Alumni List"
                    : "Unregistered Alumni List"}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={branchFilter}
                      onValueChange={(val) => setBranchFilter(val || "all")}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {dashboardBranches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={
                      activeTab === "registered"
                        ? handleExportRegistered
                        : handleExportUnregistered
                    }
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to XLSX
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Roll Number</th>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Branch</th>
                      {activeTab === "registered" && (
                        <>
                          <th className="px-5 py-3 font-medium">Mobile</th>
                          <th className="px-5 py-3 font-medium">Attending</th>
                          <th className="px-5 py-3 font-medium">Guests</th>
                          <th className="px-5 py-3 text-right font-medium">
                            Registered At
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeTab === "registered" ? (
                      filteredRegistered.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-8 text-center text-muted-foreground"
                          >
                            No registrations found for this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredRegistered.map((user) => (
                          <tr key={user.id} className="hover:bg-muted/30">
                            <td className="px-5 py-3 font-medium">
                              {user.hall_ticket_number}
                            </td>
                            <td className="px-5 py-3">{user.student_name}</td>
                            <td className="px-5 py-3">{user.branch}</td>
                            <td className="px-5 py-3">{user.mobile_number}</td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.will_attend ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                              >
                                {user.will_attend ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-5 py-3">{user.guest_count}</td>
                            <td className="px-5 py-3 text-right text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )
                    ) : filteredUnregistered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-8 text-center text-muted-foreground"
                        >
                          {branchFilter === "all"
                            ? "Everyone has registered! 🎉"
                            : "No unregistered alumni found for this branch."}
                        </td>
                      </tr>
                    ) : (
                      filteredUnregistered.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30">
                          <td className="px-5 py-3 font-medium">
                            {user.rollNumber}
                          </td>
                          <td className="px-5 py-3">{user.studentName}</td>
                          <td className="px-5 py-3">{user.branch}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
