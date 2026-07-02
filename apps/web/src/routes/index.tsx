
import { Footer } from "@/components/home/footer-section"
import { HeroSection } from "@/components/home/hero-section"
import ScheduleSection from "@/components/home/schedule-section"
import { useQuery } from "@tanstack/react-query"
import { getPublicBranches } from "@/services/fetch"
import { createFileRoute } from "@tanstack/react-router"


export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const { data: branches, isLoading } = useQuery({
    queryKey: ["public", "branches"],
    queryFn: getPublicBranches,
    staleTime: 60000,
  })

  const rawGrouped = (branches || []).reduce(
    (acc: any, item: any) => {
      if (!acc[item.date]) acc[item.date] = []
      acc[item.date].push(item)
      return acc
    },
    {} as Record<string, any[]>
  )

  const groupedSchedule = Object.keys(rawGrouped)
    .sort((a, b) => {
      const [d1, m1, y1] = a.split("-")
      const [d2, m2, y2] = b.split("-")
      return new Date(Number(y1), Number(m1) - 1, Number(d1)).getTime() - 
             new Date(Number(y2), Number(m2) - 1, Number(d2)).getTime()
    })
    .map(date => ({
      date,
      events: rawGrouped[date]
    }))
  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-700 ease-in-out selection:bg-primary/30">
      <main>
        <HeroSection />
        <ScheduleSection
          groupedSchedule={groupedSchedule}
          isLoading={isLoading}
        />
        <Footer/>
      </main>
    </div>
  )
}
