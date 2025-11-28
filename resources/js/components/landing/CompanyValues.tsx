
import { Target, Eye, Heart, Award } from "lucide-react";
import animation from "tailwindcss-animate";

const CompanyValues = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To revolutionize workforce management through innovative biometric solutions that enhance security, efficiency, and employee satisfaction.",
      delay: "0.8s"
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "To be the leading provider of intelligent attendance management systems that empower organizations worldwide to optimize their human resources.",
      delay: "1.0s"
    },
    {
      icon: Heart,
      title: "Our Values",
      description: "Innovation, Security, Reliability, and Customer-centricity drive everything we do. We believe in creating solutions that make a difference.",
      delay: "1.2s"
    },
    {
      icon: Award,
      title: "Our Promise",
      description: "Delivering cutting-edge technology with uncompromising quality, ensuring our clients achieve maximum efficiency and security in their operations.",
      delay: "1.4s"
    }
  ];

  return (
    <section id="company-values" className="py-20 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose <span className="text-cfar-400">CFARBEMCO?</span>
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Built on a foundation of excellence and innovation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div 
                key={index}
                className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-green-500/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: value.delay }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cfar-400 to-cfar-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-green">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                    <p className="text-white/90 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CompanyValues;
