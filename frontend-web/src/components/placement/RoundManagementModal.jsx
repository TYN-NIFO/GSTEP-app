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
  const [applicantStudents, setApplicantStudents] = useState([]);

  useEffect(() => {
    if (roundIndex !== null) {
      setCurrentRoundIndex(roundIndex);
    }
    setJobData(job);
    if (isOpen && job) {
      fetchApplicantStudents();
    }
  }, [roundIndex, job, isOpen]);

  // Fetch all applicant students with full details
  const fetchApplicantStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/job-drives/${job._id}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicantStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching applicant students:', error);
      toast.error('Failed to fetch applicant students');
    }
  };

  // Refresh job data after updates
  const refreshJobData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/job-drives/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the job data in the modal
      setJobData(response.data);
      
      // Also call the parent's refresh function if available
      if (onClose && typeof onClose === 'function') {
        // Don't close, just refresh parent data
        // onClose will be called when user manually closes
      }
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
      
      // Refresh job data to show updated status
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
        const response = await axios.get(`http://localhost:5000/api/job-drives/${job._id}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        studentsToShow = response.data.students || [];
      } else {
        // Subsequent rounds - show selected students from previous round
        const previousRound = jobData.selectionRounds[roundIdx - 1];
        
        if (previousRound && previousRound.selectedStudents && previousRound.selectedStudents.length > 0) {
          const response = await axios.post(`http://localhost:5000/api/job-drives/${job._id}/get-students-by-ids`, 
            { studentIds: previousRound.selectedStudents },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          studentsToShow = response.data.students || [];
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
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.rollNumber} • {student.department}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Selection'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add finalize placement function
  const finalizePlacement = async () => {
    if (!window.confirm('Are you sure you want to finalize placement? This will automatically set the final round selected students as placed students.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`http://localhost:5000/api/job-drives/${job._id}/finalize-placement`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Placement finalized successfully! Selected students are now marked as placed.');
      onClose(); // Close the modal and refresh parent
      
    } catch (error) {
      console.error('Error finalizing placement:', error);
      toast.error(error.response?.data?.message || 'Failed to finalize placement');
    } finally {
      setLoading(false);
    }
  };

  // Fix the main modal display to show updated data
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {jobData.companyName} - Round Management
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Overview Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Company:</span> {jobData.companyName}
            </div>
            <div>
              <span className="font-medium">Students:</span> {jobData.applications?.length || 0}
            </div>
            <div>
              <span className="font-medium">Date:</span> {jobData.date ? new Date(jobData.date).toLocaleDateString() : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Rounds:</span> {jobData.selectionRounds?.length || 0}
            </div>
          </div>
        </div>

        {/* Selection Progress */}
        {jobData.selectionRounds && jobData.selectionRounds.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Selection Progress</h3>
            <div className="space-y-3">
              {jobData.selectionRounds.map((round, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-lg">
                        {index + 1}. {round.name || `Round ${index + 1}`}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        round.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {round.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  
                  {round.date && (
                    <div className="text-sm text-gray-600 mb-2">
                      📅 {new Date(round.date).toLocaleDateString()} at {round.time || 'N/A'}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Selected Students:</span> {round.selectedStudents?.length || 0}
                      {round.details && <p className="mt-1">{round.details}</p>}
                    </div>
                    <div className="flex space-x-2">
                      {round.status !== 'completed' && (
                        <button
                          onClick={() => updateRoundStatus(index, 'completed')}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Complete Round
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finalize Placement Section */}
        {jobData.selectionRounds && jobData.selectionRounds.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Finalize Placement</h3>
            <p className="text-sm text-green-700 mb-4">
              Once all rounds are completed, click below to automatically set the final round's selected students as placed students.
            </p>
            
            {jobData.placementFinalized ? (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Placement Already Finalized ({jobData.placedStudents?.length || 0} students placed)
              </div>
            ) : (
              <button
                onClick={finalizePlacement}
                disabled={loading || !jobData.selectionRounds[jobData.selectionRounds.length - 1]?.selectedStudents?.length}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Finalizing...' : `Finalize Placement (${jobData.selectionRounds[jobData.selectionRounds.length - 1]?.selectedStudents?.length || 0} students)`}
              </button>
            )}
            
            {!jobData.selectionRounds[jobData.selectionRounds.length - 1]?.selectedStudents?.length && (
              <p className="text-sm text-gray-500 mt-2">
                Please select students in the final round before finalizing placement.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundManagementModal;








