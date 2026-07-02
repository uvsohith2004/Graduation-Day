import { formatDate } from "@/lib/format-date"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Skeleton } from "@repo/ui/components/skeleton"

interface ScheduleSectionProps {
  groupedSchedule: { date: string; events: { id: string; name: string; date: string; time: string; venue: string; }[] }[]
  isLoading?: boolean
}
const ScheduleSection = ({groupedSchedule, isLoading}:ScheduleSectionProps) => {
  return (
     <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center sm:text-left flex flex-col items-center sm:items-start">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Graduation Schedule
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Find your reporting time and venue based on your branch. Please ensure you arrive on time to collect your robes.
          </p>
        </div>


        <div className="space-y-12">
          {isLoading ? (
            <div className="space-y-12">
              {[1, 2].map((i) => (
                <div key={i} className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div>
                      <Skeleton className="h-6 w-20 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 sm:pl-16">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="p-5 rounded-2xl border border-border/60 bg-background h-32">
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : groupedSchedule.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No schedule available yet.
            </div>
          ) : (
            groupedSchedule.map(({date, events}, index) => (
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
                            {event.name}
                          </h3>
                        </div>
                        
                        <div className="space-y-2.5">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-3 text-foreground/50" />
                            <span className="font-medium">Reporting: {event.time}</span>
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
                
                {index !== groupedSchedule.length - 1 && (
                  <div className="hidden sm:block absolute left-6 top-14 -bottom-12 w-px bg-border/60" />
                )}
              </div>
            ))
          )}
        </div>

      </div>
  )
}

export default ScheduleSection
