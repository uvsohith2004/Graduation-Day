import { useEffect, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { useSubmitContactMutation } from "@/api/mutation"
import { Button } from "@repo/ui/components/button"
import { Textarea } from "@repo/ui/components/textarea"
import { Loader2, Send, CheckCircle2, ArrowLeft } from "lucide-react"

export const Route = createFileRoute("/contact/")({
  component: ContactPage,
})


function DotGrid() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.07]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}

function ContactPage() {
  const navigate = useNavigate()
  const { data: session, isPending: isAuthPending } = authClient.useSession()
  const submitMutation = useSubmitContactMutation()
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthPending && !session) {
      navigate({ to: "/signin" })
    }
  }, [session, isAuthPending, navigate])

  if (isAuthPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!message.trim()) return
    await submitMutation.mutateAsync(message)
    setSubmitted(true)
    setMessage("")
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="flex min-h-screen  items-center justify-center bg-background px-4"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card shadow-sm">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">We got it.</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your message is on its way. We'll be in touch shortly.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => navigate({ to: "/" })}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go home
            </Button>
            <Button className="rounded-xl" onClick={() => setSubmitted(false)}>
              Send another
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div
      className="flex min-h-screen bg-background"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* Left panel — decorative intent area */}
      <div className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden border-r border-border  px-12 py-16 lg:flex">
        <DotGrid />

        {/* Top label */}
        <div className="relative">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Contact
          </span>
        </div>

        {/* Main copy */}
        <div className="relative space-y-5">
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight">
            Let's sort
            <br />
            things out.
          </h1>
          <p className="max-w-[26ch] text-sm leading-relaxed text-muted-foreground">
            Questions, feedback, or something broken — drop us a message and we'll respond promptly.
          </p>

          {/* Decorative rule */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px w-8 bg-border" />
            <span className="text-xs text-muted-foreground">Usually replies within a day</span>
          </div>
        </div>

        {/* Bottom meta */}
        <div className="relative text-xs text-muted-foreground/60">
          We read every message personally.
        </div>
      </div>

      {/* Right panel — the form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile-only heading */}
          <div className="space-y-1 lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight">Contact Us</h1>
            <p className="text-sm text-muted-foreground">
              Drop us a message — we'll get back to you promptly.
            </p>
          </div>

          {/* Sender info */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Sending as
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
              {/* Avatar initial */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">
                  {session?.user?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Message area */}
          <div className="space-y-1.5">
            <label
              htmlFor="message"
              className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
            >
              Message
            </label>
            <Textarea
              id="message"
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none rounded-2xl border-border bg-card text-sm leading-relaxed shadow-none focus-visible:ring-1 "
            />
            <p className="text-right text-xs text-muted-foreground/60">
              {message.length > 0 ? `${message.length} chars` : ""}
            </p>
          </div>

          {/* Submit */}
          <Button
            className="h-12 w-full gap-2 rounded-2xl text-[15px] font-semibold tracking-tight"
            onClick={handleSubmit}
            disabled={!message.trim() || submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" strokeWidth={2} />
                Send message
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
