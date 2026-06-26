
import { useEffect, useRef } from 'react';

import { gsap } from 'gsap';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { 
  CalendarDays, 
  MapPin, 
  GraduationCap, 

  Clock, 
  ChevronRight 
} from 'lucide-react';

export  function App() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate Hero Section
      tl.fromTo('.hero-element', 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }
      );

      // Animate Bento Grid / Sections on load (you can swap this to ScrollTrigger later)
      tl.fromTo('.bento-item',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        "-=0.4"
      );
    });

    return () => ctx.revert();
  }, []);

  const scheduleInfo = [
    { branch: 'CSE', date: '02-07-2026', time: '09:00 AM' },
    { branch: 'ECE', date: '02-07-2026', time: '11:30 AM' },
    { branch: 'MEC', date: '02-07-2026', time: '02:00 PM' },
    { branch: 'EEE', date: '02-07-2026', time: '04:00 PM' },
    { branch: 'Civil', date: '02-07-2026', time: '06:00 PM' },
  ];

  return (
    // Forced dark background as the default aesthetic
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-indigo-500/30">
      
      {/* Navbar Placeholder */}
      <nav className="fixed top-0 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-md z-50 px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-xl tracking-tight">Visvodaya Alumni Hub</div>
        <div className="flex gap-4">
          {/* Add your Theme Toggle here */}
          <a
            href="/signin"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main ref={heroRef} className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="hero-element inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm font-medium text-zinc-300 mb-8">
          <CalendarDays className="w-4 h-4 mr-2 text-indigo-400" />
          Graduation Day • July 2nd, 2026
        </div>

        <h1 className="hero-element text-5xl md:text-8xl font-black tracking-tighter mb-6">
          Celebrate Your <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">
            Legacy at VITS.
          </span>
        </h1>

        <p className="hero-element text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Join the official Class of 2026 directory. Upload your details, connect with peers, and prepare for the final milestone at Visvodaya Institute of Technology and Science.
        </p>

        <div className="hero-element flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        
        </div>
      </main>

      {/* Bento Grid layout instead of old blocky sections */}
      <section ref={bentoRef} className="px-6 max-w-7xl mx-auto pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* About Card */}
        <div className="bento-item md:col-span-2 bg-zinc-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
            <GraduationCap className="w-40 h-40" />
          </div>
          <h2 className="text-3xl font-bold mb-4">About the Event</h2>
          <p className="text-zinc-400 leading-relaxed max-w-xl">
            Graduation Day is the culmination of years of hard work, innovation, and community at VITS. This platform ensures your achievements are permanently archived in our digital yearbook. Update your profile to stay connected with your batchmates long after you leave campus.
          </p>
        </div>

        {/* Venue Card */}
        <div className="bento-item bg-zinc-900 border border-white/5 p-8 rounded-3xl flex flex-col justify-center">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
            <MapPin className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Campus Grounds</h3>
          <p className="text-zinc-400 text-sm">
            Visvodaya Institute of Technology & Science Auditorium, Udayagiri Road.
          </p>
        </div>

        {/* Schedule List (Replaces the heavy purple table) */}
        <div className="bento-item md:col-span-3 bg-zinc-900 border border-white/5 p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Branch Schedule</h2>
            <Clock className="w-6 h-6 text-zinc-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {scheduleInfo.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-zinc-950 border border-white/5 hover:border-indigo-500/30 transition-colors">
                <div className="text-indigo-400 font-bold mb-1">{item.branch}</div>
                <div className="text-sm text-zinc-300">{item.time}</div>
                <div className="text-xs text-zinc-500 mt-2">{item.date}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Minimal Contact / Quick Help Section */}
      <section className="px-6 max-w-7xl mx-auto pb-24">
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Have questions?</h2>
            <p className="text-zinc-400 mb-6">Reach out to the student coordinators if you face any issues uploading your data.</p>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full">
              Contact Support <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Quick contact form using shadcn */}
          <div className="flex-1 w-full max-w-md bg-zinc-950 p-6 rounded-2xl border border-white/5">
            <div className="space-y-4">
              <Input placeholder="Your Name" className="bg-zinc-900 border-zinc-800" />
              <Input placeholder="Registration Number" className="bg-zinc-900 border-zinc-800" />
              <Textarea placeholder="How can we help?" className="bg-zinc-900 border-zinc-800 resize-none" rows={3} />
              <Button className="w-full bg-white text-zinc-950 hover:bg-zinc-200">Send Message</Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
