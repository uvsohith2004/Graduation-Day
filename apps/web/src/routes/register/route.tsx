import { useEffect, useRef, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { gsap } from "gsap"
import { ArrowLeft, RotateCcw, Loader2 } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { useRegistrationStore } from "@/store"
import { StepRollNumber } from "@/components/register/step-roll-number"
import { StepPhotoUpload } from "@/components/register/step-photo-upload"
import { StepDetails } from "@/components/register/step-details"
import { StepSuccess } from "@/components/register/step-success"
import type { DetailsFormValues } from "@/lib/register-schemas"
import {
  useGetPresignedUrlMutation,
  useCreateRegistrationMutation,
  useUploadFileMutation,
  useCheckEligibilityMutation,
} from "@/api/mutation"
import { useRegistrationQuery } from "@/api/queries"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

const STEP_TITLES = [
  "",
  "Verify your identity",
  "Add your photo",
  "Event details",
  "You're registered!",
]

const STEP_SUBTITLES = [
  "",
  "Enter your hall ticket number to check eligibility.",
  "This photo will appear on your graduation pass.",
  "A few more details and you're done.",
  "Your pass is ready.",
]

function RegisterPage() {
  const navigate = useNavigate()
  const { data: session, isPending: isAuthPending } = authClient.useSession()

  useEffect(() => {
    if (!isAuthPending && !session) {
      navigate({ to: "/signin" })
    }
  }, [session, isAuthPending, navigate])

  const { data: registrationData, isPending: isRegPending } =
    useRegistrationQuery()

  useEffect(() => {
    if (registrationData && session?.user?.id) {
      navigate({ to: "/tickets/$userId", params: { userId: session.user.id } })
    }
  }, [registrationData, session, navigate])

  const {
    step,
    rollNo,
    photoPreview,
    photoUrl: uploadedPhotoUrl,
    mobileNumber,
    branch,
    studentName,
    willAttend,
    guests,
    setField,
    reset,
  } = useRegistrationStore()

  const stepContainerRef = useRef<HTMLDivElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const presignedUrlMutation = useGetPresignedUrlMutation()
  const registerMutation = useCreateRegistrationMutation()
  const uploadFileMutation = useUploadFileMutation()
  const checkEligibilityMutation = useCheckEligibilityMutation()

  // --- Loading state ---
  if (
    isAuthPending ||
    isRegPending ||
    (registrationData && session?.user?.id)
  ) {
    return (
      <div className="flex min-h-screen flex-col bg-background pt-10">
        <div className="flex flex-1 flex-col md:items-center md:justify-center md:px-4 md:py-12">
          <div className="w-full md:max-w-md md:rounded-3xl md:border md:border-border md:bg-card md:shadow-sm">
            <div className="flex h-[300px] items-center justify-center p-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- GSAP step transition ---
  const animateStepChange = (nextStep: number) => {
    if (stepContainerRef.current) {
      gsap.to(stepContainerRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.18,
        ease: "power2.inOut",
        onComplete: () => {
          setField("step", nextStep)
          gsap.fromTo(
            stepContainerRef.current,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }
          )
        },
      })
    } else {
      setField("step", nextStep)
    }
  }

  // --- Step 1 handlers ---
  const handleCheckEligibility = async (rollNoValue: string) => {
    const response = await checkEligibilityMutation.mutateAsync(rollNoValue)
    console.log(response)
    setField("rollNo", rollNoValue)
    setField("studentName", response.studentName)
    setField("branch", response.branch)
  }

  const handleRollNoConfirm = () => {
    animateStepChange(2)
  }

  // --- Step 2 handlers ---
  const handlePhotoSelect = (file: File) => {
    setField("photoPreview", URL.createObjectURL(file))
  }

  const handlePhotoRemove = () => {
    setField("photoPreview", "")
  }

  const handlePhotoUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    try {
      const { uploadUrl, fileUrl } = await presignedUrlMutation.mutateAsync({
        fileType: file.type,
        fileSize: file.size,
      })

      await uploadFileMutation.mutateAsync({
        uploadUrl,
        file,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          setUploadProgress(percentCompleted)
        },
      })

      setField("photoUrl", fileUrl || photoPreview)
      animateStepChange(3)
    } catch (error) {
      console.error("Upload failed", error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // --- Step 3 handler ---
  const handleDetailsSubmit = async (data: DetailsFormValues) => {
    try {
      setField("mobileNumber", data.mobileNumber)
      setField("willAttend", data.willAttend)
      setField("guests", data.guests)

      const payload = {
        hallTicketNumber: rollNo.toUpperCase(),
        photo: uploadedPhotoUrl,
        mobileNumber: data.mobileNumber,
        branch: branch,
        willAttend: data.willAttend,
        numberOfGuests: String(data.guests),
        email: session?.user?.email,
        studentName: studentName,
      }
      await registerMutation.mutateAsync(payload)
      reset()
      if (session?.user?.id) {
        navigate({
          to: "/tickets/$userId",
          params: { userId: session.user.id },
        })
      } else {
        animateStepChange(4)
      }
    } catch (error) {
      console.error("Registration failed", error)
    }
  }

  // --- Step 4 handler ---
  const handleDownloadPass = async (): Promise<string> => {
    const ticketPayload = {
      student_name: studentName,
      hall_ticket_number: rollNo.toUpperCase(),
      branch,
      guest_count: guests,
      photo: uploadedPhotoUrl,
    }
    const { generateTicketImage } = await import("@/lib/ticket-generator")
    return generateTicketImage(ticketPayload)
  }

  if (isAuthPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pt-10">
      <div className="flex flex-1 flex-col md:items-center md:justify-center md:px-4 md:py-12">
        <div className="w-full md:max-w-md md:rounded-3xl md:border md:border-border md:bg-card md:shadow-sm">
          {/* Page heading */}
          <div className="relative px-5 pt-8 pb-2 md:px-8 md:pt-10">
            <div className="absolute top-3 left-5 flex gap-4 md:top-5 md:left-8">
              {step > 1 && step < 4 && (
                <button
                  onClick={() => animateStepChange(step - 1)}
                  className="flex items-center text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back
                </button>
              )}
              {step > 1 && step < 4 && (
                <button
                  onClick={() => reset()}
                  className="flex items-center text-[11px] font-medium text-destructive transition-colors hover:text-destructive/80"
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
            {step < 4 && (
              <p className="mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Step {step} of 3
              </p>
            )}
            <h1 className="text-[1.6rem] leading-tight font-bold tracking-tight text-foreground">
              {STEP_TITLES[step]}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {STEP_SUBTITLES[step]}
            </p>
          </div>

          {/* Step content */}
          <div
            ref={stepContainerRef}
            className="px-5 pt-6 pb-10 md:px-8 md:pb-10"
          >
            {step === 1 && (
              <StepRollNumber
                defaultRollNo={rollNo}
                onCheck={handleCheckEligibility}
                onConfirm={handleRollNoConfirm}
                isPending={checkEligibilityMutation.isPending}
              />
            )}

            {step === 2 && (
              <StepPhotoUpload
                photoPreview={photoPreview}
                onPhotoSelect={handlePhotoSelect}
                onRemove={handlePhotoRemove}
                onUpload={handlePhotoUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            )}

            {step === 3 && (
              <StepDetails
                defaultValues={{ mobileNumber, willAttend, guests }}
                onSubmit={handleDetailsSubmit}
                isPending={registerMutation.isPending}
              />
            )}

            {step === 4 && (
              <StepSuccess
                rollNo={rollNo}
                branch={branch}
                willAttend={willAttend}
                guests={guests}
                photoUrl={uploadedPhotoUrl}
                onDownload={handleDownloadPass}
                onDone={() => navigate({ to: "/" })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
