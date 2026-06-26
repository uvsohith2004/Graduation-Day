import { AboutSection } from "@/components/home/about-section"
import { Footer } from "@/components/home/footer-section"
import { HeroSection } from "@/components/home/hero-section"
import { createFileRoute } from "@tanstack/react-router"


export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-700 ease-in-out selection:bg-primary/30">
  
  
      <main>
        <HeroSection />
        <AboutSection />
        <Footer/>
      </main>
    </div>
  )
}
