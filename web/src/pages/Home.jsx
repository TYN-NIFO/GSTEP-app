import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './AuthPage';

const Home = () => {
  const { user } = useAuth();

  if (user) {
    // If user is logged in, redirect to dashboard
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user.companyName}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Manage your recruitment drives and track applications.
            </p>
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-md bg-blue-600 text-white text-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <main className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
        <motion.div 
          className="md:w-1/2 mb-10 md:mb-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find the right talent
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Submit drive requests seamlessly. GStep connects companies with campuses.
          </p>
          <Link
            to="/register"
            className="px-6 py-3 rounded-md bg-blue-600 text-white text-lg hover:bg-blue-700 transition-colors inline-block mr-4"
          >
            Register Your Company
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-md border border-blue-600 text-blue-600 text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Login
          </Link>
        </motion.div>
        
        <motion.div 
          className="md:w-1/2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-6 text-center">How it works</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Register', desc: 'Create your company profile with HR details' },
                { step: '2', title: 'Submit Drive', desc: 'Post your recruitment requirements and criteria' },
                { step: '3', title: 'Track Applications', desc: 'View student applications and manage selections' },
                { step: '4', title: 'View Statistics', desc: 'Monitor placement statistics and analytics' }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
