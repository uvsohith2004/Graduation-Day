import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, Building2 } from 'lucide-react';
import { Marquee } from "@/components/shadcn-space/animations/marquee";
import { aboutData } from '@/constants/about-data';



gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.reveal-card');
      
      gsap.fromTo('.reveal-header', 
        { y: 40, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
        }
      );

      gsap.fromTo(cards,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 flex flex-col justify-center bg-background overflow-hidden">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
   
        <div className="reveal-header mb-16 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Legacy of <span className="text-primary italic font-serif">Excellence</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-32">
          {/* Left Data Column */}
          <div className="reveal-card lg:col-span-7">
            <div className="bg-background border border-border/60 p-8 md:p-12 rounded-[2rem] h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-primary" />
                <h3 className="text-3xl font-bold text-foreground">{aboutData.collegeName}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                {aboutData.CollegeDescription}
              </p>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="reveal-card lg:col-span-5 flex flex-col gap-6">
            <div className="relative h-64 md:h-auto md:flex-1 rounded-[2rem] border border-border/60 overflow-hidden group">
              <div className="absolute inset-0 bg-secondary/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />
              <img 
                src={aboutData.image} 
                alt={aboutData.collegeName} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <h4 className="text-xl font-bold text-foreground mb-1">{aboutData.imageTitle}</h4>
                <p className="text-sm font-medium text-muted-foreground">{aboutData.imageSubtitle}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/30 border border-border/60 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <GraduationCap className="w-8 h-8 text-primary mb-2" />
                <span className="text-xl font-black text-foreground">{aboutData.programs}</span>
              </div>
              <div className="bg-secondary/30 border border-border/60 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <span className="text-xl font-black text-foreground">{aboutData.students}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership Section Header */}
        <div className="reveal-header mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Our Leadership</h2>
          <p className="text-muted-foreground mt-2">The visionaries behind PBR VITS</p>
        </div>
      </div>

      {/* Full-width Marquee */}
      <div className="w-full reveal-card">
        <Marquee className="[--duration:40s] py-4" pauseOnHover>
          {aboutData.collegeOfficials.map((official) => (
            <div 
              key={official.id} 
              className="w-64 mr-6 group relative flex flex-col bg-background border border-border/60 rounded-[1.5rem] overflow-hidden shrink-0"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-secondary/50">
                <img 
                  src={official.image} 
                  alt={official.name}
                  className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex flex-col justify-center bg-background z-10 border-t border-border/60">
                <h4 className="text-base font-bold text-foreground truncate">{official.name}</h4>
                <p className="text-sm text-primary font-medium mt-0.5 truncate">{official.designation}</p>
              </div>
            </div>
          ))}
        </Marquee>
      </div>

    </section>
  );
}
