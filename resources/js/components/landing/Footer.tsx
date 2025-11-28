
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
      <footer className="relative mt-20 border-t border-green-500/20 bg-white/10 backdrop-blur-md">
          <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                  {/* Company Info */}
                  <div className="col-span-1 md:col-span-2">
                      <div className="mb-4 flex items-center space-x-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cfar-400 to-cfar-600 shadow-lg">
                              <span className="text-xl font-bold text-white">
                                  <img src="Logo.png" alt="" />
                              </span>
                          </div>
                          <div>
                              <h2 className="text-2xl font-bold text-white">CheckWise</h2>
                              <p className="text-cfar-300">by CFARBEMCO</p>
                          </div>
                      </div>
                      <p className="mb-4 max-w-md text-white/80">
                          Leading the future of workforce management with innovative biometric attendance solutions.
                      </p>
                      <div className="flex space-x-3">
                          <Button variant="main" size="sm" className="border-cfar-500 text-cfar-50 hover:bg-cfar-50 hover:text-cfar-700">
                              <Facebook className="h-4 w-4" />
                          </Button>
                          <Button variant="main" size="sm" className="border-cfar-500 text-cfar-50 hover:bg-cfar-50 hover:text-cfar-700">
                              <Twitter className="h-4 w-4" />
                          </Button>
                          <Button variant="main" size="sm" className="border-cfar-500 text-cfar-50 hover:bg-cfar-50 hover:text-cfar-700">
                              <Linkedin className="h-4 w-4" />
                          </Button>
                      </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                      <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
                      <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                              <Mail className="h-4 w-4 text-cfar-400" />
                              <span className="text-white/80">info@cfarbemco.com</span>
                          </div>
                          <div className="flex items-center space-x-3">
                              <Phone className="h-4 w-4 text-cfar-400" />
                              <span className="text-white/80">09206610474</span>
                          </div>
                          <div className="flex items-center space-x-3">
                              <MapPin className="h-4 w-4 text-cfar-400" />
                              <span className="text-white/80">Tibungol, Panabo City</span>
                          </div>
                      </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                      <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
                      <div className="space-y-2">
                          <a href="#" className="block text-white/80 transition-colors hover:text-cfar-400">
                              About Us
                          </a>
                          <a href="#" className="block text-white/80 transition-colors hover:text-cfar-400">
                              Features
                          </a>
                          <a href="#" className="block text-white/80 transition-colors hover:text-cfar-400">
                              Support
                          </a>
                          <a href="#" className="block text-white/80 transition-colors hover:text-cfar-400">
                              Privacy Policy
                          </a>
                      </div>
                  </div>
              </div>

              <div className="mt-8 border-t border-cfar-500/20 pt-8 text-center">
                  <p className="text-white/60">© 2025 CFARBEMCO. All rights reserved. CheckWise Biometric Attendance Management System.</p>
              </div>
          </div>
      </footer>
  );
};

export default Footer;
