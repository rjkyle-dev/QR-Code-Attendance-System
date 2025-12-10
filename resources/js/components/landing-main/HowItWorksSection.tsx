import { Smartphone, ScanLine, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    step: "01",
    title: "Open the App",
    description: "Launch QRAttend on your smartphone. Available on iOS and Android.",
  },
  {
    icon: ScanLine,
    step: "02",
    title: "Scan QR Code",
    description: "Point your camera at the workplace QR code. It takes just a second.",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "You're Done!",
    description: "Attendance recorded instantly. Get confirmation and go about your day.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase">How It Works</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4 mb-6">
            Three Steps to
            <span className="text-gradient"> Effortless Attendance</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            No complex setup. No training needed. Just scan and go.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group"
            >
              <div className="bg-gradient-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-all duration-300 h-full">
                {/* Step number */}
                <div className="absolute -top-4 left-8 px-3 py-1 bg-primary text-primary-foreground text-sm font-heading font-semibold rounded-full">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="font-heading text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
