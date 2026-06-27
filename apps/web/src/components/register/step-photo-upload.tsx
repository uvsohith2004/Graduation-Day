import { useState } from "react"
import {
  Camera,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react"

import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/button"
import { Field, FieldError } from "@repo/ui/components/field"

interface StepPhotoUploadProps {
  photoPreview: string
  onPhotoSelect: (file: File) => void
  onRemove: () => void
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
  uploadProgress: number
}

export function StepPhotoUpload({
  photoPreview,
  onPhotoSelect,
  onRemove,
  onUpload,
  isUploading,
  uploadProgress,
}: StepPhotoUploadProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 3 * 1024 * 1024) {
        setPhotoError("File size must be less than 3MB.")
        return
      }
      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        setPhotoError("Only JPG and PNG formats are allowed.")
        return
      }
      setPhotoError("")
      setPhotoFile(file)
      onPhotoSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!photoFile) return

    if (photoFile.size > 3 * 1024 * 1024) {
      setPhotoError("File size must be less than 3MB.")
      return
    }
    if (photoFile.type !== "image/jpeg" && photoFile.type !== "image/png") {
      setPhotoError("Only JPG and PNG formats are allowed.")
      return
    }

    setPhotoError("")
    await onUpload(photoFile)
  }

  const handleRemove = () => {
    setPhotoFile(null)
    setPhotoError("")
    onRemove()
  }

  return (
    <div className="space-y-5">
      <Field data-invalid={!!photoError}>
        <div className="flex flex-col items-center">
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg, image/png"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="photo-upload"
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-200",
              "h-56 w-44",
              photoPreview
                ? "border-primary/30 bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-accent/50"
            )}
          >
            {photoPreview ? (
              <>
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <Camera className="h-7 w-7 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 p-5 text-center text-muted-foreground">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  Tap to upload your passport photo
                </p>
              </div>
            )}
          </label>

          {photoPreview && (
            <button
              onClick={handleRemove}
              className="mt-3 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3 w-3" />
              Remove photo
            </button>
          )}
        </div>

        {photoError && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <FieldError>{photoError}</FieldError>
          </div>
        )}
      </Field>

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          Use a clear, front-facing photo with a plain background.
          It'll be printed on your pass.
        </p>
      </div>

      <Button
        className="relative h-12 w-full overflow-hidden rounded-2xl text-[15px] font-semibold"
        onClick={handleUpload}
        disabled={!photoFile || isUploading}
      >
        {isUploading && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-primary-foreground/20 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        )}
        <span className="relative z-10 flex items-center">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading… {uploadProgress}%
            </>
          ) : (
            <>
              Upload &amp; continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </>
          )}
        </span>
      </Button>
    </div>
  )
}
