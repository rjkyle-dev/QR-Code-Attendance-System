import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Clock } from "lucide-react";
import { Link } from "@inertiajs/react";
import QRCodeVisual from "./QRCodeVisual";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8 mx-12">
            {/* <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Trusted by 500+ companies
              </span>
            </div> */}
            
            <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Attendance Made
              <span className="text-gradient block">Simple & Smart</span>
            </h1>
            
            <p className="animate-fade-up-delay-2 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Revolutionize your workforce management with QR code-based attendance tracking. 
              Fast, secure, and effortless for employees and managers alike.
            </p>
            
            <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href={route('public.attendance')}>
                <Button variant="hero" size="xl" className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Start Attendance
                </Button>
              </Link>
            </div>
            
            {/* <div className="animate-fade-up-delay-3 flex items-center gap-8 justify-center lg:justify-start pt-4">
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-gradient">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-gradient">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-gradient">&lt;2s</div>
                <div className="text-sm text-muted-foreground">Check-in Time</div>
              </div>
            </div> */}
          </div>
          
          {/* Visual */}
          <div className="flex justify-center lg:justify-end mx-12">
            <div className="animate-float">
              <QRCodeVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
