import { useState } from "react"
import { CheckCircle2, Download, ArrowRight, Loader2, User, MapPin, CheckSquare, Users } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/button"

interface StepSuccessProps {
  rollNo: string
  branch: string
  willAttend: "Yes" | "No"
  guests: number
  photoUrl: string
  onDownload: () => Promise<string>
  onDone: () => void
}

function Barcode() {
  // A mix of widths and heights makes it look like a realistic 1D barcode
  const bars = [
    { h: 24, w: "w-1" }, { h: 18, w: "w-0.5" }, { h: 26, w: "w-0.5" }, { h: 20, w: "w-1" },
    { h: 16, w: "w-0.5" }, { h: 24, w: "w-0.5" }, { h: 18, w: "w-1" }, { h: 26, w: "w-0.5" },
    { h: 14, w: "w-0.5" }, { h: 20, w: "w-1" }, { h: 16, w: "w-0.5" }, { h: 22, w: "w-0.5" },
    { h: 18, w: "w-1" }, { h: 24, w: "w-0.5" }, { h: 26, w: "w-1" }, { h: 14, w: "w-0.5" }
  ]
  
  return (
    <div className="flex items-end gap-0.5 opacity-80 mix-blend-multiply dark:mix-blend-screen" aria-hidden="true">
      {bars.map((bar, i) => (
        <span
          key={i}
          className={cn("block rounded-sm bg-foreground", bar.w)}
          style={{ height: bar.h }}
        />
      ))}
    </div>
  )
}

export function StepSuccess({
  rollNo,
  branch,
  willAttend,
  guests,
  photoUrl,
  onDownload,
  onDone,
}: StepSuccessProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const dataUrl = await onDownload()
      const link = document.createElement("a")
      link.download = `VEC-Alumni-Pass-${rollNo.toUpperCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error(err)
      alert("Failed to generate ticket. Please make sure template.png is in the public folder.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-8 pb-4">
      
      {/* 1. Success Indicator (Added entrance animation & subtitle) */}
      <div className="flex flex-col items-center gap-3 pt-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-20" />
          <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-500" strokeWidth={2} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Registration Complete</h2>
          <p className="text-sm text-muted-foreground">Your graduation pass is ready.</p>
        </div>
      </div>

      {/* 2. Pass Card (Added ticket notches, smooth slide-in, and better contrast) */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5 animate-in slide-in-from-bottom-4 fade-in duration-700">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 bg-foreground px-6 py-5 relative overflow-hidden">
          {/* Subtle background accent in header */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
          
          <div className="relative space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-background/60">
              Graduation Pass
            </p>
            <p className="font-mono text-2xl font-bold tracking-wider text-background uppercase">
              {rollNo}
            </p>
          </div>

          <div className="relative shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Student photo"
                className="h-16 w-16 rounded-xl border-2 border-background/20 object-cover shadow-sm bg-background/10"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-background/20 bg-background/10 backdrop-blur-sm shadow-sm">
                <User className="h-7 w-7 text-background/50" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </div>

        {/* Perforation divider with Ticket Cutouts (Notches) */}
        <div className="relative flex items-center bg-card">
          {/* Left Notch */}
          <div className="absolute -left-3 h-6 w-6 rounded-full border border-border bg-background shadow-inner" />
          {/* Dotted Line */}
          <div
            className="h-px w-full bg-[repeating-linear-gradient(90deg,hsl(var(--border))_0,hsl(var(--border))_6px,transparent_6px,transparent_12px)]"
            aria-hidden="true"
          />
          {/* Right Notch */}
          <div className="absolute -right-3 h-6 w-6 rounded-full border border-border bg-background shadow-inner" />
        </div>

        {/* Body rows (Improved padding and icon alignment) */}
        <div className="divide-y divide-border/60 px-6 bg-card">
          <div className="flex items-center justify-between py-3.5 hover:bg-muted/30 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground/70" strokeWidth={2} aria-hidden="true" />
              Branch
            </span>
            <span className="text-sm font-semibold text-foreground">{branch}</span>
          </div>

          <div className="flex items-center justify-between py-3.5 hover:bg-muted/30 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
              <CheckSquare className="h-4 w-4 text-muted-foreground/70" strokeWidth={2} aria-hidden="true" />
              Attending
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
                willAttend === "Yes"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {willAttend === "Yes" ? "CONFIRMED" : "DECLINED"}
            </span>
          </div>

          {willAttend === "Yes" && (
            <div className="flex items-center justify-between py-3.5 hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4 text-muted-foreground/70" strokeWidth={2} aria-hidden="true" />
                Guests
              </span>
              <span className="text-sm font-semibold text-foreground">{guests}</span>
            </div>
          )}
        </div>

        {/* Footer with improved barcode */}
        <div className="flex items-center justify-between gap-4 border-t border-border/60 bg-muted/40 px-6 py-4">
          <Barcode />
          <span className="font-mono text-[10px] font-semibold tracking-widest text-muted-foreground text-right uppercase">
            VEC<br/>2025
          </span>
        </div>
      </div>

      {/* 3. Actions (Improved button styling and states) */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          variant="outline"
          className="h-12 rounded-xl border-border/80 text-sm font-semibold shadow-sm hover:bg-muted/50 transition-all"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Save Pass
            </>
          )}
        </Button>

        <Button
          className="h-12 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
          onClick={onDone}
        >
          Finish
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
