import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ChevronRight } from "lucide-react"

import { rollNoSchema, type RollNoFormValues } from "@/lib/register-schemas"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Field,
  FieldLabel,
  FieldError,
} from "@repo/ui/components/field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog"

interface StepRollNumberProps {
  defaultRollNo: string
  onCheck: (rollNo: string) => Promise<void>
  onConfirm: () => void
  isPending: boolean
}

export function StepRollNumber({
  defaultRollNo,
  onCheck,
  onConfirm,
  isPending,
}: StepRollNumberProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [serverError, setServerError] = useState("")

  const form = useForm<RollNoFormValues>({
    resolver: zodResolver(rollNoSchema),
    defaultValues: { rollNo: defaultRollNo },
  })

  const rollNoValue = form.watch("rollNo")

  const handleSubmit = async (data: RollNoFormValues) => {
    try {
      setServerError("")
      await onCheck(data.rollNo)
      setConfirmOpen(true)
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || "This roll number isn't on the list."
      )
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <Field data-invalid={!!form.formState.errors.rollNo || !!serverError}>
        <FieldLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Roll number
        </FieldLabel>
        <Input
          placeholder="e.g. 20A91A0401"
          {...form.register("rollNo")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              form.handleSubmit(handleSubmit)()
            }
          }}
          className={cn(
            "h-13 rounded-2xl border-border px-4 text-base font-medium tracking-wider uppercase transition-colors",
            (form.formState.errors.rollNo || serverError) &&
              "border-destructive focus-visible:ring-destructive/30"
          )}
          autoFocus
          autoCapitalize="characters"
        />
        <FieldError>
          {form.formState.errors.rollNo?.message || serverError}
        </FieldError>
      </Field>

      <Button
        type="submit"
        className="h-12 w-full rounded-2xl text-[15px] font-semibold"
        disabled={rollNoValue.length < 5 || isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            Check eligibility
            <ChevronRight className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Only registered students can collect their graduation pass.
      </p>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="mx-4 max-w-sm rounded-3xl border-border bg-card">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-lg font-bold">
              Confirm roll number
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
              You entered{" "}
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] font-semibold text-foreground uppercase">
                {rollNoValue}
              </span>
              . This can't be changed after you continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 pt-2">
            <AlertDialogCancel className="h-11 flex-1 rounded-xl border-border text-sm">
              Go back
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
              onClick={() => {
                setConfirmOpen(false)
                onConfirm()
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
