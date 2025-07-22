import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  PlusIcon,
  BriefcaseIcon,
  UserIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  // ... other icons
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Post', href: '/post', icon: PlusIcon },
    { name: 'My Jobs', href: '/opportunities', icon: BriefcaseIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'About', href: '/about', icon: UserIcon },
    { name: 'Students', href: '/students', icon: UsersIcon },
  ];

  return (
    <nav className="bg-white shadow-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🎓</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Alumni Portal
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/dashboard" 
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/dashboard') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/post" 
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/post') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Post
              </Link>
              <Link 
                to="/opportunities" 
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/opportunities') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                My Jobs
              </Link>
              <Link 
                to="/chat" 
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/chat') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Chat
              </Link>
              <Link 
                to="/about" 
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/about') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                About
              </Link>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.currentCompany}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-semibold transition-colors duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/dashboard" 
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/dashboard') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/post" 
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/post') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Post
              </Link>
              <Link 
                to="/opportunities" 
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/opportunities') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                My Jobs
              </Link>
              <Link 
                to="/chat" 
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/chat') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Chat
              </Link>
              <Link 
                to="/about" 
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive('/about') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
















