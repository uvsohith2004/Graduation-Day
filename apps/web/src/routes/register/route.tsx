import  { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { gsap } from "gsap";
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Download,
  Camera,
  X,
  ChevronRight,
  Users,
  Phone,
  BookOpen,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { useRegistrationStore } from "@/store";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});



const BRANCHES = ["ECE", "CSE", "MECH", "CIVIL", "CSE-IOT", "CSE-AIML", "MBA", "EEE", "CSE-AI", "Others"];
const GUEST_MAX = 4;

import { useGetPresignedUrlMutation, useCreateRegistrationMutation, useUploadFileMutation, useCheckEligibilityMutation } from "@/api/mutation";
import { useRegistrationQuery } from "@/api/queries";
function GuestCounter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Guests</p>
          <p className="text-xs text-muted-foreground">Max {GUEST_MAX} additional</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-40"
          disabled={value === 0}
        >
          <span className="text-base leading-none">−</span>
        </button>
        <span className="text-lg font-semibold text-foreground w-5 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(GUEST_MAX, value + 1))}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          disabled={value === GUEST_MAX}
        >
          <span className="text-base leading-none">+</span>
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
function RegisterPage() {
  const navigate = useNavigate();
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  useEffect(() => {
    if (!isAuthPending && !session) {
      navigate({ to: "/signin" });
    }
  }, [session, isAuthPending, navigate]);

  const { data: registrationData, isPending: isRegPending } = useRegistrationQuery();

  useEffect(() => {
    if (registrationData && session?.user?.id) {
      // @ts-ignore - Route may be generating
      navigate({ to: '/tickets/$userId', params: { userId: session.user.id } });
    }
  }, [registrationData, session, navigate]);



  const {
    step,
    rollNo,
    photoPreview,
    photoUrl: uploadedPhotoUrl,
    mobileNumber,
    branch,
    willAttend,
    guests,
    setField,
    reset
  } = useRegistrationStore();

  const stepContainerRef = useRef<HTMLDivElement>(null);

  const [confirmRollNoOpen, setConfirmRollNoOpen] = useState(false);
  const [rollNoError, setRollNoError] = useState("");
  const [photoError, setPhotoError] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const presignedUrlMutation = useGetPresignedUrlMutation();
  const registerMutation = useCreateRegistrationMutation();
  const uploadFileMutation = useUploadFileMutation();
  const checkEligibilityMutation = useCheckEligibilityMutation();

  if (isAuthPending || isRegPending || (registrationData && session?.user?.id)) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-10">
        <div className="flex-1 flex flex-col md:items-center md:justify-center md:py-12 md:px-4">
          <div className="w-full md:max-w-md md:rounded-3xl md:border md:border-border md:bg-card md:shadow-sm">
            <div className="p-10 flex justify-center items-center h-[300px]">
               <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const animateStepChange = (nextStep: number) => {
    if (stepContainerRef.current) {
      gsap.to(stepContainerRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.18,
        ease: "power2.inOut",
        onComplete: () => {
          setField("step", nextStep);
          gsap.fromTo(
            stepContainerRef.current,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }
          );
        },
      });
    } else {
      setField("step", nextStep);
    }
  };

  const handleRollNoSubmit = async () => {
    try {
      const response = await checkEligibilityMutation.mutateAsync(rollNo.toUpperCase());
      console.log(response)
      setRollNoError("");
      setConfirmRollNoOpen(true);
    } catch (error: any) {
      setRollNoError(error?.response?.data?.message || "This roll number isn't on the list.");
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    
    // Final check before hitting the backend
    if (photoFile.size > 3 * 1024 * 1024) {
      setPhotoError("File size must be less than 3MB.");
      return;
    }
    if (photoFile.type !== "image/jpeg" && photoFile.type !== "image/png") {
      setPhotoError("Only JPG and PNG formats are allowed.");
      return;
    }

    setPhotoError("");
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // 1. Get presigned URL
      const { uploadUrl, fileUrl } = await presignedUrlMutation.mutateAsync({ 
        fileType: photoFile.type, 
        fileSize: photoFile.size 
      });
      
      // 2. Upload file directly to S3
      await uploadFileMutation.mutateAsync({
        uploadUrl,
        file: photoFile,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        }
      });

      // 3. Update store (fallback to preview if backend doesn't provide fileUrl yet)
      setField("photoUrl", fileUrl || photoPreview);
      animateStepChange(3);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const payload = {
        hallTicketNumber: rollNo.toUpperCase(),
        photo: uploadedPhotoUrl,
        mobileNumber,
        branch,
        willAttend,
        numberOfGuests: String(guests),
        email: session?.user?.email,
        studentName: session?.user?.name || "Unknown",
      };
      await registerMutation.mutateAsync(payload);
      reset(); // clear form for next session
      if (session?.user?.id) {
        // @ts-ignore - Route may be generating
        navigate({ to: '/tickets/$userId', params: { userId: session.user.id } });
      } else {
        animateStepChange(4);
      }
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  if (isAuthPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stepTitles = ["", "Verify your identity", "Add your photo", "Event details", "You're registered!"];
  const stepSubtitles = [
    "",
    "Enter your hall ticket number to check eligibility.",
    "This photo will appear on your graduation pass.",
    "A few more details and you're done.",
    "Your pass is ready.",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pt-10">

      <div className="flex-1 flex flex-col md:items-center md:justify-center md:py-12 md:px-4">
        <div className="w-full md:max-w-md md:rounded-3xl md:border md:border-border md:bg-card md:shadow-sm">

          {/* Page heading */}
          <div className="px-5 pt-8 pb-2 md:px-8 md:pt-10 relative">
            <div className="absolute top-3 left-5 md:top-5 md:left-8 flex gap-4">
              {step > 1 && step < 4 && (
                <button 
                  onClick={() => animateStepChange(step - 1)}
                  className="flex items-center text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back
                </button>
              )}
              {step > 1 && step < 4 && (
                <button 
                  onClick={() => reset()}
                  className="flex items-center text-[11px] font-medium text-destructive hover:text-destructive/80 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </button>
              )}
            </div>
            {step < 4 && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Step {step} of 3
              </p>
            )}
            <h1 className="text-[1.6rem] font-bold tracking-tight text-foreground leading-tight">
              {stepTitles[step]}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {stepSubtitles[step]}
            </p>
          </div>

          {/* Step content */}
          <div ref={stepContainerRef} className="px-5 pt-6 pb-10 md:px-8 md:pb-10">

            {/* ── STEP 1: Roll Number ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Roll number
                  </label>
                  <Input
                    placeholder="e.g. 20A91A0401"
                    value={rollNo}
                    onChange={(e) => {
                      setField("rollNo", e.target.value);
                      setRollNoError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && rollNo.length >= 5 && handleRollNoSubmit()}
                    className={cn(
                      "h-13 rounded-2xl text-base uppercase tracking-wider font-medium px-4 border-border transition-colors",
                      rollNoError && "border-destructive focus-visible:ring-destructive/30"
                    )}
                    autoFocus
                    autoCapitalize="characters"
                  />
                  {rollNoError && (
                    <p className="text-xs text-destructive flex items-center gap-1.5 pt-0.5">
                      <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                      {rollNoError}
                    </p>
                  )}
                </div>

                <Button
                  className="w-full h-12 rounded-2xl text-[15px] font-semibold"
                  onClick={handleRollNoSubmit}
                  disabled={rollNo.length < 5 || checkEligibilityMutation.isPending}
                >
                  {checkEligibilityMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Check eligibility
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Only registered students can collect their graduation pass.
                </p>

                <AlertDialog open={confirmRollNoOpen} onOpenChange={setConfirmRollNoOpen}>
                  <AlertDialogContent className="rounded-3xl border-border bg-card mx-4 max-w-sm">
                    <AlertDialogHeader className="space-y-2">
                      <AlertDialogTitle className="text-lg font-bold">Confirm roll number</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        You entered{" "}
                        <span className="font-mono font-semibold text-foreground text-[13px] bg-muted px-1.5 py-0.5 rounded-md uppercase">
                          {rollNo}
                        </span>
                        . This can't be changed after you continue.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-2 pt-2">
                      <AlertDialogCancel className="flex-1 rounded-xl h-11 text-sm border-border">
                        Go back
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="flex-1 rounded-xl h-11 text-sm bg-primary text-primary-foreground font-semibold"
                        onClick={() => {
                          setConfirmRollNoOpen(false);
                          animateStepChange(2);
                        }}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* ── STEP 2: Photo Upload ── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Photo picker */}
                <div className="flex flex-col items-center">
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg, image/png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        if (file.size > 3 * 1024 * 1024) {
                          setPhotoError("File size must be less than 3MB.");
                          return;
                        }
                        if (file.type !== "image/jpeg" && file.type !== "image/png") {
                          setPhotoError("Only JPG and PNG formats are allowed.");
                          return;
                        }
                        setPhotoError("");
                        setPhotoFile(file);
                        setField("photoPreview", URL.createObjectURL(file));
                      }
                    }}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden",
                      "w-44 h-56",
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
                          className="w-full h-full object-cover"
                        />
                        {/* overlay on hover */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-7 h-7 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground p-5 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                          <Camera className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-medium leading-relaxed">
                          Tap to upload your passport photo
                        </p>
                      </div>
                    )}
                  </label>

                  {photoPreview && (
                    <button
                      onClick={() => {
                        setField("photoPreview", "");
                        setPhotoFile(null);
                      }}
                      className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Remove photo
                    </button>
                  )}
                </div>

                {photoError && (
                  <div className="flex items-center gap-1.5 mt-2 justify-center text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-xs font-medium">{photoError}</p>
                  </div>
                )}

                {/* Tip card */}
                <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Use a clear, front-facing photo with a plain background. It'll be printed on your pass.
                  </p>
                </div>

                <Button
                  className="w-full h-12 rounded-2xl text-[15px] font-semibold relative overflow-hidden"
                  onClick={handlePhotoUpload}
                  disabled={!photoFile || isUploading}
                >
                  {isUploading && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-primary-foreground/20 transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }} 
                    />
                  )}
                  <span className="relative z-10 flex items-center">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Uploading… {uploadProgress}%
                      </>
                    ) : (
                      <>
                        Upload &amp; continue
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
            )}

            {/* ── STEP 3: Details ── */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Mobile */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Mobile number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="10-digit number"
                      value={mobileNumber}
                      onChange={(e) => setField("mobileNumber", e.target.value)}
                      className="h-13 rounded-2xl pl-10 text-base"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Branch
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                    <Select value={branch} onValueChange={(val) => setField("branch", val || "")}>
                      <SelectTrigger className="h-13 rounded-2xl pl-10 text-base border-border w-full py-6">
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border bg-popover">
                        {BRANCHES.map((b) => (
                          <SelectItem key={b} value={b} className="rounded-xl text-sm h-10">
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Attendance toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Attending the ceremony?
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted">
                    <button
                      onClick={() => setField("willAttend", "Yes")}
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
                      onClick={() => setField("willAttend", "No")}
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
                </div>

                {/* Guest counter — only when attending */}
                {willAttend === "Yes" && (
                  <GuestCounter value={guests} onChange={(val) => setField("guests", val)} />
                )}

                <div className="pt-1">
                  <Button
                    className="w-full h-12 rounded-2xl text-[15px] font-semibold"
                    onClick={handleFinalSubmit}
                    disabled={!mobileNumber || !branch || registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Finalizing…
                      </>
                    ) : (
                      "Complete registration"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Success ── */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Success badge */}
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">Registration complete</p>
                </div>

                {/* Pass card */}
                <div className="rounded-3xl border border-border overflow-hidden">
                  {/* Card header stripe */}
                  <div className="bg-primary px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-semibold mb-0.5">
                        Graduation Pass
                      </p>
                      <p className="text-white font-mono font-bold text-lg tracking-wider uppercase">
                        {rollNo}
                      </p>
                    </div>
                    {uploadedPhotoUrl && (
                      <div className="w-14 h-16 rounded-xl overflow-hidden border-2 border-white/20 shrink-0">
                        <img
                          src={uploadedPhotoUrl}
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="bg-card px-5 py-4 space-y-3">
                    <div className="flex justify-between items-center py-2.5 border-b border-border/60">
                      <span className="text-sm text-muted-foreground">Branch</span>
                      <span className="text-sm font-semibold text-foreground">{branch}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-border/60">
                      <span className="text-sm text-muted-foreground">Attending</span>
                      <span className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        willAttend === "Yes"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {willAttend === "Yes" ? "Confirmed" : "Not attending"}
                      </span>
                    </div>
                    {willAttend === "Yes" && (
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-sm text-muted-foreground">Guests</span>
                        <span className="text-sm font-semibold text-foreground">{guests}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button
                    variant="outline"
                    className="h-12 rounded-2xl text-sm border-border"
                    onClick={async (e) => {
                      try {
                        const btn = e.currentTarget;
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<span class="flex items-center"><svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</span>';
                        btn.disabled = true;

                        const ticketPayload = {
                          student_name: session?.user?.name || "Unknown",
                          hall_ticket_number: rollNo.toUpperCase(),
                          branch: branch,
                          guest_count: guests,
                          photo: uploadedPhotoUrl,
                        };

                        const { generateTicketImage } = await import('@/lib/ticket-generator');
                        const dataUrl = await generateTicketImage(ticketPayload);
                        
                        const link = document.createElement('a');
                        link.download = `VEC-Alumni-Pass-${rollNo.toUpperCase()}.png`;
                        link.href = dataUrl;
                        link.click();
                        
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                      } catch (err) {
                        console.error(err);
                        alert("Failed to generate ticket. Please make sure template.png is in the public folder.");
                      }
                    }}
                  >
                    <Download className="mr-2 w-4 h-4" />
                    Download Pass
                  </Button>
                  <Button
                    className="h-12 rounded-2xl text-sm font-semibold"
                    onClick={() => navigate({ to: "/" })}
                  >
                    Done
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
