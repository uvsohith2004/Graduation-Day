import { createFileRoute } from '@tanstack/react-router';
import { Calendar, Clock, MapPin, GraduationCap } from 'lucide-react';


export const Route = createFileRoute('/schedule/')({
  component: SchedulePage,
});

const scheduleData = [
  { id: 1, branch: "CSE", date: "04-07-2026", reportingTime: "07:30 AM", venue: "KVR Convention Hall" },
  { id: 2, branch: "IoT", date: "04-07-2026", reportingTime: "07:30 AM", venue: "KVR Convention Hall" },
  { id: 3, branch: "MBA", date: "04-07-2026", reportingTime: "07:30 AM", venue: "KVR Convention Hall" },
  { id: 4, branch: "ECE", date: "05-07-2026", reportingTime: "07:30 AM", venue: "KVR Convention Hall" },
  { id: 5, branch: "Civil", date: "05-07-2026", reportingTime: "07:30 AM", venue: "KVR Convention Hall" },
  { id: 6, branch: "AIML", date: "05-07-2026", reportingTime: "07:30 AM", venue: "KVR Convention Hall" },
];

// Helper to format date strings from "DD-MM-YYYY" to a more readable format
function formatDate(dateStr: string) {
  const [day, month, year] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function SchedulePage() {
  // Group schedule data by date for a better chronological UX
  const groupedSchedule = scheduleData.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, typeof scheduleData>);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="mb-16 text-center sm:text-left flex flex-col items-center sm:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Class of 2026</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Graduation Schedule
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Find your reporting time and venue based on your branch. Please ensure you arrive on time to collect your robes.
          </p>
        </div>

        {/* --- Timeline / Grouped Cards --- */}
        <div className="space-y-12">
          {Object.entries(groupedSchedule).map(([date, events], index) => (
            <div key={date} className="relative">
              
              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary border border-border">
                  <Calendar className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Day {index + 1}</h2>
                  <p className="text-sm font-medium text-muted-foreground">{formatDate(date)}</p>
                </div>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 sm:pl-16">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className="group flex flex-col justify-between p-5 rounded-2xl border border-border/60 bg-background hover:bg-secondary/30 hover:border-primary/30 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {event.branch}
                        </h3>
                      </div>
                      
                      <div className="space-y-2.5">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-3 text-foreground/50" />
                          <span className="font-medium">Reporting: {event.reportingTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-3 text-foreground/50" />
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Vertical connecting line for timeline effect (desktop only) */}
              {index !== Object.keys(groupedSchedule).length - 1 && (
                <div className="hidden sm:block absolute left-6 top-14 bottom-[-3rem] w-[1px] bg-border/60" />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
