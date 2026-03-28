
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-transparent border-t border-white/10 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">
                Graphify
              </span>
            </h3>
            <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
              Transforming walls into stories since 2018. We specialize in creating custom wall art 
              that enhances spaces and inspires experiences across healthcare, corporate, hospitality, 
              and residential environments.
            </p>
            <div className="flex items-center space-x-6">
              <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
                Follow Us
              </Button>
              <div className="flex space-x-5">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.897 1.297 2.049 1.297 3.346s-.49 2.448-1.297 3.323c-.875.897-2.026 1.297-3.323 1.297zm7.694 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.897.897 1.297 2.049 1.297 3.346s-.49 2.448-1.297 3.323c-.875.897-2.026 1.297-3.323 1.297z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-4">
              <li><a href="#portfolio" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300">Portfolio</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300">Services</a></li>
              <li><a href="/blogs" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300">Blog</a></li>
              <li><a href="#story" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300">Our Story</a></li>
              <li><a href="#reviews" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300">Reviews</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Services</h4>
            <ul className="space-y-4">
              <li><span className="text-gray-400 hover:text-white transition-colors cursor-default">Custom Wall Art</span></li>
              <li><span className="text-gray-400 hover:text-white transition-colors cursor-default">Healthcare Murals</span></li>
              <li><span className="text-gray-400 hover:text-white transition-colors cursor-default">Corporate Graphics</span></li>
              <li><span className="text-gray-400 hover:text-white transition-colors cursor-default">Cafe Designs</span></li>
              <li><span className="text-gray-400 hover:text-white transition-colors cursor-default">Home Interiors</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm">
            © {currentYear} Graphify. All rights reserved.
          </p>
          <div className="flex space-x-8 text-sm">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
