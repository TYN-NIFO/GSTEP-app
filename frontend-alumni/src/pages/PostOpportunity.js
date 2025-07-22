import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BriefcaseIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const PostOpportunity = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'full-time',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    department: [],
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'MBA',
    'All Departments'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDepartmentChange = (dept) => {
    if (dept === 'All Departments') {
      setFormData({
        ...formData,
        department: ['All Departments']
      });
    } else {
      const updatedDepartments = formData.department.includes(dept)
        ? formData.department.filter(d => d !== dept && d !== 'All Departments')
        : [...formData.department.filter(d => d !== 'All Departments'), dept];
      
      setFormData({
        ...formData,
        department: updatedDepartments
      });
    }
  };

  const removeDepartment = (dept) => {
    setFormData({
      ...formData,
      department: formData.department.filter(d => d !== dept)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to post opportunities');
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!formData.title || !formData.company || !formData.location || !formData.description) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const opportunityData = {
        title: formData.title,
        company: formData.company,
        type: formData.type,
        location: formData.location,
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        skills: formData.requirements.split('\n').filter(req => req.trim()), // Backend expects both requirements and skills
        salary: formData.salary,
        department: formData.department.length > 0 ? formData.department : ['All Departments'],
        deadline: formData.deadline
      };

      console.log('Posting opportunity:', opportunityData);

      const response = await axios.post('http://localhost:5000/api/alumni/opportunity', opportunityData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);
      
      if (response.data.success) {
        toast.success('Job opportunity posted successfully!');
        // Navigate to the specific job details page
        navigate(`/job/${response.data.opportunity._id}`);
      } else {
        toast.error('Failed to post opportunity');
      }
    } catch (error) {
      console.error('Error posting opportunity:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to post opportunity. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Job/Internship Opportunity</h1>
        <p className="text-gray-600">Share exciting career opportunities with students</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., Software Engineer, Marketing Intern"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Company name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="full-time">Full-time Job</option>
                  <option value="internship">Internship</option>
                  <option value="part-time">Part-time Job</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Bangalore, Remote, Hybrid"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Salary/Stipend
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., 8-12 LPA, 25k/month"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={today}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Department Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Target Departments
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {departments.map((dept) => (
                <label key={dept} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.department.includes(dept)}
                    onChange={() => handleDepartmentChange(dept)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">{dept}</span>
                </label>
              ))}
            </div>

            {/* Selected Departments */}
            {formData.department.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Departments:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.department.map((dept) => (
                    <span
                      key={dept}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {dept}
                      <button
                        type="button"
                        onClick={() => removeDepartment(dept)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Job Details
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Describe the role, responsibilities, company culture, and what makes this opportunity exciting..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Requirements & Skills (one per line)
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Bachelor's degree in Computer Science&#10;2+ years experience in React&#10;Strong problem-solving skills&#10;Excellent communication skills"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/opportunities')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Posting...</span>
                </div>
              ) : (
                'Post Opportunity'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostOpportunity;





