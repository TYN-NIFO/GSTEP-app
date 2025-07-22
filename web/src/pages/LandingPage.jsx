import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <header className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary-600">GStep</h1>
        </div>
        
        <div>
          <Link
            to="/auth"
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Login / Register
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-16 flex flex-col md:flex -row items-center">
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
            to="/auth"
            className="px-6 py-3 rounded-md bg-primary-600 text-white text-lg hover:bg-primary-700 transition-colors inline-block"
          >
            Register Your Company
          </Link>
        </motion.div>
        
        <motion.div 
          className="md:w-1/2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Recruitment" 
            className="rounded-lg shadow-xl"
          />
        </motion.div>
      </main>
      
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-bold text-center mb-12">How It Works</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Register', desc: 'Create your company profile' },
              { title: 'Submit Drive', desc: 'Post your recruitment requirements' },
              { title: 'Track Status', desc: 'Monitor acceptance and progress' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <h4 className="text-xl font-semibold mb-2 text-primary-600">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;