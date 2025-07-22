import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🎓</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Alumni Portal</h3>
                <p className="text-sm text-neutral-400 font-medium">Connecting Careers</p>
              </div>
            </div>
            <p className="text-neutral-400 max-w-lg leading-relaxed text-base">
              Empowering alumni to create meaningful career opportunities for students through our professional networking platform.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/dashboard" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/jobs" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Job Postings
                </a>
              </li>
              <li>
                <a href="/students" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Students
                </a>
              </li>
              <li>
                <a href="/analytics" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center group">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-neutral-400 text-sm font-medium">
                © {currentYear} Alumni Portal. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
                  Privacy
                </a>
                <a href="#" className="text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
                  Terms
                </a>
                <a href="#" className="text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
                  Cookies
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-neutral-500 text-sm">Made with</span>
              <span className="text-red-500 text-lg">❤️</span>
              <span className="text-neutral-500 text-sm">for students</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
