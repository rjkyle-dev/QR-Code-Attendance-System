import { 
  Shield, 
  Clock, 
  MapPin, 
  BarChart3, 
  Users, 
  Bell,
  Fingerprint,
  Cloud
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Instant attendance updates with live dashboard monitoring for managers.",
  },
  {
    icon: MapPin,
    title: "Geo-fencing",
    description: "Ensure employees are at the right location when checking in.",
  },
  {
    icon: Shield,
    title: "Secure & Encrypted",
    description: "Enterprise-grade security with end-to-end encryption for all data.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed reports and insights on attendance patterns and trends.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Organize departments, shifts, and teams with ease.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated alerts for late arrivals, absences, and overtime.",
  },
  {
    icon: Fingerprint,
    title: "Anti-fraud System",
    description: "Prevent buddy punching with device verification and photo capture.",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Access your data anywhere. Automatic backups and sync across devices.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-500 text-sm font-medium tracking-wider uppercase">Features</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4 mb-6">
            Everything You Need to
            <span className="text-emerald-500"> Manage Attendance</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features designed for modern workplaces. Simple enough for everyone.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-card/90 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-heading font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
