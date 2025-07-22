import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, TrendingUp, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrives: 0,
    pendingDrives: 0,
    acceptedDrives: 0,
    totalApplications: 0
  });
  const [recentDrives, setRecentDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [drivesResponse, statisticsResponse] = await Promise.all([
        api.get('/company/requests'),
        api.get('/company/statistics')
      ]);

      const drives = drivesResponse.data;
      const statistics = statisticsResponse.data;

      setStats({
        totalDrives: drives.length,
        pendingDrives: drives.filter(drive => drive.status === 'Pending').length,
        acceptedDrives: drives.filter(drive => drive.status === 'Accepted').length,
        totalApplications: statistics.overview.totalApplications
      });

      setRecentDrives(drives.slice(0, 5));
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your recruitment activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrives}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Drives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDrives}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted Drives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedDrives}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Link
              to="/post-drive"
              className="block p-6 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold">Post New Drive</h3>
              <p className="text-blue-100">Submit a new recruitment drive request</p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Link
              to="/requests"
              className="block p-6 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold">View Requests</h3>
              <p className="text-green-100">Check status of your drive requests</p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Link
              to="/statistics"
              className="block p-6 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
            >
              <TrendingUp className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold">View Statistics</h3>
              <p className="text-purple-100">Analyze placement data and trends</p>
            </Link>
          </motion.div>
        </div>

        {/* Recent Drives */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Drive Requests</h2>
          </div>
          <div className="p-6">
            {recentDrives.length > 0 ? (
              <div className="space-y-4">
                {recentDrives.map((drive) => (
                  <div key={drive._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{drive.driveTitle}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(drive.dateTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })} at {new Date(drive.dateTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} • {drive.mode}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(drive.status)}`}>
                      {drive.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No drive requests yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
