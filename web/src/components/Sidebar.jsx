import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, List, BarChart3, User, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Post Drive', icon: <FileText size={20} />, path: '/post-drive' },
    { name: 'Requests', icon: <List size={20} />, path: '/requests' },
    { name: 'Statistics', icon: <BarChart3 size={20} />, path: '/statistics' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };
  
  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">GStep</h1>
        <p className="text-sm text-gray-500">Recruiter Portal</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-sm text-gray-600 rounded-md hover:bg-gray-100 w-full"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;