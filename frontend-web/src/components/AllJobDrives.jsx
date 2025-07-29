import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AllJobDrives = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);

  useEffect(() => {
    // Wait for auth context to load before checking user
    if (user === null) {
      // Still loading auth state, don't redirect yet
      return;
    }
    
    if (!user || user.role !== 'placement_representative') {
      navigate('/login');
      return;
    }
    fetchAllJobDrives();
  }, [user, navigate]);

  const fetchAllJobDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || token === 'null' || token === 'undefined') {
        console.log('No valid token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Fetching all job drives for user role:', user?.role);
      console.log('User department:', user?.profile?.department);

      const response = await axios.get('http://localhost:5000/api/job-drives', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const allDrives = response.data.jobDrives || response.data || [];
      console.log('Total drives fetched:', allDrives.length);
      
      setDrives(allDrives);
      
    } catch (error) {
      console.error('Error fetching job drives:', error);
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      toast.error('Failed to fetch job drives');
      setDrives([]);
    } finally {
      setLoading(false);
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
      setDrives(drives.filter(drive => drive._id !== driveId));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete job drive');
    }
  };

  const handleEditDrive = (driveId) => {
    navigate(`/pr/edit-job/${driveId}?returnTo=/all-job-drives`);
  };

  const handleViewDrive = (drive) => {
    setSelectedDrive(drive);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDrive(null);
  };

  const getFilteredDrives = () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    return drives.filter(drive => {
      // First apply department filter for placement representatives
      if (user?.role === 'placement_representative') {
        const userDepartment = user?.profile?.department;
        if (userDepartment) {
          // If drive has department restrictions, check if user's department is allowed
          if (drive.eligibility?.allowedDepartments && drive.eligibility.allowedDepartments.length > 0) {
            if (!drive.eligibility.allowedDepartments.includes(userDepartment)) {
              return false; // User's department not in allowed list
            }
          }
          // If no department restrictions, drive is available to all departments
        }
      }
      
      // Then apply other filters
      const driveDate = new Date(drive.date);
      driveDate.setHours(0, 0, 0, 0);
      
      if (filter === 'upcoming') {
        return driveDate >= currentDate;
      } else if (filter === 'past') {
        return driveDate < currentDate;
      } else if (filter === 'active') {
        return drive.isActive;
      } else if (filter === 'inactive') {
        return !drive.isActive;
      }
      return true;
    });
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
                    <span className="ml-2 text-gray-600">{drive.displayType || drive.type || drive.jobType || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{drive.displayLocation || drive.location || (drive.locations && drive.locations.length > 0 ? drive.locations.join(', ') : 'Not specified')}</span>
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
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {drive.description || 'No description provided'}
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-4 text-gray-900">Requirements</h3>
                <div className="mb-6">
                  <p className="text-gray-600 text-sm">
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
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    drive.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {drive.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredDrives = getFilteredDrives();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with department info for PRs */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Job Drives</h1>
            {user?.role === 'placement_representative' && user?.profile?.department && (
              <p className="text-gray-600 mt-1">
                Showing drives for {user.profile.department} department
              </p>
            )}
          </div>
          <div className="flex flex-wrap">
          <button
              onClick={() => navigate('/pr-create-job')}
              className="bg-blue-600 text-white px-4 py-2 mr-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Job Drive
          </button><button
            onClick={() => navigate('/pr-dashboard')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Dashboard
          </button></div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'upcoming', 'past', 'active', 'inactive'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {filterType} ({drives.filter(drive => {
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const driveDate = new Date(drive.date);
                driveDate.setHours(0, 0, 0, 0);
                
                if (filterType === 'upcoming') return driveDate >= currentDate;
                if (filterType === 'past') return driveDate < currentDate;
                if (filterType === 'active') return drive.isActive;
                if (filterType === 'inactive') return !drive.isActive;
                return true;
              }).length})
            </button>
          ))}
        </div>

        {/* Drives List */}
        {filteredDrives.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No job drives found for "{filter}" filter</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDrives.map((drive) => {
              const isDriveUpcoming = new Date(drive.date) >= new Date();
              
              return (
                <div key={drive._id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{drive.companyName}</h3>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          drive.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {drive.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          isDriveUpcoming ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isDriveUpcoming ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{drive.role}</p>
                      
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
                      
                      <div className="text-sm text-gray-500">
                        <p>Applications: {drive.applications?.length || 0}</p>
                        <p>Created by: {drive.createdBy?.profile?.name || drive.createdBy?.email || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewDrive(drive)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium"
                      >
                        View
                      </button>
                      
                      <button
                        onClick={() => handleEditDrive(drive._id)}
                        className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDrive(drive._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium"
                      >
                        Delete
                      </button>
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

export default AllJobDrives;













