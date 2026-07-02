import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useRegistrationQuery } from '@/api/queries';
import {
  useUpdateRegistrationMutation,
  useRequestPhotoEditMutation,
  useGetPresignedUrlMutation,
  useUploadFileMutation,
} from '@/api/mutation';
import { useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { useEffect, useState, useRef } from 'react';
import { Download, Loader2, CheckCircle2, Edit2, Image as ImageIcon, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@repo/ui/components/dialog';
import { generateTicketImage } from '@/lib/ticket-generator';
import { cn } from '@repo/ui/lib/utils';
import { StepDetails } from '@/components/register/step-details';

export const Route = createFileRoute('/tickets/$userId')({
  component: TicketComponent,
});

function TicketComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: ticket, isPending: isTicketPending } = useRegistrationQuery();
  
  const updateRegMutation = useUpdateRegistrationMutation();
  const requestPhotoMutation = useRequestPhotoEditMutation();
  const getUrlMutation = useGetPresignedUrlMutation();
  const uploadMutation = useUploadFileMutation();

  const [isDownloading, setIsDownloading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthPending && !session) {
      navigate({ to: '/signin' });
    }
  }, [session, isAuthPending, navigate]);

  if (isAuthPending || isTicketPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-10">
        <div className="flex-1 flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-20 items-center justify-center">
        <h1 className="text-2xl font-bold">Ticket not found</h1>
        <p className="text-muted-foreground mt-2">We couldn't find a registration for this account.</p>
        <Button onClick={() => navigate({ to: '/register' })} className="mt-6">
          Go to Registration
        </Button>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // Calls the background in-memory canvas generator
      const dataUrl = await generateTicketImage(ticket);
      const link = document.createElement('a');
      link.download = `VEC-Alumni-Pass-${ticket.hall_ticket_number.toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Pass downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download pass. Make sure template.png is in public folder.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!session?.user?.id) return;
    try {
      await updateRegMutation.mutateAsync({
        userId: session.user.id,
        mobileNumber: data.mobileNumber,
        willAttend: data.willAttend === "Yes",
        numberOfGuests: data.willAttend === "Yes" ? data.guests.toString() : '0'
      });
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["registration", session.user.id] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestPhotoEdit = async () => {
    try {
      await requestPhotoMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["registration", session?.user?.id] });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || !session?.user?.id) return;
    try {
      const { uploadUrl, url } = await getUrlMutation.mutateAsync({
        fileType: photoFile.type,
        fileSize: photoFile.size
      });
      await uploadMutation.mutateAsync({
        uploadUrl,
        file: photoFile
      });
      await updateRegMutation.mutateAsync({
        userId: session.user.id,
        photo: url
      });
      setPhotoDialogOpen(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      
      // Update cache immediately so access is gone instantly
      queryClient.setQueryData(["registration", session.user.id], (old: any) => {
        if (!old) return old;
        return { ...old, photo: url, can_edit_photo: false, photo_edit_request: false };
      });
      
      toast.success("Photo updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["registration", session.user.id] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-10 px-4">
      <div className="flex-1 flex flex-col md:items-center py-12">
        <div className="w-full md:max-w-md md:rounded-3xl md:border md:border-border md:bg-card md:shadow-sm px-5 py-10 md:px-8 relative">
          
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-center">Registration Complete</h1>
            <p className="text-sm text-muted-foreground text-center">
              Your pass has been generated and is ready to download.
            </p>
          </div>

          <div className="rounded-3xl border border-border overflow-hidden mb-8 shadow-sm">
            {/* Card header stripe */}
            <div className="bg-primary px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-semibold mb-0.5">
                  Graduation Pass
                </p>
                <p className="text-white font-mono font-bold text-lg tracking-wider uppercase">
                  {ticket.hall_ticket_number}
                </p>
              </div>
              {ticket.photo && (
                <div className="w-14 h-16 rounded-xl overflow-hidden border-2 border-white/20 shrink-0">
                  <img
                    src={ticket.photo}
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
                <span className="text-sm font-semibold text-foreground">{ticket.branch}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-border/60">
                <span className="text-sm text-muted-foreground">Attending</span>
                <span className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full",
                  ticket.will_attend
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {ticket.will_attend ? "Confirmed" : "Not attending"}
                </span>
              </div>
              {ticket.will_attend && (
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-muted-foreground">Guests</span>
                  <span className="text-sm font-semibold text-foreground">{ticket.guest_count}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              className="h-12 rounded-2xl text-[15px] font-semibold w-full"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Generating Pass...
                </>
              ) : (
                <>
                  <Download className="mr-2 w-5 h-5" />
                  Download Entry Pass
                </>
              )}
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-2xl text-[15px] font-medium flex-1"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit2 className="mr-2 w-4 h-4" />
                Edit Details
              </Button>
              <Button
                variant={ticket.can_edit_photo ? "default" : "outline"}
                className={cn(
                  "h-12 rounded-2xl text-[15px] font-medium flex-1",
                  ticket.can_edit_photo && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => {
                  if (ticket.can_edit_photo) {
                    setPhotoDialogOpen(true);
                  } else if (!ticket.photo_edit_request) {
                    handleRequestPhotoEdit();
                  } else {
                    toast.info("Photo edit request is already pending approval.");
                  }
                }}
              >
                <ImageIcon className="mr-2 w-4 h-4" />
                {ticket.can_edit_photo ? "Upload Photo" : ticket.photo_edit_request ? "Request Pending" : "Change Photo"}
              </Button>
            </div>

            <Link to="/" className="w-full">
              <Button
                variant="secondary"
                className="h-12 rounded-2xl text-[15px] font-medium w-full"
              >
                Go to Homepage
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* Edit Details Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Registration Details</DialogTitle>
            <DialogDescription>Update your ticket details. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {ticket && (
              <StepDetails
                defaultValues={{
                  mobileNumber: ticket.mobile_number,
                  willAttend: ticket.will_attend ? "Yes" : "No",
                  guests: parseInt(ticket.guest_count) || 0
                }}
                onSubmit={handleEditSubmit}
                isPending={updateRegMutation.isPending}
                buttonText="Save Changes"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={(open) => {
        setPhotoDialogOpen(open);
        if (!open) {
          setPhotoPreview(null);
          setPhotoFile(null);
        }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Photo</DialogTitle>
            <DialogDescription>Upload a new passport size photo for your pass.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <input
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPhotoFile(file);
                  setPhotoPreview(URL.createObjectURL(file));
                }
              }}
            />
            <div 
              className="w-32 h-40 border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview as string} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="w-8 h-8" />
                  <span className="text-xs">Tap to select</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full" 
              disabled={!photoFile || getUrlMutation.isPending || uploadMutation.isPending || updateRegMutation.isPending}
              onClick={handlePhotoUpload}
            >
              {(getUrlMutation.isPending || uploadMutation.isPending || updateRegMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Upload Photo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
