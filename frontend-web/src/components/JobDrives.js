import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobDrives = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    console.log('JobDrives component mounted');
    console.log('Current user:', user);
    console.log('User profile:', user?.profile);
    
    // Test backend connection first
    const testBackend = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/job-drives/test-all');
        console.log('Backend test successful:', response.data);
      } catch (error) {
        console.error('Backend test failed:', error);
        toast.error('Backend server is not running on port 5000');
      }
    };
    
    testBackend();
    if (user) {
      fetchJobDrives();
    }
  }, [user]);

  // Add this useEffect to debug the data
  useEffect(() => {
    if (drives.length > 0 && user) {
      console.log('=== DEBUG DATA ===');
      console.log('User object:', user);
      console.log('User ID:', user.id);
      console.log('User _id:', user._id);
      console.log('First drive applications:', drives[0]?.applications);
      drives.forEach((drive, index) => {
        console.log(`Drive ${index} (${drive.companyName}) applications:`, drive.applications);
      });
      console.log('=== END DEBUG ===');
    }
  }, [drives, user]);

  // Add this useEffect to debug the applications data
  useEffect(() => {
    if (drives.length > 0 && user) {
      console.log('=== CHECKING APPLICATIONS ===');
      drives.forEach(drive => {
        console.log(`Drive: ${drive.companyName}`);
        console.log('Applications:', drive.applications);
        console.log('User ID:', user?.id || user?._id);
        console.log('Has Applied:', hasApplied(drive));
        console.log('---');
      });
    }
  }, [drives, user]);

  const fetchJobDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }

      console.log('=== JOB DRIVES FETCH ===');
      console.log('User role:', user?.role);
      console.log('User:', user);
      console.log('User ID:', user?.id);
      console.log('Token exists:', !!token);

      // Use role-based endpoints
      let endpoint;
      if (user?.role === 'student') {
        endpoint = 'http://localhost:5000/api/job-drives/student-drives';
      } else {
        endpoint = 'http://localhost:5000/api/job-drives';
      }
      
      console.log('Fetching from endpoint:', endpoint);
      
      const response = await axios.get(endpoint, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('JobDrives array:', response.data.jobDrives);
      console.log('JobDrives length:', response.data.jobDrives?.length);
      
      const drives = response.data.jobDrives || [];
      setDrives(drives);
      
      console.log('Drives set in state:', drives.length);
      
      // Show message if no drives due to incomplete profile
      if (response.data.message && user?.role === 'student') {
        console.log('Backend message:', response.data.message);
        toast(response.data.message); // Use toast() instead of toast.info()
      }
      
      // If no drives, let's try the alternative endpoint
      if (drives.length === 0 && user?.role === 'student') {
        console.log('No drives found, trying alternative endpoint...');
        try {
          const altResponse = await axios.get('http://localhost:5000/api/job-drives/all', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Alternative endpoint response:', altResponse.data);
          const altDrives = altResponse.data.jobDrives || [];
          if (altDrives.length > 0) {
            setDrives(altDrives);
            console.log('Set drives from alternative endpoint:', altDrives.length);
          }
        } catch (altError) {
          console.error('Alternative endpoint failed:', altError);
        }
      }
      
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied');
      } else if (!error.response) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('Failed to fetch job drives');
      }
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:5000/api/job-drives/${driveId}/apply`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Application submitted successfully!');
      
      // Update local state immediately
      setDrives(prevDrives => {
        return prevDrives.map(drive => {
          if (drive._id === driveId) {
            const userId = user?.id || user?._id;
            const newApplication = { 
              student: userId,
              appliedAt: new Date(),
              status: 'applied'
            };
            
            return {
              ...drive,
              applications: [...(drive.applications || []), newApplication]
            };
          }
          return drive;
        });
      });
      
    } catch (error) {
      console.error('Apply error:', error);
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Already applied to this drive');
      } else {
        toast.error('Failed to apply. Please try again.');
      }
    }
  };

  // Add this test function after handleApply
  const testHasApplied = (drive) => {
    console.log('=== TEST HAS APPLIED ===');
    console.log('Drive:', drive.companyName);
    console.log('Drive applications:', drive.applications);
    console.log('User ID:', user?.id);
    console.log('User _id:', user?._id);
    
    if (!drive.applications) {
      console.log('No applications array');
      return false;
    }
    
    const result = drive.applications.some(app => {
      console.log('Checking application:', app);
      console.log('App student:', app.student);
      console.log('User ID match:', app.student === user?.id);
      console.log('User _id match:', app.student === user?._id);
      return app.student === user?.id || app.student === user?._id;
    });
    
    console.log('Final result:', result);
    return result;
  };

  // Add this function to filter drives based on date
  const getFilteredDrives = () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of today
    
    return drives.filter(drive => {
      const driveDate = new Date(drive.date);
      driveDate.setHours(0, 0, 0, 0); // Set to start of drive date
      
      if (filter === 'upcoming') {
        return driveDate >= currentDate;
      } else if (filter === 'past') {
        return driveDate < currentDate;
      }
      return true; // 'all' filter
    });
  };

  const hasApplied = (drive) => {
    if (!drive.applications || (!user?.id && !user?._id)) {
      return false;
    }
    
    const userId = user?.id || user?._id;
    
    const applied = drive.applications.some(app => {
      let studentId;
      
      // Handle different application formats
      if (typeof app === 'object' && app !== null) {
        if (app.student) {
          // If student is populated object
          if (typeof app.student === 'object') {
            studentId = app.student._id || app.student.id;
          } else {
            // If student is just an ID string
            studentId = app.student;
          }
        } else {
          // Direct student ID in app
          studentId = app._id || app.id || app;
        }
      } else {
        // App is directly the student ID
        studentId = app;
      }
      
      // Convert to string for comparison
      const studentIdStr = studentId?.toString();
      const userIdStr = userId?.toString();
      
      return studentIdStr === userIdStr;
    });
    
    return applied;
  };

  // Add this test function
  const testAllEndpoints = async () => {
    const token = localStorage.getItem('token');
    console.log('=== TESTING ALL ENDPOINTS ===');
    
    const endpoints = [
      'http://localhost:5000/api/job-drives/test-all',
      'http://localhost:5000/api/job-drives/debug/all',
      'http://localhost:5000/api/job-drives',
      'http://localhost:5000/api/job-drives/all',
      'http://localhost:5000/api/job-drives/student-drives'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint}`);
        const response = await axios.get(endpoint, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        console.log(`✅ ${endpoint}:`, response.data);
      } catch (error) {
        console.log(`❌ ${endpoint}:`, error.response?.data || error.message);
      }
    }
  };

  const filteredDrives = getFilteredDrives();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading job drives...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Job Drives</h1>
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
              All
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

        {filteredDrives.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No job drives found for "{filter}" filter</p>
            {user?.role === 'student' && (
              <p className="text-sm text-gray-400 mt-2">
                Make sure your profile is complete to see eligible drives
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDrives.map((drive) => {
              const userHasApplied = hasApplied(drive);
              const isDriveUpcoming = new Date(drive.date) >= new Date();
              
              return (
                <div key={drive._id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{drive.companyName}</h3>
                      <p className="text-gray-600">{drive.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        drive.jobType === 'full-time' ? 'bg-green-100 text-green-800' :
                        drive.jobType === 'internship' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {drive.jobType}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        isDriveUpcoming ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isDriveUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">Location:</span> {drive.location}
                    </div>
                    <div>
                      <span className="font-medium">CTC:</span> 
                      {drive.ctc ? `₹${drive.ctc} LPA` : 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(drive.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Applications:</span> {drive.applications?.length || 0}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{drive.description}</p>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Created by: {drive.createdBy?.profile?.name || drive.createdBy?.email || 'Unknown'}
                      </p>
                      
                      {user.role === 'student' && (
                        <div className="ml-4">
                          {userHasApplied ? (
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center">
                              ✓ Applied
                            </span>
                          ) : isDriveUpcoming ? (
                            <button
                              onClick={() => handleApply(drive._id)}
                              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium"
                            >
                              Apply Now
                            </button>
                          ) : (
                            <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                              Drive Ended
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDrives;






























