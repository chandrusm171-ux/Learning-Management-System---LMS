import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Linkedin, Github, Youtube } from 'lucide-react';

const links = {
  Learn: [
    { label: 'All Courses', to: '/courses' },
    { label: 'Categories', to: '/courses' },
    { label: 'Free Courses', to: '/courses?free=true' },
    { label: 'Certificates', to: '/courses' },
  ],
  Company: [
    { label: 'About Us', to: '/' },
    { label: 'Careers', to: '/' },
    { label: 'Blog', to: '/' },
    { label: 'Press', to: '/' },
  ],
  Support: [
    { label: 'Help Center', to: '/' },
    { label: 'Contact Us', to: '/' },
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LMS<span className="text-violet-400">Pro</span></span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              The world-class learning platform that empowers millions of students and instructors to achieve their goals.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-gray-800 hover:bg-violet-600 text-gray-400 hover:text-white rounded-lg transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-white font-semibold text-sm mb-4">{group}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm hover:text-violet-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} LMSPro. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-gray-800 rounded-full">🌍 English</span>
            <span className="text-xs px-2 py-1 bg-gray-800 rounded-full">₹ INR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}