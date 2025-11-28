
import { Fingerprint, Shield, BarChart3, Users, Clock, Database } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Fingerprint,
      title: "Biometric Authentication",
      description: "Advanced fingerprint and facial recognition technology for secure access control"
    },
    {
      icon: Clock,
      title: "Real-time Monitoring",
      description: "Track employee attendance and working hours in real-time with instant notifications"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive reporting and analytics to optimize workforce management"
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Military-grade encryption and security protocols to protect sensitive data"
    },
    {
      icon: Users,
      title: "Multi-user Support",
      description: "Scalable solution supporting unlimited employees with role-based access"
    },
    {
      icon: Database,
      title: "Cloud Integration",
      description: "Seamless cloud synchronization with automatic backup and data recovery"
    }
  ];

  return (
      <section id="features" className="relative px-4 py-20">
          <div className="container mx-auto max-w-6xl">
              <div className="animate-fade-in-up mb-16 text-center" style={{ animationDelay: '1.6s' }}>
                  <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                      Powerful <span className="text-cfar-400 animate-pulse">Features</span>
                  </h2>
                  <p className="mx-auto max-w-2xl text-xl text-white/90">Everything you need to manage your workforce efficiently</p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, index) => {
                      const Icon = feature.icon;
                      const animationDelay = 1.8 + index * 0.1;
                      return (
                          <div
                              key={index}
                              className="border-green-500/20 animate-fade-in-up group rounded-xl border bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:bg-white/15"
                              style={{ animationDelay: `${animationDelay}s` }}
                          >
                              <div className="from-cfar-400 to-cfar-600 mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br transition-transform duration-300 group-hover:scale-110">
                                  <Icon className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                              <p className="leading-relaxed text-white/80">{feature.description}</p>
                          </div>
                      );
                  })}
              </div>
          </div>
      </section>
  );
};

export default Features;
