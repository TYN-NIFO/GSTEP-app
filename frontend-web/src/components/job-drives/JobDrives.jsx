import React, { useState, useEffect } from 'react';
import { useAuth } from '../../redux/customHooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { numberInputProps } from '../utils/inputHelpers';

const JobDrives = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
  }, []);


  const fetchDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }

      console.log('=== JOB DRIVES FETCH ===');
      console.log('User role:', user?.role);

      // Use role-specific endpoints
      let endpoint;
      if (user?.role === 'student') {
        endpoint = 'http://localhost:5000/api/job-drives/student-drives';
      } else if (user?.role === 'placement_representative' || user?.role === 'pr') {
        endpoint = 'http://localhost:5000/api/job-drives/pr-drives';
      } else {
        // For PO/admin, use all drives
        endpoint = 'http://localhost:5000/api/job-drives/all';
      }

      console.log('Using endpoint:', endpoint);

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Fetch drives response:', response.data);
      
      // Handle different response formats
      let fetchedDrives;
      if (user?.role === 'student' || user?.role === 'placement_representative' || user?.role === 'pr') {
        // These endpoints return arrays directly or wrapped in drives property
        fetchedDrives = response.data.drives || response.data || [];
      } else {
        // Admin/PO endpoints return wrapped objects
        fetchedDrives = response.data.jobDrives || response.data.drives || [];
      }
      
      console.log('Fetched drives count:', fetchedDrives.length);
      setDrives(fetchedDrives);
      
    } catch (error) {
      console.error('Fetch drives error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch job drives');
      }
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Drives</h1>
          <p className="mt-2 text-gray-600">Manage all job drives</p>
        </div>

        {drives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No job drives found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {drives.map((drive) => (
              <div key={drive._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {drive.companyName} - {drive.role}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {drive.type || drive.jobType || 'Not specified'} • {drive.location || 'Not specified'} • ₹{drive.ctc || 'Not specified'} LPA
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Drive Date: {new Date(drive.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    drive.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {drive.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {drive.description && (
                  <p className="text-gray-700 mt-4">{drive.description}</p>
                )}
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Applications: {drive.applications?.length || 0}</p>
                  <p>Min CGPA: {drive.eligibility?.minCGPA || 0}</p>
                  <p>Max Backlogs: {drive.eligibility?.maxBacklogs || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDrives;















