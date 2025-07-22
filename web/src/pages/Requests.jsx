import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Calendar, MapPin, Users } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Requests = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await api.get('/company/requests');
      setDrives(response.data);
    } catch (error) {
      toast.error('Failed to fetch drive requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredDrives = drives.filter(drive => 
    filter === 'All' || drive.status === filter
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drive Requests</h1>
            <p className="text-gray-600">Manage and track your recruitment drive requests</p>
          </div>
          <Link
            to="/post-drive"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Post New Drive
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['All', 'Pending', 'Accepted', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status} ({status === 'All' ? drives.length : drives.filter(d => d.status === status).length})
              </button>
            ))}
          </nav>
        </div>

        {/* Drives List */}
        <div className="space-y-4">
          {filteredDrives.length > 0 ? (
            filteredDrives.map((drive, index) => (
              <motion.div
                key={drive._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{drive.driveTitle}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(drive.status)}`}>
                        {drive.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{drive.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(drive.dateTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })} at {new Date(drive.dateTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {drive.mode}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Submitted {new Date(drive.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {drive.status === 'Accepted' && (
                      <Link
                        to={`/drive/${drive._id}/applications`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Applications
                      </Link>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Eligibility Criteria:</h4>
                    <p className="text-sm text-gray-600">{drive.eligibilityCriteria}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Calendar className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No drive requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'All' 
                  ? "You haven't submitted any drive requests yet."
                  : `No ${filter.toLowerCase()} drive requests found.`
                }
              </p>
              <div className="mt-6">
                <Link
                  to="/post-drive"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Post Your First Drive
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Requests;
