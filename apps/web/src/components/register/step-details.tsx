import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Phone, } from "lucide-react"

import { detailsSchema, type DetailsFormValues } from "@/lib/register-schemas"

import { GuestCounter } from "@/components/register/guest-counter"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Field,
  FieldLabel,
  FieldError,
} from "@repo/ui/components/field"


interface StepDetailsProps {
  defaultValues: {
    mobileNumber: string
    willAttend: "Yes" | "No"
    guests: number
  }
  onSubmit: (data: DetailsFormValues) => Promise<void>
  isPending: boolean
}

export function StepDetails({
  defaultValues,
  onSubmit,
  isPending,
}: StepDetailsProps) {
  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues,
  })

  const willAttend = form.watch("willAttend")
  const guests = form.watch("guests")

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Mobile */}
      <Field data-invalid={!!form.formState.errors.mobileNumber}>
        <FieldLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Mobile number
        </FieldLabel>
        <div className="relative">
          <Phone className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="10-digit number"
            {...form.register("mobileNumber")}
            className="h-13 rounded-2xl pl-10 text-base"
            inputMode="numeric"
            maxLength={10}
          />
        </div>
        <FieldError>{form.formState.errors.mobileNumber?.message}</FieldError>
      </Field>



      {/* Attendance toggle */}
      <Field>
        <FieldLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Attending the ceremony?
        </FieldLabel>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          <button
            type="button"
            onClick={() => form.setValue("willAttend", "Yes")}
            className={cn(
              "h-11 rounded-xl text-sm font-semibold transition-all duration-200",
              willAttend === "Yes"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yes, I'll be there
          </button>
          <button
            type="button"
            onClick={() => form.setValue("willAttend", "No")}
            className={cn(
              "h-11 rounded-xl text-sm font-semibold transition-all duration-200",
              willAttend === "No"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Can't make it
          </button>
        </div>
      </Field>

      {/* Guest counter — only when attending */}
      {willAttend === "Yes" && (
        <GuestCounter
          value={guests}
          onChange={(val) => form.setValue("guests", val)}
        />
      )}

      <div className="pt-1">
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl text-[15px] font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalizing…
            </>
          ) : (
            "Complete registration"
          )}
        </Button>
      </div>
    </form>
  )
}
