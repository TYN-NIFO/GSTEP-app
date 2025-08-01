import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageDrives = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departmentJobDrives, setDepartmentJobDrives] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedJobDriveStudents, setSelectedJobDriveStudents] = useState([]);
  const [selectedJobDriveName, setSelectedJobDriveName] = useState('');
  
  // Add view modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);

  // Add state for placed students modal
  const [showPlacedStudentsModal, setShowPlacedStudentsModal] = useState(false);
  const [selectedPlacedStudents, setSelectedPlacedStudents] = useState([]);
  const [selectedPlacedDriveName, setSelectedPlacedDriveName] = useState('');

  const departments = [
    'Computer Science and Engineering',
    'Information Technology', 
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Production Engineering',
    'Industrial Biotechnology',
    'Electronic and Instrumentation Engineering',
  ];

  // Add view modal handlers
  const handleViewDrive = (drive) => {
    setSelectedDrive(drive);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedDrive(null);
  };

  // Add function to check if drive has ended
  const isDriveEnded = (drive) => {
    const checkDate = drive.deadline || drive.date;
    if (!checkDate) return false;
    
    const deadlineDateTime = new Date(checkDate);
    
    if (drive.time && drive.deadline) {
      const [hours, minutes] = drive.time.split(':');
      deadlineDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      deadlineDateTime.setHours(23, 59, 59, 999);
    }
    
    const currentDateTime = new Date();
    return currentDateTime > deadlineDateTime;
  };

  // Update function to fetch placed students - use the drive data directly first, then API if needed
  const fetchPlacedStudents = async (jobDriveId, companyName, drive) => {
    try {
      console.log('=== FETCHING PLACED STUDENTS ===');
      console.log('Drive:', companyName);
      console.log('Has selection rounds:', drive.selectionRounds?.length > 0);
      
      // Check if drive has selection rounds and get last round selected students
      if (drive.selectionRounds && drive.selectionRounds.length > 0) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/job-drives/${jobDriveId}/last-round-students`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Last round students fetched:', data.students?.length || 0);
          setSelectedPlacedStudents(data.students || []);
          setSelectedPlacedDriveName(companyName);
          setShowPlacedStudentsModal(true);
          return;
        } else {
          console.error('Failed to fetch last round students:', response.status);
        }
      }

      // Fallback to manual placed students if no rounds
      if (drive.placedStudents && drive.placedStudents.length > 0) {
        console.log('Using manual placed students:', drive.placedStudents.length);
        setSelectedPlacedStudents(drive.placedStudents);
        setSelectedPlacedDriveName(companyName);
        setShowPlacedStudentsModal(true);
        return;
      }

      // Show empty modal
      console.log('No placed students found');
      setSelectedPlacedStudents([]);
      setSelectedPlacedDriveName(companyName);
      setShowPlacedStudentsModal(true);
    } catch (error) {
      console.error('Error fetching placed students:', error);
      toast.error('Failed to fetch placed students');
    }
  };

  // View Modal Component
  const DriveViewModal = ({ drive, onClose }) => {
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
                
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
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

  const fetchDepartmentJobDrives = async (department) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/job-drives/department/${encodeURIComponent(department)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setDepartmentJobDrives(response.data.jobDrives || []);
    } catch (error) {
      console.error('Error fetching department job drives:', error);
      toast.error('Failed to fetch department job drives');
      setDepartmentJobDrives([]);
    }
  };

  const fetchJobDriveStudents = async (jobDriveId, companyName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/job-drives/${jobDriveId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSelectedJobDriveStudents(response.data.students || []);
      setSelectedJobDriveName(companyName);
      setShowStudentModal(true);
    } catch (error) {
      console.error('Error fetching job drive students:', error);
      toast.error('Failed to fetch student applications');
    }
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    fetchDepartmentJobDrives(department);
  };

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

  const handleEditDrive = (driveId) => {
    navigate(`/edit-job-drive/${driveId}?returnTo=/manage-drives`);
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

  // Add CSV download function for applied students
  const downloadAppliedStudentsCSV = () => {
    if (!selectedStudents?.length) {
      toast.error('No data to download');
      return;
    }

    const headers = ['S.No', 'Name', 'Roll Number', 'Department', 'Email', 'CGPA', 'Phone', 'Applied On'];
    const csvContent = [
      headers.join(','),
      ...selectedStudents.map((student, index) => [
        index + 1,
        `"${student.name}"`,
        `"${student.rollNumber}"`,
        `"${student.department}"`,
        `"${student.email}"`,
        `"${student.cgpa || 'N/A'}"`,
        `"${student.phone || 'N/A'}"`,
        `"${student.appliedAt ? new Date(student.appliedAt).toLocaleDateString() : 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedDriveName}_applied_students.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add CSV download function for placed students
  const downloadPlacedStudentsCSV = () => {
    if (!selectedPlacedStudents?.length) {
      toast.error('No data to download');
      return;
    }

    const headers = ['S.No', 'Name', 'Roll Number', 'Department', 'Email', 'Mobile', 'Added On'];
    const csvContent = [
      headers.join(','),
      ...selectedPlacedStudents.map((student, index) => [
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
    link.setAttribute('download', `${selectedPlacedDriveName}_placed_students.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add CSV download function for job drive students
  const downloadJobDriveStudentsCSV = () => {
    if (!selectedJobDriveStudents?.length) {
      toast.error('No data to download');
      return;
    }

    const headers = ['S.No', 'Name', 'Roll Number', 'Department', 'Email', 'CGPA', 'Phone', 'Applied On'];
    const csvContent = [
      headers.join(','),
      ...selectedJobDriveStudents.map((student, index) => [
        index + 1,
        `"${student.name}"`,
        `"${student.rollNumber}"`,
        `"${student.department}"`,
        `"${student.email}"`,
        `"${student.cgpa || 'N/A'}"`,
        `"${student.phone || 'N/A'}"`,
        `"${student.appliedAt ? new Date(student.appliedAt).toLocaleDateString() : 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedJobDriveName}_applied_students.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Job Drives</h1>
            <p className="text-gray-600">Manage all job drives and applications</p>
          </div>
          
        </div>

      
        {/* Department Management Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Manage Drives by Department</h2>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">List of Departments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((department) => (
                <button
                  key={department}
                  onClick={() => handleDepartmentSelect(department)}
                  className={`p-4 text-left border rounded-lg hover:bg-blue-50 transition-colors ${
                    selectedDepartment === department ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{department}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Department Job Drives */}
        {selectedDepartment && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Available Job Drives - {selectedDepartment}
              </h2>
            </div>
            
            {departmentJobDrives.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No job drives available for {selectedDepartment}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {departmentJobDrives.map((drive) => (
                  <div key={drive._id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{drive.companyName}</h3>
                          <span className={`px-2 py-1 rounded text-sm ${
                            drive.type === 'full-time' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {drive.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{drive.role}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Location:</span> {drive.location || 'Not specified'}
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
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleViewDrive(drive)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium"
                        >
                          View
                        </button>
                        {isDriveEnded(drive) ? (
                          <button
                            onClick={() => fetchPlacedStudents(drive._id, drive.companyName, drive)}
                            className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-sm font-medium"
                          >
                            List of Placed Students ({
                              drive.selectionRounds && drive.selectionRounds.length > 0 
                                ? drive.selectionRounds[drive.selectionRounds.length - 1]?.selectedStudents?.length || 0
                                : drive.placedStudents?.length || 0
                            })
                          </button>
                        ) : (
                          <button
                            onClick={() => fetchJobDriveStudents(drive._id, drive.companyName)}
                            className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium"
                          >
                            List of Students ({drive.applications?.length || 0})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Students Applied - {selectedJobDriveName}
                </h2>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {selectedJobDriveStudents && selectedJobDriveStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedJobDriveStudents.map((student, index) => (
                          <tr key={student._id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.rollNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.cgpa || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.phone || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.appliedAt ? new Date(student.appliedAt).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No students have applied for this drive yet.
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => downloadJobDriveStudentsCSV()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Placed Students Modal */}
        {showPlacedStudentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Placed Students - {selectedPlacedDriveName}
                </h2>
                <button
                  onClick={() => setShowPlacedStudentsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedPlacedStudents.length === 0 ? (
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
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Added On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPlacedStudents.map((student, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                            <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                            <td className="px-4 py-3 text-sm">{student.department || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">{student.email}</td>
                            <td className="px-4 py-3 text-sm">
                              {student.addedAt ? new Date(student.addedAt).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={downloadPlacedStudentsCSV}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setShowPlacedStudentsModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && <DriveViewModal drive={selectedDrive} onClose={closeViewModal} />}
      </div>
    </div>
  );
};

export default ManageDrives;
































