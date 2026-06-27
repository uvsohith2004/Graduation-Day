import { z } from "zod"

export const rollNoSchema = z.object({
  rollNo: z
    .string()
    .min(5, "Roll number must be at least 5 characters")
    .transform((val) => val.toUpperCase()),
})

export type RollNoFormValues = z.infer<typeof rollNoSchema>

export const detailsSchema = z.object({
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  willAttend: z.enum(["Yes", "No"]),
  guests: z.number().min(0).max(4),
})

export type DetailsFormValues = z.infer<typeof detailsSchema>
