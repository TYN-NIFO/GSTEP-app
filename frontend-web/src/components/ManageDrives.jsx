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
                          onClick={() => handleEditDrive(drive._id)}
                          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => fetchJobDriveStudents(drive._id, drive.companyName)}
                          className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg font-medium"
                        >
                          List of Students Applied
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Students Applied - {selectedJobDriveName}
                </h2>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedJobDriveStudents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No students have applied for this job drive yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied At</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedJobDriveStudents.map((student, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.rollNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.cgpa || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.phoneNumber || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.degree}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(student.appliedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default ManageDrives;






