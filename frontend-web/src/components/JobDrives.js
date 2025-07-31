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
  const [showPlacedStudentsViewModal, setShowPlacedStudentsViewModal] = useState(false);
  const [selectedDriveForView, setSelectedDriveForView] = useState(null);
  const [showRoundStudentsModal, setShowRoundStudentsModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(null);
  const [selectedJobForRoundView, setSelectedJobForRoundView] = useState(null);
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

      // Use the same endpoint that shows all drives for the department
      const endpoint = 'http://localhost:5000/api/job-drives/all';

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Raw API response:', response.data);
      
      let fetchedDrives = response.data.jobDrives || response.data.drives || [];
      
      console.log('Fetched drives before filtering:', fetchedDrives.length);
      
      // For students, filter by department but show all drives (like dashboard)
      if (user?.role === 'student' && user?.profile?.department) {
        const userDepartment = user.profile.department;
        
        fetchedDrives = fetchedDrives.filter(drive => {
          // If no department restrictions, show to all departments
          if (!drive.eligibility?.allowedDepartments || drive.eligibility.allowedDepartments.length === 0) {
            return true;
          }
          // Check if user's department is in allowed departments
          return drive.eligibility.allowedDepartments.includes(userDepartment);
        });
      } else if ((user?.role === 'placement_representative' || user?.role === 'pr') && user?.profile?.department) {
        // For PRs, filter by department
        const userDepartment = user.profile.department;
        
        fetchedDrives = fetchedDrives.filter(drive => {
          if (!drive.eligibility?.allowedDepartments || drive.eligibility.allowedDepartments.length === 0) {
            return true;
          }
          return drive.eligibility.allowedDepartments.includes(userDepartment);
        });
      }
      
      console.log('Fetched drives after department filtering:', fetchedDrives.length);
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
    console.log('=== FILTERING DRIVES ===');
    console.log('Total drives:', drives.length);
    console.log('Current filter:', filter);
    console.log('User role:', user?.role);
    
    let filtered = drives.filter(drive => {
      const driveEnded = isDriveEnded(drive);
      console.log(`Drive ${drive.companyName}: ended=${driveEnded}, date=${drive.date}, time=${drive.time}`);
      
      if (filter === 'upcoming') {
        return !driveEnded; // Not ended yet
      } else if (filter === 'past') {
        return driveEnded; // Drive has ended
      }
      return true; // 'all' filter
    });

    console.log('After date filter:', filtered.length);
    console.log('Final filtered count:', filtered.length);
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
    if (!user?.profile) {
      return false;
    }

    const userCGPA = parseFloat(user.profile.cgpa) || 0;
    const userBacklogs = parseInt(user.profile.currentBacklogs || user.profile.backlogs) || 0;
    const userDepartment = user.profile.department;
    const userBatch = user.profile.batch;
    const isUserPlaced = user.profile.isPlaced || user.profile.placementStatus === 'placed';

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

    // Check batch eligibility
    if (drive.eligibility?.allowedBatches && 
        drive.eligibility.allowedBatches.length > 0 && 
        !drive.eligibility.allowedBatches.includes(userBatch)) {
      return false;
    }

    // Check placement status eligibility
    const driveCTC = parseFloat(drive.ctc) || 0;

    // If user is placed, only show drives with CTC > 10 LPA
    if (isUserPlaced && driveCTC <= 10) {
      return false;
    }

    // If drive is for unplaced only, check placement status
    if (drive.unplacedOnly && isUserPlaced) {
      return false;
    }

    return true;
  };

  // Check if drive has ended (improved logic)
  const isDriveEnded = (drive) => {
    if (!drive.date) return false;
    
    const driveDate = new Date(drive.date);
    const currentDate = new Date();
    
    // If drive has time, use it for comparison
    if (drive.time) {
      const [hours, minutes] = drive.time.split(':').map(Number);
      driveDate.setHours(hours, minutes, 0, 0);
      return currentDate > driveDate;
    } else {
      // If no time specified, consider drive ended at end of day
      driveDate.setHours(23, 59, 59, 999);
      return currentDate > driveDate;
    }
  };

  const handleViewPlacedStudents = (drive) => {
    setSelectedDriveForView(drive);
    setShowPlacedStudentsViewModal(true);
  };

  const filteredDrives = getFilteredDrives();

  const handleViewDrive = (drive) => {
    console.log('Selected drive for view:', drive); // Debug log
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

  const handleViewRoundStudents = (drive, round, roundIndex) => {
    setSelectedJobForRoundView(drive);
    setSelectedRound(round);
    setSelectedRoundIndex(roundIndex);
    setShowRoundStudentsModal(true);
  };

  const closeRoundStudentsModal = () => {
    setShowRoundStudentsModal(false);
    setSelectedRound(null);
    setSelectedRoundIndex(null);
    setSelectedJobForRoundView(null);
  };

  // Update the canManageDrive function to be more explicit
  const canManageDrive = (drive) => {
    // Students and POs cannot manage any drives
    if (user?.role === 'student' || user?.role === 'po' || user?.role === 'placement_officer') {
      return false;
    }
    
    if (user?.role === 'placement_representative' || user?.role === 'pr') {
      // Check if user created the drive
      if (drive.createdBy?._id === user.id) {
        return true;
      }
      
      // Check if same department - STRICT comparison
      const userDept = user.profile?.department;
      const creatorDept = drive.createdBy?.profile?.department;
      
      console.log('=== FRONTEND ACCESS CHECK ===');
      console.log('User Dept:', userDept);
      console.log('Creator Dept:', creatorDept);
      console.log('Same Dept:', userDept === creatorDept);
      
      // Only allow if departments match exactly
      return userDept && creatorDept && userDept === creatorDept;
    }
    
    return false;
  };

  // Add view-only check
  const isViewOnly = (drive) => {
    if (user?.role === 'student' || user?.role === 'po' || user?.role === 'placement_officer') {
      return true;
    }
    
    return !canManageDrive(drive);
  };

  // Add function to check if student is eligible (for display purposes only)
  const isStudentEligible = (drive) => {
    if (user?.role !== 'student' || !user?.profile) {
      return true; // Non-students or missing profile - show as eligible
    }

    const userProfile = user.profile;
    const userCGPA = parseFloat(userProfile.cgpa) || 0;
    const userBacklogs = parseInt(userProfile.currentBacklogs || userProfile.backlogs) || 0;
    const userBatch = userProfile.batch;
    const isUserPlaced = userProfile.isPlaced || userProfile.placementStatus === 'placed';

    // Check CGPA requirement
    if (drive.eligibility?.minCGPA && drive.eligibility.minCGPA > userCGPA) {
      return false;
    }

    // Check backlog requirement
    if (drive.eligibility?.maxBacklogs !== undefined && 
        drive.eligibility.maxBacklogs < userBacklogs) {
      return false;
    }

    // Check batch eligibility
    if (drive.eligibility?.allowedBatches && 
        drive.eligibility.allowedBatches.length > 0 && 
        !drive.eligibility.allowedBatches.includes(userBatch)) {
      return false;
    }

    // Check placement status eligibility
    const driveCTC = parseFloat(drive.ctc) || 0;
    if (isUserPlaced && driveCTC <= 10) {
      return false;
    }

    // Check unplaced only requirement
    if (drive.unplacedOnly && isUserPlaced) {
      return false;
    }

    return true;
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
                <h2 className="text-2xl font-bold text-gray-900">{drive.companyName || 'Company Name Not Available'}</h2>
                <p className="text-xl text-gray-600">{drive.role || 'Role Not Specified'}</p>
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

  // Add this new component for viewing selected students in a round
  const RoundStudentsModal = ({ isOpen, onClose, round, roundIndex, jobDrive }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (isOpen && round && round.selectedStudents && round.selectedStudents.length > 0) {
        fetchSelectedStudents();
      }
    }, [isOpen, round]);

    const fetchSelectedStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:5000/api/job-drives/${jobDrive._id}/get-students-by-ids`, 
          { studentIds: round.selectedStudents },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudents(response.data.students || []);
      } catch (error) {
        console.error('Error fetching selected students:', error);
        toast.error('Failed to fetch selected students');
      } finally {
        setLoading(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Selected Students - {round.name || `Round ${roundIndex + 1}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Company:</strong> {jobDrive.companyName} | 
              <strong> Round:</strong> {round.name || `Round ${roundIndex + 1}`} | 
              <strong> Selected:</strong> {round.selectedStudents?.length || 0} students
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading selected students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No student details found for this round.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student._id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {student.profile?.name || student.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.profile?.rollNumber || student.rollNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.profile?.department || student.department || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.email || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.profile?.cgpa || student.cgpa || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add PlacedStudentsViewModal component
  const PlacedStudentsViewModal = ({ drive, onClose }) => {
    if (!drive) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Placed Students - {drive.companyName}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {!drive.placedStudents || drive.placedStudents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No students have been placed for this job drive yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Mobile</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Added On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {drive.placedStudents.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                      <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                      <td className="px-4 py-3 text-sm">{student.department}</td>
                      <td className="px-4 py-3 text-sm">{student.email}</td>
                      <td className="px-4 py-3 text-sm">{student.mobileNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        {student.addedAt ? new Date(student.addedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Drives</h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'student' ? 'Browse and apply to job opportunities' : 'Manage job drives and applications'}
          </p>
        </div>

        {/* Filter Buttons - same as placement representative */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'upcoming', 'past'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {filterType} ({drives.filter(drive => {
                const driveEnded = isDriveEnded(drive);
                
                if (filterType === 'upcoming') return !driveEnded;
                if (filterType === 'past') return driveEnded;
                return true;
              }).length})
            </button>
          ))}
        </div>

        {/* Drives List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading job drives...</div>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No job drives found for "{filter}" filter</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDrives.map((drive) => {
              const driveEnded = isDriveEnded(drive);
              const hasSelectionRounds = drive.selectionRounds && Array.isArray(drive.selectionRounds) && drive.selectionRounds.length > 0;
              const canManage = canManageDrive(drive);
              const viewOnly = isViewOnly(drive);
              const isEligible = isStudentEligible(drive);
              
              return (
                <div key={drive._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{drive.companyName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driveEnded ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {driveEnded ? 'Ended' : 'Active'}
                        </span>
                        {/* Show eligibility status for students */}
                        {user?.role === 'student' && !isEligible && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Not Eligible
                          </span>
                        )}
                      </div>
                      
                      <p className="text-lg text-gray-700 mb-2">{drive.role}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          📅 {new Date(drive.date).toLocaleDateString()}
                        </span>
                        {drive.time && (
                          <span className="flex items-center gap-1">
                            🕒 {drive.time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          📍 {drive.location || drive.venue || 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          💰 {drive.salary || drive.ctc || 'Not disclosed'}
                        </span>
                        <span className="flex items-center gap-1">
                          👥 {drive.applications?.length || 0} applications
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleViewDrive(drive)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        View Details
                      </button>
                      
                      {/* Student-specific buttons */}
                      {user?.role === 'student' && !driveEnded && (
                        <div>
                          {hasApplied(drive) ? (
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center block">
                              Applied ✓
                            </span>
                          ) : isEligible ? (
                            <button
                              onClick={() => handleApply(drive._id)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm w-full"
                            >
                              Apply Now
                            </button>
                          ) : (
                            <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium text-center block">
                              Not Eligible
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* PR-specific buttons */}
                      {(user?.role === 'placement_representative' || user?.role === 'pr') && canManage && (
                        <button
                          onClick={() => handleEditDrive(drive._id)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                        >
                          Edit Drive
                        </button>
                      )}
                      
                      {/* View placed students button for PRs and POs */}
                      {(user?.role === 'placement_representative' || user?.role === 'pr' || user?.role === 'po' || user?.role === 'placement_officer') && 
                       drive.placedStudents && drive.placedStudents.length > 0 && (
                        <button
                          onClick={() => handleViewPlacedStudents(drive)}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                        >
                          View Placed ({drive.placedStudents.length})
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection rounds info */}
                  {hasSelectionRounds && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Selection Rounds:</h4>
                      <div className="flex flex-wrap gap-2">
                        {drive.selectionRounds.map((round, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {round.name || `Round ${index + 1}`}
                              {round.selectedStudents && round.selectedStudents.length > 0 && 
                                ` (${round.selectedStudents.length} selected)`
                              }
                            </span>
                            
                            {/* View selected students button for each round */}
                            {round.selectedStudents && round.selectedStudents.length > 0 && 
                             (user?.role === 'placement_representative' || user?.role === 'pr' || user?.role === 'po' || user?.role === 'placement_officer') && (
                              <button
                                onClick={() => handleViewRoundStudents(drive, round, index)}
                                className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium"
                              >
                                View Selected
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && selectedDrive && (
        <DriveModal drive={selectedDrive} onClose={closeModal} />
      )}
      
      {showPlacedStudentsViewModal && selectedDriveForView && (
        <PlacedStudentsViewModal 
          drive={selectedDriveForView} 
          onClose={() => {
            setShowPlacedStudentsViewModal(false);
            setSelectedDriveForView(null);
          }} 
        />
      )}
      
      {showRoundStudentsModal && selectedRound && selectedJobForRoundView && (
        <RoundStudentsModal
          round={selectedRound}
          roundIndex={selectedRoundIndex}
          jobDrive={selectedJobForRoundView}
          onClose={closeRoundStudentsModal}
        />
      )}
    </div>
  );
};

export default JobDrives;


