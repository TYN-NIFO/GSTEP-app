import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../redux/customHooks/useAuth';
import { useJobDrives } from '../../redux/customHooks/useJobDrives';
import toast from 'react-hot-toast';

const CreateJobDrive = () => {
  const { user } = useAuth();
  const { createJobDrive } = useJobDrives();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [formData, setFormData] = useState({
    // Basic Company Details
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
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
    description: '', // Rich text JD
    requirements: '',
    skills: '', // Will be converted to array
    
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
    isDreamJob: false,
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
    if (!user || (user.role !== 'pr' && user.role !== 'placement_representative' && user.role !== 'po' && user.role !== 'placement_officer')) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const departments = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Production Engineering',
    'Industrial Biotechnology',
    'Electronic and Instrumentation Engineering'
  ];

  const batches = ['2024', '2025', '2026', '2027'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('eligibility.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('ctcBreakdown.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        ctcBreakdown: {
          ...prev.ctcBreakdown,
          [field]: value
        }
      }));
    } else if (name.startsWith('bondDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bondDetails: {
          ...prev.bondDetails,
          [field]: value
        }
      }));
    } else if (name.startsWith('recruiterContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        recruiterContact: {
          ...prev.recruiterContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDepartmentChange = (dept) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        allowedDepartments: prev.eligibility.allowedDepartments.includes(dept)
          ? prev.eligibility.allowedDepartments.filter(d => d !== dept)
          : [...prev.eligibility.allowedDepartments, dept]
      }
    }));
  };

  const handleBatchChange = (batch) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        allowedBatches: prev.eligibility.allowedBatches.includes(batch)
          ? prev.eligibility.allowedBatches.filter(b => b !== batch)
          : [...prev.eligibility.allowedBatches, batch]
      }
    }));
  };

  const handleLocationAdd = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLocationAddButton();
    }
  };

  const handleLocationAddButton = () => {
    if (locationInput.trim() && !formData.locations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()]
      }));
      setLocationInput('');
    }
  };

  const handleLocationRemove = (locationToRemove) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(location => location !== locationToRemove)
    }));
  };

  const validateForm = () => {
    // Required fields validation
    if (!formData.companyName.trim()) {
      toast.error('Company Name is required');
      return false;
    }
    
    if (!formData.role.trim()) {
      toast.error('Job Role is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Job Description is required');
      return false;
    }
    
    if (!formData.ctc || formData.ctc <= 0) {
      toast.error('Valid CTC is required');
      return false;
    }
    
    if (!formData.deadline) {
      toast.error('Application Deadline is required');
      return false;
    }
    
    // Eligibility validation
    if (!formData.eligibility.minCGPA || formData.eligibility.minCGPA <= 0) {
      toast.error('Minimum CGPA is required');
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
        companyWebsite: formData.companyWebsite,
        companyDescription: formData.companyDescription,
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
        bondDetails: formData.bondDetails,
        rounds: formData.rounds ? formData.rounds.split(',').map(s => s.trim()).filter(s => s) : [],
        driveMode: formData.driveMode,
        venue: formData.venue,
        testDetails: formData.testDetails,
        interviewProcess: formData.interviewProcess,
        isDreamJob: formData.isDreamJob,
        unplacedOnly: formData.unplacedOnly,
        ctcBreakdown: formData.ctcBreakdown,
        eligibility: {
          cgpa: parseFloat(formData.eligibility.minCGPA) || 0,
          minCGPA: parseFloat(formData.eligibility.minCGPA) || 0,
          maxBacklogs: parseInt(formData.eligibility.maxBacklogs) || 0,
          departments: formData.eligibility.allowedDepartments,
          allowedDepartments: formData.eligibility.allowedDepartments,
          batches: formData.eligibility.allowedBatches,
          allowedBatches: formData.eligibility.allowedBatches,
          noCurrentBacklogs: formData.eligibility.noCurrentBacklogs,
          historyOfArrears: formData.eligibility.historyOfArrears
        },
        isActive: true
      };

      await createJobDrive(payload);
      
      toast.success('Job drive created successfully!');
      navigate('/po-dashboard');
    } catch (error) {
      console.error('Create job error:', error);
      toast.error(error.message || 'Failed to create job drive');
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

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Company Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Company Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company Website</label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Company Description</label>
                  <textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Recruiter Contact */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Recruiter Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Name</label>
                  <input
                    type="text"
                    name="recruiterContact.name"
                    value={formData.recruiterContact.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="recruiterContact.email"
                    value={formData.recruiterContact.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    name="recruiterContact.phone"
                    value={formData.recruiterContact.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Job Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Role *</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                {/* Job Locations - Multi-select */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Job Location(s) *</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyDown={handleLocationAdd}
                      placeholder="Type location and press Enter to add"
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleLocationAddButton}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.locations.map((location, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {location}
                        <button
                          type="button"
                          onClick={() => handleLocationRemove(location)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, Python"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Job Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* CTC Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">CTC Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Total CTC (LPA) *</label>
                  <input
                    type="number"
                    step="0.1"
                    name="ctc"
                    value={formData.ctc}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Base Salary (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="ctcBreakdown.baseSalary"
                    value={formData.ctcBreakdown.baseSalary}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Variable Pay (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="ctcBreakdown.variablePay"
                    value={formData.ctcBreakdown.variablePay}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Joining Bonus (₹)</label>
                  <input
                    type="number"
                    name="ctcBreakdown.joiningBonus"
                    value={formData.ctcBreakdown.joiningBonus}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Other Benefits</label>
                  <textarea
                    name="ctcBreakdown.otherBenefits"
                    value={formData.ctcBreakdown.otherBenefits}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Health insurance, PF, gratuity, etc."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Drive Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Drive Details</h2>
              
              {/* Drive Mode */}
              <div className="mb-4">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Application Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Drive Date (Optional)</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Drive Time (Optional)</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-2">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Auditorium, Online platform, etc."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Eligibility Criteria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum CGPA *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    name="eligibility.minCGPA"
                    value={formData.eligibility.minCGPA}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    name="eligibility.maxBacklogs"
                    value={formData.eligibility.maxBacklogs}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={formData.eligibility.noCurrentBacklogs}
                  />
                </div>
              </div>

              {/* No Current Backlogs Checkbox */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="eligibility.noCurrentBacklogs"
                    checked={formData.eligibility.noCurrentBacklogs}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          eligibility: {
                            ...prev.eligibility,
                            maxBacklogs: '0'
                          }
                        }));
                      }
                    }}
                    className="mr-3"
                  />
                  <span className="text-sm font-medium">No current backlogs required</span>
                </label>
              </div>

              {/* History of Arrears */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">History of Arrears (Optional)</label>
                <input
                  type="number"
                  name="eligibility.historyOfArrears"
                  value={formData.eligibility.historyOfArrears}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  min="0"
                  placeholder="Maximum number of arrears allowed"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of arrears (past academic backlogs, even if cleared) allowed. Leave empty for no restriction.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Eligible Departments *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {departments.map(dept => (
                    <label key={dept} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.eligibility.allowedDepartments.includes(dept)}
                        onChange={() => handleDepartmentChange(dept)}
                        className="mr-2"
                      />
                      <span className="text-sm">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Eligible Batches (leave empty for all)</label>
                <div className="flex gap-4">
                  {batches.map(batch => (
                    <label key={batch} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.eligibility.allowedBatches.includes(batch)}
                        onChange={() => handleBatchChange(batch)}
                        className="mr-2"
                      />
                      <span className="text-sm">{batch}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Flags */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Job Flags</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDreamJob"
                    checked={formData.isDreamJob}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="text-sm font-medium">Dream Job (High CTC/Premium Company)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="unplacedOnly"
                    checked={formData.unplacedOnly}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="text-sm font-medium">Unplaced Students Only</span>
                </label>
              </div>
            </div>

            {/* Test/Interview Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Selection Process</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rounds (comma separated)</label>
                  <input
                    type="text"
                    name="rounds"
                    value={formData.rounds}
                    onChange={handleChange}
                    placeholder="Online Test, Technical Interview, HR Interview"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Test Details</label>
                  <textarea
                    name="testDetails"
                    value={formData.testDetails}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Test duration, topics, pattern, etc."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Interview Process</label>
                  <textarea
                    name="interviewProcess"
                    value={formData.interviewProcess}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Interview format, duration, focus areas, etc."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bond Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Bond Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bond Details</label>
                  <textarea
                    name="bond"
                    value={formData.bond}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Service agreement details"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bond Amount (₹)</label>
                  <input
                    type="number"
                    name="bondDetails.amount"
                    value={formData.bondDetails.amount}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bond Duration (years)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="bondDetails.duration"
                    value={formData.bondDetails.duration}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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


