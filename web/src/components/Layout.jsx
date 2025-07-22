import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Welcome, {user.companyName}</h2>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
              {user.companyName?.charAt(0) || 'C'}
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
