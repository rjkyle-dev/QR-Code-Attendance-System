
import { Button } from "@/components/ui/button";
import { Fingerprint, Clock, BarChart3 } from "lucide-react";
import * as motion from 'motion/react-client';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
      <section className="relative flex min-h-screen items-center justify-center px-4">
          <div className="container mx-auto max-w-4xl text-center">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <h1 className="mb-6 text-5xl leading-tight font-bold text-cfar-300 md:text-7xl text-shadow-lg shadow-black/100">
                      Check
                      <span className="text-cfar-50">Wise</span>
                      <span className="text-cfar-50 mt-4 block text-3xl font-normal md:text-4xl">Biometric Attendance Management System</span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-xl font-sans text-white/90 md:text-2xl">
                      Modernized your workforce management with cutting-edge biometric technology
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                      <Button
                          size="lg"
                          className="bg-cfar-400 hover:bg-cfar-500 animate-pulse-green px-8 py-3 text-lg text-white shadow-xl transition ease-in-out duration-500"
                          onClick={() => scrollToSection('features')}
                      >
                          <Fingerprint className="animate-scan mr-2 h-5 w-5" />
                          Get Started
                      </Button>
                      <Button
                          variant="outline"
                          size="lg"
                          className="hover:text-cfar-500 border-2 border-white bg-white/10 px-8 py-3 text-lg text-white backdrop-blur-sm hover:bg-white transition ease-in-out duration-300"
                          onClick={() => scrollToSection('company-values')}
                      >
                          Learn More
                      </Button>
                  </div>
              </div>

              {/* Features Preview */}
              <div className="animate-fade-in-up mt-16 grid grid-cols-1 gap-6 md:grid-cols-3" style={{ animationDelay: '0.6s' }}>
                  <div className="text-center">
                      <div className="from-cfar-400 to-cfar-600 animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br">
                          <Fingerprint className="animate-scan h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-white">Secure Access</h3>
                      <p className="text-white/80">Advanced biometric authentication</p>
                  </div>
                  <div className="text-center">
                      <motion.div
                          className="animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cfar-400 to-cfar-600 transition duration-600"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1 }}
                          style={{ animationDelay: '0.5s' }}
                      >
                          <Clock className="h-8 w-8 animate-spin text-white" style={{ animationDuration: '3s' }} />
                      </motion.div>
                      <h3 className="mb-2 text-lg font-semibold text-white">Real-time Tracking</h3>
                      <p className="text-white/80">Monitor attendance instantly</p>
                  </div>
                  <div className="text-center">
                      <div
                          className="from-cfar-400 to-cfar-600 animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br"
                          style={{ animationDelay: '1s' }}
                      >
                          <BarChart3 className="animate-analytics h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-white">Analytics</h3>
                      <p className="text-white/80">Comprehensive reporting dashboard</p>
                  </div>
              </div>
          </div>
      </section>
  );
};

export default Hero;
