import { useState, useEffect, useRef } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useAllUsersQuery, type UserRecord } from "@/api/admin-queries"
import { useSendAdminOtpMutation, useVerifyAdminOtpMutation } from "@/api/mutation"
import { Button } from "@repo/ui/components/button"
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
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@repo/ui/components/sheet"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/input-otp"
import { Loader2, Shield, UserPlus, ShieldCheck, Users } from "lucide-react"
import gsap from "gsap"

export const Route = createFileRoute("/dashboard/users")({
  component: DashboardUsers,
})

function DashboardUsers() {
  const { data: users, isLoading } = useAllUsersQuery()
  const sendOtpMutation = useSendAdminOtpMutation()
  const verifyOtpMutation = useVerifyAdminOtpMutation()

  const [otpSheetOpen, setOtpSheetOpen] = useState(false)
  const [otpTargetUser, setOtpTargetUser] = useState<UserRecord | null>(null)
  const [otpValue, setOtpValue] = useState("")
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  const tableRef = useRef<HTMLDivElement>(null)

  // Animate rows in when data arrives
  useEffect(() => {
    if (isLoading || !users?.length || !tableRef.current) return
    const rows = tableRef.current.querySelectorAll("[data-row]")
    gsap.fromTo(
      rows,
      { opacity: 0, x: -6 },
      { opacity: 1, x: 0, duration: 0.28, stagger: 0.03, ease: "power2.out" }
    )
  }, [isLoading, users])

  const handleMakeAdmin = async (user: UserRecord) => {
    setPromotingId(user.id)
    setOtpTargetUser(user)
    setOtpValue("")
    setOtpSent(false)
    try {
      await sendOtpMutation.mutateAsync(user.id)
      setOtpSent(true)
      setOtpSheetOpen(true)
    } finally {
      setPromotingId(null)
    }
  }

  const handleResendOtp = async () => {
    if (!otpTargetUser) return
    setOtpValue("")
    await sendOtpMutation.mutateAsync(otpTargetUser.id)
  }

  const handleVerifyOtp = async () => {
    if (!otpTargetUser || otpValue.length !== 6) return
    await verifyOtpMutation.mutateAsync({ targetUserId: otpTargetUser.id, code: otpValue })
    setOtpSheetOpen(false)
    setOtpTargetUser(null)
    setOtpValue("")
  }

  const handleSheetClose = (open: boolean) => {
    if (!open) {
      setOtpSheetOpen(false)
      setOtpTargetUser(null)
      setOtpValue("")
    }
  }

  const adminCount = users?.filter((u) => u.role === "admin").length ?? 0
  const totalCount = users?.length ?? 0

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            {!isLoading && (
              <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {totalCount} total
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {!isLoading
              ? `${adminCount} admin${adminCount !== 1 ? "s" : ""}, ${totalCount - adminCount} member${totalCount - adminCount !== 1 ? "s" : ""}`
              : "Loading users..."}
          </p>
        </div>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-10 pl-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</TableHead>
                <TableHead className="h-10 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-b border-border/50 last:border-0">
                  <TableCell className="py-3 pl-5"><div className="h-3.5 w-28 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell className="py-3"><div className="h-3.5 w-40 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell className="py-3"><div className="h-5 w-14 animate-pulse rounded-sm bg-muted" /></TableCell>
                  <TableCell className="py-3 pr-5 text-right"><div className="ml-auto h-7 w-24 animate-pulse rounded bg-muted" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !users?.length ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No users found</p>
            <p className="text-xs text-muted-foreground">Users will appear here once they sign up.</p>
          </div>
        </div>
      ) : (
        <div ref={tableRef} className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-10 pl-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</TableHead>
                <TableHead className="h-10 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isAdmin = user.role === "admin"
                const isPromoting = promotingId === user.id

                return (
                  <TableRow
                    key={user.id}
                    data-row
                    className="group border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <TableCell className="py-3 pl-5 text-sm font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="py-3">
                      <RolePill role={user.role!} />
                    </TableCell>
                    <TableCell className="py-3 pr-5 text-right">
                      {isAdmin ? (
                        /* Admin users — show a quiet indicator, no empty cell */
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50">
                          <ShieldCheck className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMakeAdmin(user)}
                          disabled={isPromoting}
                          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                        >
                          {isPromoting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserPlus className="h-3 w-3" />
                          )}
                          Make admin
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="border-t border-border/50 bg-muted/20 px-5 py-2.5">
            <span className="text-xs text-muted-foreground tabular-nums">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>
        </div>
      )}

      {/* ── OTP verification sheet ── */}
      <Sheet open={otpSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="space-y-1 pb-2">
            <SheetTitle className="text-base font-semibold">Confirm admin promotion</SheetTitle>
            <SheetDescription className="text-sm">
              A 6-digit code was sent to your email.
            </SheetDescription>
          </SheetHeader>

          {/* Target user context — makes this feel intentional, not accidental */}
          {otpTargetUser && (
            <div className="my-5 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {otpTargetUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{otpTargetUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">{otpTargetUser.email}</p>
              </div>
              <span className="ml-auto shrink-0 rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                → Admin
              </span>
            </div>
          )}

          <div className="space-y-6">
            {/* OTP input — centered */}
            <div className="flex flex-col items-center gap-4 pt-2">
              <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {/* Resend */}
              <button
                onClick={handleResendOtp}
                disabled={sendOtpMutation.isPending}
                className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-50"
              >
                {sendOtpMutation.isPending ? "Sending..." : "Resend code"}
              </button>
            </div>

            {/* Confirm */}
            <Button
              className="w-full"
              onClick={handleVerifyOtp}
              disabled={otpValue.length !== 6 || verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              Confirm promotion
            </Button>

            {/* Destructive secondary action */}
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => handleSheetClose(false)}
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* ── Role pill — not a Badge ── */
function RolePill({ role }: { role: string }) {
  const isAdmin = role === "admin"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-medium ${
        isAdmin
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isAdmin && <ShieldCheck className="h-2.5 w-2.5" />}
      {role}
    </span>
  )
}
