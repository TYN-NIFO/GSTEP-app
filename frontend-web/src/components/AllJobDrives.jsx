import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import PRJobCard from './PRJobCard';
import RoundManagementModal from './RoundManagementModal';

const AllJobDrives = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showPlacedModal, setShowPlacedModal] = useState(false);
  const [selectedDriveForPlacement, setSelectedDriveForPlacement] = useState(null);
  const [placedStudents, setPlacedStudents] = useState([]);
  const [newPlacedStudent, setNewPlacedStudent] = useState({
    name: '',
    rollNumber: '',
    department: '',
    email: '',
    mobileNumber: ''
  });
  const [showPlacedStudentsViewModal, setShowPlacedStudentsViewModal] = useState(false);
  const [selectedDriveForView, setSelectedDriveForView] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentData, setEditStudentData] = useState({
    name: '',
    rollNumber: '',
    department: '',
    email: '',
    mobileNumber: ''
  });
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [selectedJobForRounds, setSelectedJobForRounds] = useState(null);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(null);
  const [showRoundStudentsModal, setShowRoundStudentsModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedJobForRoundView, setSelectedJobForRoundView] = useState(null);

  // Function to check if applications are still open (check deadline, not drive date)
  const isDriveEnded = (drive) => {
    // If there's a deadline, use that; otherwise use drive date
    const checkDate = drive.deadline || drive.date;
    if (!checkDate) return false;
    
    const deadlineDateTime = new Date(checkDate);
    
    // If drive has a specific time, use it; otherwise assume end of day
    if (drive.time && drive.deadline) {
      const [hours, minutes] = drive.time.split(':');
      deadlineDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // If no time specified, consider applications open until end of deadline day
      deadlineDateTime.setHours(23, 59, 59, 999);
    }
    
    const currentDateTime = new Date();
    
    // Debug logs
    console.log('Drive:', drive.companyName);
    console.log('Deadline date:', drive.deadline);
    console.log('Drive date:', drive.date);
    console.log('Drive time:', drive.time);
    console.log('Parsed deadline datetime:', deadlineDateTime);
    console.log('Current datetime:', currentDateTime);
    console.log('Applications ended:', currentDateTime > deadlineDateTime);
    
    return currentDateTime > deadlineDateTime;
  };

  const handleViewPlacedStudents = (drive) => {
    setSelectedDriveForView(drive);
    setShowPlacedStudentsViewModal(true);
  };

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
      const response = await axios.get('http://localhost:5000/api/job-drives', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched drives:', response.data.jobDrives); // Debug log
      
      // Debug each drive's selection rounds
      response.data.jobDrives.forEach(drive => {
        console.log(`Drive ${drive.companyName}:`, {
          selectionRounds: drive.selectionRounds,
          rounds: drive.rounds,
          hasSelectionRounds: drive.selectionRounds && drive.selectionRounds.length > 0
        });
      });
      
      setDrives(response.data.jobDrives || []);
    } catch (error) {
      console.error('Error fetching job drives:', error);
      toast.error('Failed to fetch job drives');
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
    return drives.filter(drive => {
      // Remove department filter for placement representatives - show all drives
      // Only apply other filters using the new logic
      const driveEnded = isDriveEnded(drive);
      const driveDate = new Date(drive.date);
      driveDate.setHours(0, 0, 0, 0);
      
      if (filter === 'upcoming') {
        return !driveEnded; // Not ended yet
      } else if (filter === 'past') {
        return driveEnded; // Drive has ended
      }
      return true;
    });
  };

  const handleAddPlacedStudents = (drive) => {
    setSelectedDriveForPlacement(drive);
    setShowPlacedModal(true);
  };

  const handleAddStudent = () => {
    if (newPlacedStudent.name && newPlacedStudent.rollNumber && newPlacedStudent.email) {
      setPlacedStudents([...placedStudents, { ...newPlacedStudent, id: Date.now() }]);
      setNewPlacedStudent({
        name: '',
        rollNumber: '',
        department: '',
        email: '',
        mobileNumber: ''
      });
    }
  };

  const handleRemoveStudent = (id) => {
    setPlacedStudents(placedStudents.filter(student => student.id !== id));
  };

  const handleSubmitPlacedStudents = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/job-drives/${selectedDriveForPlacement._id}/placed-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ placedStudents })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Placed students added successfully!');
        setShowPlacedModal(false);
        setPlacedStudents([]);
        setSelectedDriveForPlacement(null);
        fetchAllJobDrives(); // Fixed function name
      } else {
        console.error('Server error:', data);
        toast.error(data.message || 'Failed to add placed students');
      }
    } catch (error) {
      console.error('Error adding placed students:', error);
      toast.error('Error adding placed students');
    }
  };

  const handleEditStudent = (student, index) => {
    setEditingStudent(index);
    setEditStudentData({
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department || '',
      email: student.email,
      mobileNumber: student.mobileNumber || ''
    });
  };

  const handleSaveEdit = async (index) => {
    try {
      const response = await fetch(`http://localhost:5000/api/job-drives/${selectedDriveForView._id}/update-placed-student`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          index: index,
          studentData: editStudentData
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Student updated successfully!');
        setEditingStudent(null);
        
        // Update the local state immediately
        setSelectedDriveForView(prev => ({
          ...prev,
          placedStudents: result.placedStudents
        }));
        
        // Also refresh the main drives list
        await fetchAllJobDrives();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Error updating student');
    }
  };

  const handleDeleteStudent = async (index) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/job-drives/${selectedDriveForView._id}/delete-placed-student`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ index: index })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Student deleted successfully!');
        
        // Update the local state immediately
        setSelectedDriveForView(prev => ({
          ...prev,
          placedStudents: result.placedStudents
        }));
        
        // Also refresh the main drives list
        await fetchAllJobDrives();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Error deleting student');
    }
  };

  const downloadCSV = () => {
    if (!selectedDriveForView?.placedStudents?.length) {
      toast.error('No data to download');
      return;
    }

    const headers = ['S.No', 'Name', 'Roll Number', 'Department', 'Email', 'Mobile', 'Added On'];
    const csvContent = [
      headers.join(','),
      ...selectedDriveForView.placedStudents.map((student, index) => [
        index + 1,
        `"${student.name}"`,
        `"${student.rollNumber}"`,
        `"${student.department || 'N/A'}"`,
        `"${student.email}"`,
        `"${student.mobileNumber || 'N/A'}"`,
        `"${student.addedAt ? new Date(student.addedAt).toLocaleDateString() : 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedDriveForView.companyName}_placed_students.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManageRounds = (drive, roundIndex = null) => {
    setSelectedJobForRounds(drive);
    setSelectedRoundIndex(roundIndex);
    setShowRoundModal(true);
  };

  const closeRoundModal = () => {
    setShowRoundModal(false);
    setSelectedJobForRounds(null);
    setSelectedRoundIndex(null);
    fetchAllJobDrives(); // Refresh the drives data
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

  // Modal component - Enhanced with all job details
 const DriveModal = ({ drive, onClose }) => {
    if (!drive) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{drive.companyName}</h2>
                <p className="text-xl text-gray-600">{drive.role}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Job Details</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {drive.type === 'full-time' ? 'Full Time' : drive.type === 'internship' ? 'Internship' : drive.jobType === 'full-time' ? 'Full Time' : drive.jobType === 'internship' ? 'Internship' : 'Full Time'}</p>
                    <p><span className="font-medium">Location:</span> {drive.location || drive.locations?.join(', ') || 'Not specified'}</p>
                    <p><span className="font-medium">CTC:</span> {drive.ctc ? `₹${drive.ctc} LPA` : 'Not specified'}</p>
                    <p><span className="font-medium">Date:</span> {drive.date ? new Date(drive.date).toLocaleDateString() : 'Not specified'}</p>
                    <p><span className="font-medium">Deadline:</span> {drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Eligibility Criteria</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="font-medium">Min CGPA:</span> {drive.eligibility?.minCGPA || 0}</p>
                    <p><span className="font-medium">Max Backlogs:</span> {drive.eligibility?.maxBacklogs || 0}</p>
                    <p><span className="font-medium">Departments:</span> {drive.eligibility?.allowedDepartments?.join(', ') || 'All'}</p>
                    <p><span className="font-medium">Batches:</span> {drive.eligibility?.allowedBatches?.join(', ') || 'All'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="mt-2 text-sm text-gray-700">{drive.description || 'No description provided'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Requirements</h3>
                  <p className="mt-2 text-sm text-gray-700">{drive.requirements && drive.requirements.trim() !== '' ? drive.requirements : 'No specific requirements mentioned'}</p>
                </div>

                {drive.skills && drive.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Required Skills</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {drive.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {drive.bond && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Bond Details</h3>
                    <p className="mt-2 text-sm text-gray-700">{drive.bond}</p>
                  </div>
                )}

                {drive.rounds && drive.rounds.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Selection Rounds</h3>
                    <div className="mt-2 space-y-1">
                      {drive.rounds.map((round, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          {index + 1}. {round}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Applications: {drive.applications?.length || 0}</p>
                  <p>Created by: {drive.createdBy?.profile?.name || drive.createdBy?.email || 'Unknown'}</p>
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
            {user?.role === 'placement_representative' && (
              <p className="text-gray-600 mt-1">
                Showing all job drives across all departments
              </p>
            )}
            {(user?.role === 'po' || user?.role === 'placement_officer') && (
              <p className="text-gray-600 mt-1">
                Showing all job drives (Placement Officer View)
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
          {['all', 'upcoming', 'past'].map((filterType) => (
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
                // Remove department filtering from count as well
                const driveEnded = isDriveEnded(drive);
                
                if (filterType === 'upcoming') return !driveEnded;
                if (filterType === 'past') return driveEnded;
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
              const driveEnded = isDriveEnded(drive);
              const hasSelectionRounds = drive.selectionRounds && Array.isArray(drive.selectionRounds) && drive.selectionRounds.length > 0;
              
              return (
                <div key={drive._id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{drive.companyName}</h3>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          !driveEnded ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {!driveEnded ? 'Upcoming' : 'Ended'}
                        </span>
                        {hasSelectionRounds && (
                          <span className="px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                            {drive.selectionRounds.length} Rounds
                          </span>
                        )}
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
                          {drive.time && <span className="ml-1">at {drive.time}</span>}
                        </div>
                      </div>

                      {/* Selection Rounds Section - Show for PRs */}
                      {user?.role === 'placement_representative' && hasSelectionRounds && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-3">Selection Rounds</h4>
                          <div className="space-y-2">
                            {drive.selectionRounds.map((round, index) => (
                              <div key={round._id} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex-1">
                                  <span className="font-medium">{index + 1}. {round.name || 'Unnamed Round'}</span>
                                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    round.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    round.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {round.status || 'pending'}
                                  </span>
                                  {round.date && (
                                    <span className="ml-2 text-sm text-gray-500">
                                      {new Date(round.date).toLocaleDateString()}
                                      {round.time && ` at ${round.time}`}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Selected: {round.selectedStudents?.length || 0}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleManageRounds(drive)}
                            className="mt-3 px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg font-medium text-sm"
                          >
                            Manage All Rounds
                          </button>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        <p>Applications: {drive.applications?.length || 0}</p>
                        <p>Placed Students: {drive.placedStudents?.length || 0}</p>
                        <p>Created by: {drive.createdBy?.profile?.name || drive.createdBy?.email || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <button
                        onClick={() => handleViewDrive(drive)}
                        className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium"
                      >
                        View Details
                      </button>
                      
                      {/* Show Add Placed Students button for PRs when drive has ended */}
                      {user?.role === 'placement_representative' && driveEnded && (
                        <>
                          <button
                            onClick={() => handleAddPlacedStudents(drive)}
                            className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg font-medium"
                          >
                            Add Placed Students
                          </button>
                          {/* Show View button if there are placed students */}
                          {drive.placedStudents && drive.placedStudents.length > 0 && (
                            <button
                              onClick={() => handleViewPlacedStudents(drive)}
                              className="px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg font-medium"
                            >
                              View Placed ({drive.placedStudents.length})
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Show View Placed Students button for POs in past drives */}
                      {(user?.role === 'po' || user?.role === 'placement_officer') && driveEnded && (
                        <button
                          onClick={() => handleViewPlacedStudents(drive)}
                          className="px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg font-medium"
                        >
                          View Placed ({drive.placedStudents?.length || 0})
                        </button>
                      )}
                      
                      {(user?.role === 'po' || user?.role === 'placement_officer') && (
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => navigate(`/edit-job-drive/${drive._id}`)}
                            className="px-4 py-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDrive(drive._id)}
                            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-medium"
                          >
                            Delete
                          </button>
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
      
      {/* Modal */}
      {showModal && <DriveModal drive={selectedDrive} onClose={closeModal} />}
      {/* Placed Students Modal */}
      {showPlacedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Placed Students - {selectedDriveForPlacement?.companyName}</h2>
              <button
                onClick={() => {
                  setShowPlacedModal(false);
                  setPlacedStudents([]);
                  setSelectedDriveForPlacement(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Add Student Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-3">Add New Placed Student</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newPlacedStudent.name}
                  onChange={(e) => setNewPlacedStudent({...newPlacedStudent, name: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={newPlacedStudent.rollNumber}
                  onChange={(e) => setNewPlacedStudent({...newPlacedStudent, rollNumber: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={newPlacedStudent.department}
                  onChange={(e) => setNewPlacedStudent({...newPlacedStudent, department: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="email"
                  placeholder="Email ID"
                  value={newPlacedStudent.email}
                  onChange={(e) => setNewPlacedStudent({...newPlacedStudent, email: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={newPlacedStudent.mobileNumber}
                  onChange={(e) => setNewPlacedStudent({...newPlacedStudent, mobileNumber: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <button
                  onClick={handleAddStudent}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Add Student
                </button>
              </div>
            </div>

            {/* Placed Students List */}
            {placedStudents.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Placed Students ({placedStudents.length})</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Roll No</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Mobile</th>
                        <th className="px-4 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placedStudents.map((student) => (
                        <tr key={student.id} className="border-t">
                          <td className="px-4 py-2">{student.name}</td>
                          <td className="px-4 py-2">{student.rollNumber}</td>
                          <td className="px-4 py-2">{student.department}</td>
                          <td className="px-4 py-2">{student.email}</td>
                          <td className="px-4 py-2">{student.mobileNumber}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleRemoveStudent(student.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPlacedModal(false);
                  setPlacedStudents([]);
                  setSelectedDriveForPlacement(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPlacedStudents}
                disabled={placedStudents.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
              >
                Submit Placed Students ({placedStudents.length})
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Placed Students View Modal for POs */}
      {showPlacedStudentsViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Placed Students - {selectedDriveForView?.companyName}</h2>
            </div>

            {selectedDriveForView?.placedStudents?.length > 0 ? (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg">Drive Summary</h3>
                  <p><span className="font-medium">Company:</span> {selectedDriveForView.companyName}</p>
                  <p><span className="font-medium">Role:</span> {selectedDriveForView.role}</p>
                  <p><span className="font-medium">Total Applications:</span> {selectedDriveForView.applications?.length || 0}</p>
                  <p><span className="font-medium">Total Placed:</span> {selectedDriveForView.placedStudents.length}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">S.No</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Roll Number</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Mobile</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Added On</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedDriveForView.placedStudents.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{index + 1}</td>
                          <td className="px-4 py-3 text-sm">
                            {editingStudent === index ? (
                              <input
                                type="text"
                                value={editStudentData.name}
                                onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                            ) : (
                              <span className="font-medium">{student.name}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingStudent === index ? (
                              <input
                                type="text"
                                value={editStudentData.rollNumber}
                                onChange={(e) => setEditStudentData({...editStudentData, rollNumber: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                            ) : (
                              student.rollNumber
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingStudent === index ? (
                              <input
                                type="text"
                                value={editStudentData.department}
                                onChange={(e) => setEditStudentData({...editStudentData, department: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                            ) : (
                              student.department || 'N/A'
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingStudent === index ? (
                              <input
                                type="email"
                                value={editStudentData.email}
                                onChange={(e) => setEditStudentData({...editStudentData, email: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                            ) : (
                              student.email
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingStudent === index ? (
                              <input
                                type="text"
                                value={editStudentData.mobileNumber}
                                onChange={(e) => setEditStudentData({...editStudentData, mobileNumber: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                            ) : (
                              student.mobileNumber || 'N/A'
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {student.addedAt ? new Date(student.addedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editingStudent === index ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveEdit(index)}
                                  className="text-green-600 hover:text-green-800 text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingStudent(null)}
                                  className="text-gray-600 hover:text-gray-800 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditStudent(student, index)}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(index)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No placed students found for this drive.</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download CSV</span>
              </button>
              <button
                onClick={() => {
                  setShowPlacedStudentsViewModal(false);
                  setSelectedDriveForView(null);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Round Management Modal */}
      <RoundManagementModal
        isOpen={showRoundModal}
        onClose={closeRoundModal}
        job={selectedJobForRounds}
        roundIndex={selectedRoundIndex}
      />
      {/* Round Students Modal */}
      <RoundStudentsModal
        isOpen={showRoundStudentsModal}
        onClose={closeRoundStudentsModal}
        round={selectedRound}
        roundIndex={selectedRoundIndex}
        jobDrive={selectedJobForRoundView}
      />
    </div>
  );
};

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
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {round.name || `Round ${roundIndex + 1}`} - Selected Students
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg">Round Details</h3>
          <p><span className="font-medium">Company:</span> {jobDrive.companyName}</p>
          <p><span className="font-medium">Role:</span> {jobDrive.role}</p>
          <p><span className="font-medium">Round:</span> {round.name || `Round ${roundIndex + 1}`}</p>
          <p><span className="font-medium">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              round.status === 'completed' ? 'bg-green-100 text-green-800' :
              round.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {round.status || 'pending'}
            </span>
          </p>
          <p><span className="font-medium">Selected Students:</span> {round.selectedStudents?.length || 0}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading selected students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No students selected for this round yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">S.No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Roll Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">CGPA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                    <td className="px-4 py-3 text-sm">{student.department}</td>
                    <td className="px-4 py-3 text-sm">{student.email}</td>
                    <td className="px-4 py-3 text-sm">{student.cgpa}</td>
                    <td className="px-4 py-3 text-sm">{student.phoneNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-6">
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

export default AllJobDrives;









