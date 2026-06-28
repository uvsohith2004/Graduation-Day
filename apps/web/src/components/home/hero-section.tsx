import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@repo/ui/components/button"
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  CalendarDays,
  MapPin,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import homeData from "@/constants/home-data"
import { authClient } from "@/lib/auth-client"
import { useTicketStore } from "@/store"

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const { hasTicket } = useTicketStore()

  useEffect(() => {
    const ctx = gsap.context(() => {
      const hasPlayed = sessionStorage.getItem("heroAnimationPlayed")

      if (hasPlayed) {
        gsap.set(".hero-badge, .hero-title, .hero-desc, .hero-cta", {
          y: 0,
          opacity: 1,
        })
        gsap.set(".bento-img", {
          scale: 1,
          opacity: 1,
          y: 0,
        })
        gsap.set(".ambient-glow", {
          scale: 1,
          opacity: 1,
        })
        return
      }

      const tl = gsap.timeline({
        defaults: {
          ease: "power4.out",
          duration: 1.2,
        },
        onComplete: () => {
          sessionStorage.setItem("heroAnimationPlayed", "true")
        },
      })

      gsap.set(".hero-badge, .hero-title, .hero-desc, .hero-cta", {
        y: 40,
        opacity: 0,
      })

      gsap.set(".bento-img", {
        scale: 0.95,
        opacity: 0,
        y: 40,
      })

      gsap.set(".ambient-glow", {
        scale: 0.8,
        opacity: 0,
      })

      tl.to(".ambient-glow", {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: "power2.out",
      })
        .to(
          ".hero-badge",
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          "-=1.5"
        )
        .to(
          ".hero-title",
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
          },
          "-=0.6"
        )
        .to(
          ".hero-desc",
          {
            y: 0,
            opacity: 1,
          },
          "-=0.8"
        )
        .to(
          ".hero-cta",
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
          },
          "-=1"
        )
        .to(
          ".bento-img",
          {
            scale: 1,
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 1,
            ease: "back.out(1.2)",
          },
          "-=0.8"
        )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleNavigate = (path: string) => {
    navigate({ to: path })
  }

  const getMainButtonLabel = () => {
    if (session?.user?.role === "admin") return "Dashboard"
    if (hasTicket) return "Tickets"
    return homeData.registerButton
  }

  const getMainButtonRoute = () => {
    if (session?.user?.role === "admin") return "/dashboard"
    if (hasTicket && session?.user?.id) return `/tickets/${session.user.id}`
    return "/register"
  }

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen  flex-col items-center justify-start overflow-hidden pt-5 pb-20"
    >
      <div className="ambient-glow pointer-events-none absolute top-[20%] left-1/2 -z-10 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 text-center sm:px-6">
        <div className="hero-badge mb-8 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase backdrop-blur-md">
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          {homeData.heroBadge}
        </div>

        <h1 className="mb-6 text-5xl leading-[0.95] font-black tracking-tighter md:text-6xl">
          <span className="hero-title block text-foreground">
            {homeData.heroTitle}
          </span>

          <span className="hero-title block bg-linear-to-r from-primary via-primary/80 to-primary/40 bg-clip-text pb-2 text-transparent">
            {homeData.heroHighlight}
          </span>
        </h1>

        <div className="hero-desc mb-10 flex flex-col items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="text-base md:text-xl">
              {homeData.eventDate} {homeData.eventMonth}, {homeData.eventYear}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-base md:text-xl">
              {homeData.eventAddress}
            </span>
          </div>
        </div>

        <div className="mb-20 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <Button
            size="lg"
            onClick={() => handleNavigate(getMainButtonRoute())}
            className="hero-cta h-14 rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {getMainButtonLabel()}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleNavigate("/contact")}
            className="hero-cta h-14 rounded-2xl border-border/60 bg-background/50 px-8 text-base font-semibold text-foreground backdrop-blur-sm hover:bg-secondary"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Contact Us
          </Button>
        </div>

      </div>
    </section>
  )
}
