import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useRegistrationQuery } from '@/api/queries';
import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { generateTicketImage } from '@/lib/ticket-generator';
import { cn } from '@repo/ui/lib/utils';

export const Route = createFileRoute('/tickets/$userId')({
  component: TicketComponent,
});

function TicketComponent() {
  const navigate = useNavigate();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const { data: ticket, isPending: isTicketPending } = useRegistrationQuery();
  const [isDownloading, setIsDownloading] = useState(false);

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
            <Link to="/" className="w-full">
              <Button
                variant="outline"
                className="h-12 rounded-2xl text-[15px] font-medium w-full"
              >
                Go to Homepage
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
