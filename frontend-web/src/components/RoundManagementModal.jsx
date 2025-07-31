import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RoundManagementModal = ({ isOpen, onClose, job, roundIndex }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [showStudentSelection, setShowStudentSelection] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectingForRound, setSelectingForRound] = useState(null);
  const [jobData, setJobData] = useState(job);

  useEffect(() => {
    if (roundIndex !== null) {
      setCurrentRoundIndex(roundIndex);
    }
    setJobData(job);
  }, [roundIndex, job]);

  // Refresh job data after updates
  const refreshJobData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/job-drives/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobData(response.data);
    } catch (error) {
      console.error('Error refreshing job data:', error);
    }
  };

  const updateRoundStatus = async (roundIdx, status) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/job-drives/${job._id}/rounds/${roundIdx}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Round ${status} successfully`);
      
      // Refresh job data instead of closing modal
      await refreshJobData();
    } catch (error) {
      console.error('Error updating round status:', error);
      toast.error('Failed to update round status');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForSelection = async (roundIdx) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let studentsToShow = [];
      
      if (roundIdx === 0) {
        // First round - show all applicants
        console.log('Fetching all applicants for round 0');
        const response = await axios.get(`http://localhost:5000/api/job-drives/${job._id}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        studentsToShow = response.data.students || [];
      } else {
        // Subsequent rounds - show selected students from previous round
        const previousRound = jobData.selectionRounds[roundIdx - 1];
        console.log('Previous round data:', previousRound);
        
        if (previousRound && previousRound.selectedStudents && previousRound.selectedStudents.length > 0) {
          console.log('Fetching students by IDs:', previousRound.selectedStudents);
          const response = await axios.post(`http://localhost:5000/api/job-drives/${job._id}/get-students-by-ids`, 
            { studentIds: previousRound.selectedStudents },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          studentsToShow = response.data.students || [];
          console.log('Students fetched:', studentsToShow);
        } else {
          console.log('No selected students in previous round');
        }
      }
      
      setAvailableStudents(studentsToShow);
      
      // Set already selected students for this round
      const currentRound = jobData.selectionRounds[roundIdx];
      setSelectedStudents(currentRound.selectedStudents || []);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudents = (roundIdx) => {
    setSelectingForRound(roundIdx);
    setShowStudentSelection(true);
    fetchStudentsForSelection(roundIdx);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const saveSelectedStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/job-drives/${job._id}/rounds/${selectingForRound}/select-students`, 
        { studentIds: selectedStudents },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Students selected successfully');
      setShowStudentSelection(false);
      setSelectingForRound(null);
      
      // Refresh job data to show updated selection
      await refreshJobData();
    } catch (error) {
      console.error('Error selecting students:', error);
      toast.error('Failed to select students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = availableStudents.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen || !jobData) return null;

  if (showStudentSelection) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Select Students for {jobData.selectionRounds[selectingForRound]?.name || `Round ${selectingForRound + 1}`}
            </h2>
            <button
              onClick={() => {
                setShowStudentSelection(false);
                setSelectingForRound(null);
                setSearchTerm('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search students by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Selected Count */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              Selected: {selectedStudents.length} students
              {selectingForRound > 0 && (
                <span className="ml-2 text-sm">
                  (from {availableStudents.length} students from previous round)
                </span>
              )}
            </p>
          </div>

          {/* Students List */}
          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Loading students...</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {selectingForRound === 0 ? 'No applicants found' : 'No students selected from previous round'}
              </p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStudents.includes(student._id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleStudentSelection(student._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => toggleStudentSelection(student._id)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-500">
                            {student.rollNumber} • {student.department}
                          </p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>CGPA: {student.cgpa || 'N/A'}</p>
                      <p>{student.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowStudentSelection(false);
                setSelectingForRound(null);
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={saveSelectedStudents}
              disabled={loading || selectedStudents.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              {loading ? 'Saving...' : `Save Selected (${selectedStudents.length})`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{jobData.companyName} - Round Management</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'students'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Students ({jobData.applications?.length || 0})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Selection Progress</h3>
            <div className="space-y-4">
              {jobData.selectionRounds?.map((round, index) => (
                <div key={round._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-lg">
                        {index + 1}. {round.name || `Round ${index + 1}`}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        round.status === 'completed' ? 'bg-green-100 text-green-800' :
                        round.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {round.status || 'pending'}
                      </span>
                      {round.date && (
                        <span className="text-sm text-gray-500">
                          📅 {new Date(round.date).toLocaleDateString()}
                          {round.time && ` at ${round.time}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    Selected Students: {round.selectedStudents?.length || 0}
                  </div>

                  <div className="flex gap-2">
                    {round.status === 'pending' && (
                      <button
                        onClick={() => updateRoundStatus(index, 'in-progress')}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        {loading ? 'Starting...' : 'Start Round'}
                      </button>
                    )}
                    
                    {round.status === 'in-progress' && (
                      <button
                        onClick={() => updateRoundStatus(index, 'completed')}
                        disabled={loading}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        {loading ? 'Completing...' : 'Complete Round'}
                      </button>
                    )}

                    {round.status === 'completed' && (
                      <button
                        onClick={() => handleSelectStudents(index)}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                      >
                        Select Students
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Applicants</h3>
            <p className="text-gray-600 mb-4">{jobData.applications?.length || 0} total applicants</p>
            
            <div className="space-y-2">
              {jobData.applications?.map((application, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <span>{application.student?.profile?.name || 'Unknown Student'}</span>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundManagementModal;

