import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobDrives = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const navigate = useNavigate();
  
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

      // Use role-based endpoints
      let endpoint;
      if (user?.role === 'student') {
        endpoint = 'http://localhost:5000/api/job-drives/student-drives';
      } else if (user?.role === 'placement_representative') {
        endpoint = 'http://localhost:5000/api/job-drives'; // PRs can see all drives
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
      
      // Handle different response formats
      const drives = response.data.drives || response.data.jobDrives || [];
      console.log('Drives found:', drives.length);
      
      setDrives(drives);
      
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

  const handleApply = async (driveId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Applying to drive:', driveId);
      console.log('User:', user);
      
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
            
            console.log('Adding application:', newApplication);
            
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
      } else if (error.response?.status === 403) {
        toast.error('You are not eligible for this drive');
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

  // Add this function to filter drives based on date and eligibility
  const getFilteredDrives = () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of today
    
    let filtered = drives.filter(drive => {
      const driveDate = new Date(drive.date);
      driveDate.setHours(0, 0, 0, 0); // Set to start of drive date
      
      if (filter === 'upcoming') {
        return driveDate >= currentDate;
      } else if (filter === 'past') {
        return driveDate < currentDate;
      }
      return true; // 'all' filter
    });

    // For students and placement representatives, only show eligible drives
    if (user?.role === 'student' || user?.role === 'placement_representative') {
      filtered = filtered.filter(drive => isEligibleForDrive(drive));
    }

    return filtered;
  };

  const hasApplied = (drive) => {
    if (!drive.applications || !user) return false;
    
    const userId = user.id || user._id;
    return drive.applications.some(app => {
      const appStudentId = app.student?._id || app.student?.id || app.student;
      return appStudentId === userId;
    });
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

  // Check if user is eligible for a specific drive
  const isEligibleForDrive = (drive) => {
    if (user?.role !== 'student' && user?.role !== 'placement_representative') {
      return false;
    }

    if (!user?.profile) {
      return false;
    }

    const userCGPA = parseFloat(user.profile.cgpa) || 0;
    const userBacklogs = parseInt(user.profile.currentBacklogs) || 0;
    const userDepartment = user.profile.department;

    // Check CGPA requirement
    if (drive.eligibility?.minCGPA && drive.eligibility.minCGPA > userCGPA) {
      return false;
    }

    // Check department requirement
    if (drive.eligibility?.allowedDepartments && 
        drive.eligibility.allowedDepartments.length > 0 && 
        !drive.eligibility.allowedDepartments.includes(userDepartment)) {
      return false;
    }

    // Check backlog requirement
    if (drive.eligibility?.maxBacklogs !== undefined && 
        drive.eligibility.maxBacklogs < userBacklogs) {
      return false;
    }

    return true;
  };

  const filteredDrives = getFilteredDrives();

  const handleViewDrive = (drive) => {
    setSelectedDrive(drive);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDrive(null);
  };

  const handleEditDrive = (driveId) => {
    if (user?.role === 'placement_representative') {
      navigate(`/pr/edit-job/${driveId}?returnTo=/job-drives`);
    } else if (user?.role === 'po' || user?.role === 'placement_officer') {
      navigate(`/edit-job-drive/${driveId}?returnTo=/job-drives`);
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this job drive?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/job-drives/${driveId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Job drive deleted successfully');
      fetchJobDrives(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete job drive');
    }
  };

  // Modal component
  const DriveModal = ({ drive, onClose }) => {
    if (!drive) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">View Job</h2>
                <p className="text-xl text-gray-600">{drive.role}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Job Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Job Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">
                      {(() => {
                        const type = drive.type || drive.jobType;
                        if (type === 'full-time') return 'Full Time';
                        if (type === 'internship') return 'Internship';
                        return 'Full Time'; // Default fallback
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{drive.location || (drive.locations && drive.locations.length > 0 ? drive.locations.join(', ') : 'Not specified')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">CTC:</span>
                    <span className="ml-2 text-gray-600">{drive.ctc ? `₹${drive.ctc} LPA` : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="ml-2 text-gray-600">{drive.date ? new Date(drive.date).toLocaleDateString() : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Deadline:</span>
                    <span className="ml-2 text-gray-600">{drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'Not specified'}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-900">Eligibility Criteria</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Min CGPA:</span>
                    <span className="ml-2 text-gray-600">{drive.eligibility?.minCGPA || drive.eligibility?.cgpa || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Max Backlogs:</span>
                    <span className="ml-2 text-gray-600">{drive.eligibility?.maxBacklogs !== undefined ? drive.eligibility.maxBacklogs : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Departments:</span>
                    <span className="ml-2 text-gray-600">{drive.eligibility?.allowedDepartments?.length > 0 ? drive.eligibility.allowedDepartments.join(', ') : 'All'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Batches:</span>
                    <span className="ml-2 text-gray-600">{drive.eligibility?.allowedBatches?.length > 0 ? drive.eligibility.allowedBatches.join(', ') : 'All'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Description and other details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {drive.description || 'No description provided'}
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-4 text-gray-900">Requirements</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {drive.requirements || 'No specific requirements mentioned'}
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-4 text-gray-900">Required Skills</h3>
                <div className="mb-6">
                  {drive.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(drive.skills) ? drive.skills : drive.skills.split(',')).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">No specific skills mentioned</p>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-4 text-gray-900">Selection Rounds</h3>
                <div className="mb-6">
                  {drive.rounds ? (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {(Array.isArray(drive.rounds) ? drive.rounds : drive.rounds.split(',')).map((round, index) => (
                        <li key={index}>{round.trim()}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-600 text-sm">Selection process not specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Applications: {drive.applications?.length || 0}</p>
                  <p>Created by: {drive.createdBy?.profile?.name || drive.createdBy?.email || 'Unknown'}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {(user.role === 'student' || user.role === 'placement_representative') && (
                    <div>
                      {hasApplied(drive) ? (
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                          Applied
                        </span>
                      ) : new Date(drive.date) >= new Date() && isEligibleForDrive(drive) ? (
                        <button
                          onClick={() => {
                            handleApply(drive._id);
                            onClose();
                          }}
                          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium"
                        >
                          Apply Now
                        </button>
                      ) : !isEligibleForDrive(drive) ? (
                        <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                          Not Eligible
                        </span>
                      ) : (
                        <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                          Drive Ended
                        </span>
                      )}
                    </div>
                  )}
                  
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            {user?.role === 'student' || user?.role === 'placement_representative' ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Eligible Drives Found</h3>
                <p className="text-gray-600 mb-4">
                  There are currently no job drives that match your profile criteria.
                </p>
                <div className="text-sm text-gray-500">
                  <p>This could be due to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>CGPA requirements not met</li>
                    <li>Department restrictions</li>
                    <li>Backlog limitations</li>
                    <li>No active drives available</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Update Profile
                </button>
              </div>
            ) : (
              <p className="text-gray-500">No job drives found for "{filter}" filter</p>
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
                      <span className="font-medium">Location:</span> {drive.displayLocation || drive.location || (drive.locations && drive.locations.length > 0 ? drive.locations.join(', ') : 'Not specified')}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {drive.displayType || drive.type || drive.jobType || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">CTC:</span> 
                      {drive.ctc ? `₹${drive.ctc} LPA` : 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {drive.date ? new Date(drive.date).toLocaleDateString() : 'Not specified'}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{drive.description}</p>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Created by: {drive.createdBy?.profile?.name || drive.createdBy?.email || 'Unknown'}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDrive(drive)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium"
                        >
                          View
                        </button>
                        
                        {user.role === 'student' || user.role === 'placement_representative' ? (
                          <div>
                            {userHasApplied ? (
                              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center">
                                ✓ Applied
                              </span>
                            ) : isDriveUpcoming && isEligibleForDrive(drive) ? (
                              <button
                                onClick={() => handleApply(drive._id)}
                                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium"
                              >
                                Apply Now
                              </button>
                            ) : !isEligibleForDrive(drive) ? (
                              <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                                Not Eligible
                              </span>
                            ) : (
                              <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                Drive Ended
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Modal */}
      {showModal && <DriveModal drive={selectedDrive} onClose={closeModal} />}
    </div>
  );
};

export default JobDrives;







































































