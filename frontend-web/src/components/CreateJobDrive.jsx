import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { numberInputProps } from '../utils/inputHelpers';

const CreateJobDrive = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [formData, setFormData] = useState({
    // Basic Company Details
    companyName: '',
    recruiterContact: {
      name: '',
      email: '',
      phone: ''
    },
    driveMode: 'on-campus',
    locations: [],
    
    // Job Role Details
    role: '',
    type: 'full-time',
    description: '',
    requirements: '',
    skills: '',
    
    // Package Details
    ctc: '',
    ctcBreakdown: {
      baseSalary: '',
      variablePay: '',
      joiningBonus: '',
      otherBenefits: ''
    },
    
    // Bond Details
    bond: '',
    bondDetails: {
      amount: '',
      duration: ''
    },
    bondDuration: '',
    
    // Enhanced Eligibility
    eligibility: {
      minCGPA: '',
      allowedDepartments: [],
      maxBacklogs: '',
      noCurrentBacklogs: false,
      historyOfArrears: '',
      allowedBatches: []
    },
    
    // Special Conditions
    unplacedOnly: false,
    
    // Drive Schedule
    date: '',
    time: '',
    deadline: '',
    venue: '',
    
    // Test Details
    rounds: '',
    testDetails: '',
    interviewProcess: ''
  });

  useEffect(() => {
    if (!user || (user.role !== 'po' && user.role !== 'placement_officer')) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name === 'eligibility.allowedDepartments') {
      const departments = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          allowedDepartments: departments
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addLocation = () => {
    if (locationInput.trim() && !formData.locations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()]
      }));
      setLocationInput('');
    }
  };

  const removeLocation = (locationToRemove) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc !== locationToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return false;
    }
    
    if (!formData.role.trim()) {
      toast.error('Job role is required');
      return false;
    }
    
    if (!formData.ctc || parseFloat(formData.ctc) <= 0) {
      toast.error('Valid CTC is required');
      return false;
    }
    
    if (!formData.date) {
      toast.error('Drive date is required');
      return false;
    }
    
    if (!formData.deadline) {
      toast.error('Application deadline is required');
      return false;
    }
    
    if (formData.eligibility.allowedDepartments.length === 0) {
      toast.error('At least one department must be selected');
      return false;
    }
    
    if (formData.locations.length === 0) {
      toast.error('At least one job location is required');
      return false;
    }
    
    // Date validation
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    
    if (deadlineDate <= today) {
      toast.error('Deadline must be in the future');
      return false;
    }
    
    if (formData.date) {
      const driveDate = new Date(formData.date);
      if (deadlineDate >= driveDate) {
        toast.error('Deadline must be before the drive date');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName,
        role: formData.role,
        type: formData.type,
        jobType: formData.type,
        ctc: parseFloat(formData.ctc),
        location: formData.locations[0] || '',
        locations: formData.locations,
        date: formData.date,
        time: formData.time,
        deadline: formData.deadline,
        description: formData.description,
        requirements: formData.requirements,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        bond: formData.bond,
        bondDuration: formData.bondDuration,
        rounds: formData.rounds ? formData.rounds.split(',').map(s => s.trim()).filter(s => s) : [],
        driveMode: formData.driveMode,
        venue: formData.venue,
        testDetails: formData.testDetails,
        interviewProcess: formData.interviewProcess,
        unplacedOnly: formData.unplacedOnly,
        eligibility: {
          cgpa: parseFloat(formData.eligibility.minCGPA) || 0,
          minCGPA: parseFloat(formData.eligibility.minCGPA) || 0,
          maxBacklogs: parseInt(formData.eligibility.maxBacklogs) || 0,
          departments: formData.eligibility.allowedDepartments,
          allowedDepartments: formData.eligibility.allowedDepartments,
          batches: formData.eligibility.allowedBatches,
          allowedBatches: formData.eligibility.allowedBatches
        },
        isActive: true
      };

      console.log('Sending payload:', payload);

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/job-drives', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Job drive created successfully!');
      navigate('/po-dashboard');
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create job drive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create Job Drive</h1>
            <p className="text-gray-600">Post a new job opportunity for students</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Company Details Section */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">Company Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Drive Mode</label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="driveMode"
                        value="on-campus"
                        checked={formData.driveMode === 'on-campus'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">On-campus</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="driveMode"
                        value="remote"
                        checked={formData.driveMode === 'remote'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Remote</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="driveMode"
                        value="pooled-campus"
                        checked={formData.driveMode === 'pooled-campus'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Pooled Campus</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Job Locations */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Job Locations *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter location"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                  />
                  <button
                    type="button"
                    onClick={addLocation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.locations.map((location, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {location}
                      <button
                        type="button"
                        onClick={() => removeLocation(location)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Role Details */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">Job Role Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTC (LPA) *
                  </label>
                  <input
                    type="number"
                    name="ctc"
                    value={formData.ctc}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    {...numberInputProps}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12.5"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="React, Node.js, Python..."
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed job description..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Specific requirements and qualifications..."
                />
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">Eligibility Criteria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum CGPA *
                  </label>
                  <input
                    type="number"
                    name="eligibility.minCGPA"
                    value={formData.eligibility.minCGPA}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    required
                    step="0.1"
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Backlogs
                  </label>
                  <input
                    type="number"
                    name="eligibility.maxBacklogs"
                    value={formData.eligibility.maxBacklogs}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Departments *
                </label>
                <select
                  name="eligibility.allowedDepartments"
                  multiple
                  value={formData.eligibility.allowedDepartments}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size="4"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                  <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple departments</p>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="unplacedOnly"
                    checked={formData.unplacedOnly}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Only for unplaced students</span>
                </label>
              </div>
            </div>

            {/* Drive Schedule */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">Drive Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drive Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Venue details"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bond Details
                </label>
                <textarea
                  name="bond"
                  value={formData.bond}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Service agreement details (if any)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selection Rounds (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="rounds"
                    value={formData.rounds}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Aptitude, Technical, HR..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bond Duration (years)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="bondDuration"
                    value={formData.bondDuration}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/po-dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Job Drive'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJobDrive;






















