import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { useImportErrorsQuery } from "@/api/admin-queries"
import { useClearImportErrorsMutation } from "@/api/mutation"
import { Button } from "@repo/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table"
import { Badge } from "@repo/ui/components/badge"
import { Loader2, Trash2, ShieldAlert } from "lucide-react"

export const Route = createFileRoute("/dashboard/import-errors")({
  component: DashboardImportErrors,
})

function DashboardImportErrors() {
  const queryClient = useQueryClient()
  const { data: errors, isLoading } = useImportErrorsQuery()
  const clearMutation = useClearImportErrorsMutation()

  const handleClear = async () => {
    if (!confirm("Are you sure you want to clear all import errors?")) return
    await clearMutation.mutateAsync()
    queryClient.invalidateQueries({ queryKey: ["admin", "importErrors"] })
  }

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Trash</h1>
          <p className="text-sm text-muted-foreground">Review failed XLSX imports and duplicates</p>
        </div>
        {errors && errors.length > 0 && (
          <Button variant="destructive" className="rounded-xl" onClick={handleClear} disabled={clearMutation.isPending}>
            {clearMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Clear Trash
          </Button>
        )}
      </div>

      {!errors || errors.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Trash is empty. All imports successful.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Roll Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Error Reason</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((err) => (
                <TableRow key={err.id}>
                  <TableCell className="font-medium">{err.rollNumber}</TableCell>
                  <TableCell>{err.studentName}</TableCell>
                  <TableCell>{err.branch}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 text-[10px]">
                      {err.errorReason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(err.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
