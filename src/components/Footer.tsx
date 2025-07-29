import { Heart, Mail, Phone, MapPin, Github, Twitter, Linkedin, Globe, Coffee } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Personal Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-emerald-600">Finance Management</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">v1.0</span>
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Built with passion for better financial control. Simple, effective, and made just for you.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Crafted with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span>and lots of</span>
              <Coffee className="h-4 w-4 text-amber-600" />
              <span>by Kuldeep</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Quick Access
            </h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 hover:translate-x-1 transform">
                → Dashboard Overview
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 hover:translate-x-1 transform">
                → Add New Transaction
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 hover:translate-x-1 transform">
                → View All Records
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 hover:translate-x-1 transform">
                → Budget Planning
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Get In Touch
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-600 font-mono">kuldeep.dev@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">WhatsApp</p>
                  <p className="text-sm text-gray-600 font-mono">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Based in</p>
                  <p className="text-sm text-gray-600">Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Connect Online
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Github className="h-4 w-4 text-gray-700" />
                <a href="#" className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 font-mono">
                  github.com/kuldeep-dev
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-blue-600" />
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 font-mono">
                  linkedin.com/in/kuldeep
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Twitter className="h-4 w-4 text-blue-400" />
                <a href="#" className="text-sm text-gray-600 hover:text-blue-400 transition-colors duration-200 font-mono">
                  @kuldeep_dev
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-emerald-600" />
                <a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 font-mono">
                  kuldeep.dev
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 font-mono">
            © {currentYear} Built by Kuldeep • All rights reserved
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors duration-200">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors duration-200">Terms</a>
            <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors duration-200">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 