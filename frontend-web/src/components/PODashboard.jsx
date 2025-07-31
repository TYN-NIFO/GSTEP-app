import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const PODashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDrives: 0,
    upcomingDrives: 0,
    totalStudentsPlaced: 0
  });
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAllDrives();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching PO dashboard stats...');
      
      // Fetch all drives
      const drivesResponse = await axios.get('http://localhost:5000/api/job-drives', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Drives response:', drivesResponse.data);
      
      const drives = drivesResponse.data.jobDrives || [];
      const totalDrives = drives.length;
      
      console.log('Total drives found:', totalDrives);
      
      // Calculate upcoming drives
      const upcomingDrives = drives.filter(drive => {
        const checkDate = drive.deadline || drive.date;
        if (!checkDate) return false;
        
        const deadlineDateTime = new Date(checkDate);
        if (drive.time && drive.deadline) {
          const [hours, minutes] = drive.time.split(':');
          deadlineDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          deadlineDateTime.setHours(23, 59, 59, 999);
        }
        
        return new Date() <= deadlineDateTime;
      }).length;
      
      console.log('Upcoming drives:', upcomingDrives);
      
      // Fetch total students placed
      console.log('Fetching placed students count...');
      const placedResponse = await axios.get('http://localhost:5000/api/users/placed-students-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Placed students response:', placedResponse.data);
      
      const totalStudentsPlaced = placedResponse.data.count || 0;
      
      console.log('Final stats:', {
        totalDrives,
        upcomingDrives,
        totalStudentsPlaced
      });
      
      setStats({
        totalDrives,
        upcomingDrives,
        totalStudentsPlaced
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to fetch dashboard statistics');
      
      // Set default values on error
      setStats({
        totalDrives: 0,
        upcomingDrives: 0,
        totalStudentsPlaced: 0
      });
    }
  };

  const fetchAllDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/job-drives', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Process drives to ensure all fields are properly set
      const processedDrives = (response.data.jobDrives || []).map(drive => ({
        ...drive,
        displayLocation: drive.location || (drive.locations && drive.locations.length > 0 ? drive.locations.join(', ') : 'Not specified'),
        displayType: drive.type === 'full-time' ? 'Full Time' : drive.type === 'internship' ? 'Internship' : 'Full Time'
      }));
      
      setDrives(processedDrives);
    } catch (error) {
      console.error('Error fetching drives:', error);
      toast.error('Failed to fetch drives');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    setUploadLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/upload-cgpa', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      toast.success(`Successfully updated CGPA for ${response.data.updatedCount} students`);
      event.target.value = '';
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload CSV');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (window.confirm('Are you sure you want to delete this drive?')) {
      try {
        const token = localStorage.getItem('token');
        console.log('Deleting drive:', driveId);
        console.log('User role:', user?.role);
        
        await axios.delete(`http://localhost:5000/api/job-drives/${driveId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Drive deleted successfully');
        fetchAllDrives();
        fetchStats(); // Refresh stats as well
      } catch (error) {
        console.error('Delete error:', error);
        if (error.response?.status === 403) {
          toast.error('Access denied - Only authorized users can delete drives');
        } else {
          toast.error('Failed to delete drive');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Placement Officer Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <Link
            to="/create-job-drive"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Drive
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drives</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDrives}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Drives</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingDrives}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students Placed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudentsPlaced}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/pr-create-job" className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors">
            <h3 className="text-lg font-semibold mb-2">Create New Drive</h3>
            <p className="text-blue-100">Add a new job drive for companies</p>
          </Link>
          <Link to="/manage-drives" className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors">
            <h3 className="text-lg font-semibold mb-2">Manage Drives</h3>
            <p className="text-green-100">View and manage all job drives</p>
          </Link>
          <Link to="/job-drives" className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors">
            <h3 className="text-lg font-semibold mb-2">View All Drives</h3>
            <p className="text-purple-100">Browse all available job drives</p>
          </Link>
        </div>

        {/* CGPA Upload Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Upload Student & PR CGPA</h2>
            <p className="text-sm text-gray-600">Upload CSV file with roll numbers and CGPA for students and placement representatives</p>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={uploadLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadLoading && <span className="text-blue-600">Uploading...</span>}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>CSV should contain columns: ROLL NO, CGPA</p>
              <p>This will update CGPA for both students and placement representatives</p>
            </div>
          </div>
        </div>

        {/* Job Drives Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Job Drives</h2>
          </div>
          
          <div className="p-6">
            {drives.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No drives created yet</p>
            ) : (
              <div className="space-y-4">
                {drives.map((drive) => (
                  <div key={drive._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{drive.companyName}</h3>
                        <p className="text-gray-600">{drive.role}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>📍 {drive.displayLocation || drive.location || (drive.locations && drive.locations.length > 0 ? drive.locations.join(', ') : 'Not specified')}</span>
                          <span>💼 {drive.displayType || drive.type || drive.jobType || 'Not specified'}</span>
                          <span>💰 {drive.ctc ? `${drive.ctc} LPA` : 'Not specified'}</span>
                          <span>📅 {new Date(drive.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleDeleteDrive(drive._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PODashboard;





















