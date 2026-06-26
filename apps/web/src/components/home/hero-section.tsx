import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from '@repo/ui/components/button';
import { ArrowRight, Sparkles, Calendar, Pin, Locate, MapPin, CalendarDays } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import homeData from '@/constants/home-data';

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const hasPlayed = sessionStorage.getItem('heroAnimationPlayed');

      if (hasPlayed) {
        // Set to final state immediately without animation
        gsap.set('.hero-badge, .hero-title, .hero-desc, .hero-cta', {
          y: 0,
          opacity: 1,
        });
        gsap.set('.bento-img', {
          scale: 1,
          opacity: 1,
          y: 0,
        });
        gsap.set('.ambient-glow', {
          scale: 1,
          opacity: 1,
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: {
          ease: 'power4.out',
          duration: 1.2,
        },
        onComplete: () => {
          sessionStorage.setItem('heroAnimationPlayed', 'true');
        },
      });

      // Initial state
      gsap.set('.hero-badge, .hero-title, .hero-desc, .hero-cta', {
        y: 40,
        opacity: 0,
      });

      gsap.set('.bento-img', {
        scale: 0.95,
        opacity: 0,
        y: 40,
      });

      gsap.set('.ambient-glow', {
        scale: 0.8,
        opacity: 0,
      });

      // Animate in
      tl.to('.ambient-glow', {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: 'power2.out',
      })
        .to(
          '.hero-badge',
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          '-=1.5'
        )
        .to(
          '.hero-title',
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
          },
          '-=0.6'
        )
        .to(
          '.hero-desc',
          {
            y: 0,
            opacity: 1,
          },
          '-=0.8'
        )
        .to(
          '.hero-cta',
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
          },
          '-=1'
        )
        .to(
          '.bento-img',
          {
            scale: 1,
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 1,
            ease: 'back.out(1.2)',
          },
          '-=0.8'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate({ to: path });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-32 pb-20"
    >
      {/* Ambient Background Glow */}
      <div className="ambient-glow absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        <div className="hero-badge inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          {homeData.heroBadge}
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-6">
          <span className="hero-title block text-foreground">
            {homeData.heroTitle}
          </span>

          <span className="hero-title block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40 pb-2">
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

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20">
          <Button
            size="lg"
            onClick={() => handleNavigate('/register')}
            className="hero-cta bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 rounded-2xl text-base font-semibold"
          >
            {homeData.registerButton}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleNavigate('/schedule')}
            className="hero-cta h-14 px-8 rounded-2xl text-base font-semibold border-border/60 hover:bg-secondary text-foreground backdrop-blur-sm bg-background/50"
          >
            <Calendar className="mr-2 w-5 h-5" />
            {homeData.scheduleButton}
          </Button>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[500px]">
          <div className="bento-img md:col-span-8 h-[250px] sm:h-[350px] md:h-full rounded-[1.5rem] md:rounded-[2rem] border border-border/60 overflow-hidden relative group">
            <div className="absolute inset-0 bg-secondary/20 group-hover:bg-transparent transition-colors duration-500 z-10" />

            <img
              src={homeData.heroImages.main}
              alt="Graduates throwing caps"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="flex md:col-span-4 flex-row md:flex-col gap-4 h-[120px] sm:h-[180px] md:h-full">
            <div className="bento-img flex-1 rounded-[1.5rem] md:rounded-[2rem] border border-border/60 overflow-hidden relative group">
              <div className="absolute inset-0 bg-secondary/20 group-hover:bg-transparent transition-colors duration-500 z-10" />

              <img
                src={homeData.heroImages.graduationScroll}
                alt="Graduation scroll"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="bento-img flex-1 rounded-[1.5rem] md:rounded-[2rem] border border-border/60 overflow-hidden relative group">
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10" />

              <img
                src={homeData.heroImages.campus}
                alt="University campus"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
