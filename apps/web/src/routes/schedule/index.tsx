import { createFileRoute } from "@tanstack/react-router"
import { scheduleData } from "@/constants/schedule-data"
import ScheduleSection from "@/components/home/schedule-section"

export const Route = createFileRoute("/schedule/")({
  component: SchedulePage,
})

function SchedulePage() {
  const groupedSchedule = scheduleData.reduce(
    (acc, item) => {
      if (!acc[item.date]) acc[item.date] = []
      acc[item.date].push(item)
      return acc
    },
    {} as Record<string, typeof scheduleData>
  )

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6">
      <ScheduleSection groupedSchedule={groupedSchedule} />      
    </div>
  )
}
