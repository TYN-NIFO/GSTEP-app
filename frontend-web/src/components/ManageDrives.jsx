import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageDrives = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/job-drives', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setDrives(response.data.jobDrives || []);
    } catch (error) {
      console.error('Error fetching drives:', error);
      toast.error('Failed to fetch drives');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (window.confirm('Are you sure you want to delete this drive?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/job-drives/${driveId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Drive deleted successfully');
        fetchDrives();
      } catch (error) {
        toast.error('Failed to delete drive');
      }
    }
  };

  const filteredDrives = drives.filter(drive => {
    const driveDate = new Date(drive.date);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return driveDate >= today;
    } else if (filter === 'past') {
      return driveDate < today;
    }
    return true;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Manage Job Drives</h1>
            <p className="text-gray-600">Manage all job drives and applications</p>
          </div>
          <Link
            to="/create-job-drive"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Drive
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              All Drives
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'past' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Drives List */}
        {filteredDrives.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No job drives found</p>
            <Link
              to="/create-job-drive"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Create Your First Drive
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDrives.map((drive) => (
              <div key={drive._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{drive.companyName}</h3>
                    <p className="text-gray-600">{drive.role}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      drive.type === 'full-time' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {drive.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      drive.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {drive.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{drive.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CTC</p>
                    <p className="font-medium">
                      {drive.ctc ? `₹${drive.ctc} LPA` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{new Date(drive.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Applications</p>
                    <p className="font-medium">{drive.applications?.length || 0}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{drive.description}</p>
                
                {/* Applications List */}
                {drive.applications && drive.applications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Applications ({drive.applications.length})</h4>
                    <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                      {drive.applications.map((app, index) => (
                        <div key={index} className="text-sm text-gray-600 mb-1">
                          {app.student?.profile?.name || app.student?.email || 'Unknown Student'} - 
                          Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Created by: {drive.createdBy?.profile?.name || drive.createdBy?.email || 'Unknown'}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteDrive(drive._id)}
                      className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-medium"
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
  );
};

export default ManageDrives;