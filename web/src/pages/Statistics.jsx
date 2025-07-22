import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, Target, BarChart3, PieChart, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthPage';

const Statistics = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/company/statistics');
      setStatistics(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
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

  if (!statistics) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">No statistics available</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Statistics</h1>
          <p className="text-gray-600">Analytics and insights for {user?.companyName || 'your company'}</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <motion.div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Applications</p>
                <p className="text-xl font-bold text-gray-900">{statistics.overview.totalApplications}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Shortlisted</p>
                <p className="text-xl font-bold text-gray-900">{statistics.overview.shortlistedStudents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Selected</p>
                <p className="text-xl font-bold text-gray-900">{statistics.overview.selectedStudents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Placed</p>
                <p className="text-xl font-bold text-gray-900">{statistics.overview.placedStudents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-gray-900">{statistics.overview.rejectedStudents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Success Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {calculatePercentage(statistics.overview.placedStudents, statistics.overview.totalApplications)}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Drive Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drives</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overview.totalDrives}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted Drives</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overview.acceptedDrives}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Drives</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overview.pendingDrives}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected Drives</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overview.rejectedDrives}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Department-wise Statistics */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Department-wise Statistics</h2>
            </div>
          </div>
          <div className="p-6">
            {Object.keys(statistics.departmentStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(statistics.departmentStats).map(([department, stats]) => (
                  <div key={department} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">{department}</h3>
                      <span className="text-sm text-gray-500">
                        {calculatePercentage(stats.placed, stats.total)}% placement rate
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                        <p className="text-gray-600">Applied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.selected}</p>
                        <p className="text-gray-600">Selected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.placed}</p>
                        <p className="text-gray-600">Placed</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${calculatePercentage(stats.placed, stats.total)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No department data available</p>
            )}
          </div>
        </motion.div>

        {/* Drive-wise Statistics */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Drive-wise Performance</h2>
            </div>
          </div>
          <div className="p-6">
            {Object.keys(statistics.driveStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(statistics.driveStats).map(([driveTitle, stats]) => (
                  <div key={driveTitle} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">{driveTitle}</h3>
                      <span className="text-sm text-gray-500">
                        {calculatePercentage(stats.placed, stats.total)}% success rate
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                        <p className="text-gray-600">Applied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.selected}</p>
                        <p className="text-gray-600">Selected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.placed}</p>
                        <p className="text-gray-600">Placed</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full"
                          style={{ width: `${calculatePercentage(stats.placed, stats.total)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No drive data available</p>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Statistics;
