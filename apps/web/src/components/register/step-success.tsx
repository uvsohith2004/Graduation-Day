import { useState } from "react"
import {
  CheckCircle2,
  Download,
  ArrowRight,
  Loader2,
} from "lucide-react"

import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/button"
import {
  Card,
  CardContent,
} from "@repo/ui/components/card"

interface StepSuccessProps {
  rollNo: string
  branch: string
  willAttend: "Yes" | "No"
  guests: number
  photoUrl: string
  onDownload: () => Promise<string>
  onDone: () => void
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
      alert(
        "Failed to generate ticket. Please make sure template.png is in the public folder."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success badge */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          Registration complete
        </p>
      </div>

      {/* Pass card */}
      <Card className="overflow-hidden rounded-3xl border border-border p-0 [--card-spacing:0]">
        {/* Card header stripe */}
        <div className="flex items-center justify-between bg-primary px-5 py-4">
          <div>
            <p className="mb-0.5 text-[10px] font-semibold tracking-widest text-primary-foreground/60 uppercase">
              Graduation Pass
            </p>
            <p className="font-mono text-lg font-bold tracking-wider text-white uppercase">
              {rollNo}
            </p>
          </div>
          {photoUrl && (
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white/20">
              <img
                src={photoUrl}
                alt="Student"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Card body */}
        <CardContent className="space-y-3 bg-card px-5 py-4">
          <div className="flex items-center justify-between border-b border-border/60 py-2.5">
            <span className="text-sm text-muted-foreground">
              Branch
            </span>
            <span className="text-sm font-semibold text-foreground">
              {branch}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border/60 py-2.5">
            <span className="text-sm text-muted-foreground">
              Attending
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                willAttend === "Yes"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {willAttend === "Yes" ? "Confirmed" : "Not attending"}
            </span>
          </div>
          {willAttend === "Yes" && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-muted-foreground">
                Guests
              </span>
              <span className="text-sm font-semibold text-foreground">
                {guests}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          variant="outline"
          className="h-12 rounded-2xl border-border text-sm"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Pass
            </>
          )}
        </Button>
        <Button
          className="h-12 rounded-2xl text-sm font-semibold"
          onClick={onDone}
        >
          Done
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
