
import { Footer } from "@/components/home/footer-section"
import { HeroSection } from "@/components/home/hero-section"
import ScheduleSection from "@/components/home/schedule-section"
import { scheduleData } from "@/constants/schedule-data"
import { createFileRoute } from "@tanstack/react-router"


export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const groupedSchedule = scheduleData.reduce(
    (acc, item) => {
      if (!acc[item.date]) acc[item.date] = []
      acc[item.date].push(item)
      return acc
    },
    {} as Record<string, typeof scheduleData>
  )
  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-700 ease-in-out selection:bg-primary/30">
      <main>
        <HeroSection />
        <ScheduleSection
          groupedSchedule={groupedSchedule}
        />
        <Footer/>
      </main>
    </div>
  )
}
