import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    applications: 0,
    views: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/alumni/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { stats, recentOpportunities } = response.data;
      
      setStats({
        totalJobs: stats.totalOpportunities || 0,
        activeJobs: stats.activeOpportunities || 0,
        applications: stats.totalApplications || 0,
        views: stats.profileViews || 0
      });
      
      setRecentJobs(recentOpportunities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, trend, color, icon }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${loading ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${color} rounded-lg`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900">{loading ? '-' : value}</h3>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome back, {user?.name || 'Alumni'}
              </h1>
              <p className="text-slate-600 mt-2">Here's what's happening with your job postings</p>
            </div>
            <Link
              to="/post"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs Posted"
            value={stats.totalJobs}
            trend={stats.totalJobs > 0 ? `${stats.totalJobs} total` : "No jobs yet"}
            color="bg-blue-100"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            title="Active Postings"
            value={stats.activeJobs}
            trend={stats.activeJobs > 0 ? `${Math.round((stats.activeJobs / stats.totalJobs) * 100)}% active` : "No active jobs"}
            color="bg-emerald-100"
            icon={
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Applications"
            value={stats.applications}
            trend={stats.applications > 0 ? `${stats.applications} applications` : "No applications yet"}
            color="bg-purple-100"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Profile Views"
            value={stats.views}
            trend={stats.views > 0 ? `${stats.views} views` : "No views yet"}
            color="bg-amber-100"
            icon={
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Job Postings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Job Postings</h3>
                <Link to="/opportunities" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-slate-200">
                {loading ? (
                  Array(3).fill().map((_, i) => (
                    <div key={i} className="p-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-slate-200 h-12 w-12"></div>
                        <div className="flex-1 space-y-4 py-1">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : recentJobs.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-slate-500 mb-2">No job postings yet</p>
                    <Link to="/post" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Post your first job
                    </Link>
                  </div>
                ) : (
                  recentJobs.map((job) => (
                    <div key={job._id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 mb-1">{job.title}</h4>
                          <p className="text-slate-600 mb-2">{job.company} • {job.location}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-slate-500">
                              <span className="font-medium">{job.applicants?.length || 0}</span> applications
                            </span>
                            <span className="text-slate-500">
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            {job.deadline && (
                              <span className="text-slate-500">
                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              job.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {job.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/opportunities/edit/${job._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/post"
                  className="w-full flex items-center p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Post New Job</p>
                    <p className="text-sm text-slate-600">Create a new job listing</p>
                  </div>
                </Link>

                <Link
                  to="/opportunities"
                  className="w-full flex items-center p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-slate-100 group-hover:bg-slate-200 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Manage Jobs</p>
                    <p className="text-sm text-slate-600">View all postings</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Pro Tip</h4>
                  <p className="text-sm text-slate-600">
                    Jobs with detailed descriptions and clear requirements get 3x more quality applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



