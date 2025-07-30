import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data states matching CompleteProfile
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    rollNumber: '',
    degree: '',
    department: '',
    graduationYear: '',
    cgpa: '',
    address: '',
    phoneNumber: '',
    linkedinUrl: '',
    githubUrl: '',
    currentBacklogs: 0,
    aboutMe: '',
    skills: [],
  });

  const [files, setFiles] = useState({
    photo: null,
    resume: null,
    collegeIdCard: null,
    marksheets: [],
  });

  // Add state for backlog entry
  const [backlogEntry, setBacklogEntry] = useState({
    subject: '',
    semester: '',
    cleared: false
  });

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

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 6 }, (_, i) => currentYear + i);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch fresh user data
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const userData = response.data.user;
        
        if (userData?.profile) {
          setBasicInfo({
            name: userData.profile.name || '',
            rollNumber: userData.profile.rollNumber || '',
            degree: userData.profile.degree || '',
            department: userData.profile.department || '',
            graduationYear: userData.profile.graduationYear || '',
            cgpa: userData.profile.cgpa || '',
            address: userData.profile.address || '',
            phoneNumber: userData.profile.phoneNumber || '',
            linkedinUrl: userData.profile.linkedinUrl || '',
            githubUrl: userData.profile.githubUrl || '',
            currentBacklogs: userData.profile.currentBacklogs || 0,
            historyOfBacklogs: userData.profile.historyOfBacklogs || [],
            aboutMe: userData.profile.aboutMe || '',
            skills: Array.isArray(userData.profile.skills) 
              ? userData.profile.skills.join(', ') 
              : (userData.profile.skills || ''),
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load profile data');
      }
    };

    // If user data is available from context, use it, otherwise fetch fresh data
    if (user?.profile) {
      setBasicInfo({
        name: user.profile.name || '',
        rollNumber: user.profile.rollNumber || '',
        degree: user.profile.degree || '',
        department: user.profile.department || '',
        graduationYear: user.profile.graduationYear || '',
        cgpa: user.profile.cgpa || '',
        address: user.profile.address || '',
        phoneNumber: user.profile.phoneNumber || '',
        linkedinUrl: user.profile.linkedinUrl || '',
        githubUrl: user.profile.githubUrl || '',
        currentBacklogs: user.profile.currentBacklogs || 0,
        historyOfBacklogs: user.profile.historyOfBacklogs || [],
        aboutMe: user.profile.aboutMe || '',
        skills: Array.isArray(user.profile.skills) 
          ? user.profile.skills.join(', ') 
          : (user.profile.skills || ''),
      });
    } else {
      fetchUserProfile();
    }
  }, [user]);

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent CGPA changes for students and placement representatives
    if (name === 'cgpa' && (user?.role === 'student' || user?.role === 'placement_representative')) {
      return;
    }
    
    if (name === "skills") {
      setBasicInfo((prev) => ({
        ...prev,
        skills: value
      }));
    } else {
      setBasicInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === "marksheets") {
      setFiles((prev) => ({ ...prev, marksheets: Array.from(selectedFiles) }));
    } else {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const submitBasicInfo = async () => {
    setLoading(true);
    try {
      const dataToSend = {
        ...basicInfo,
        skills: typeof basicInfo.skills === 'string' 
          ? basicInfo.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
          : basicInfo.skills
      };

      // Remove CGPA from update data for students and PRs
      if (user?.role === 'student' || user?.role === 'placement_representative') {
        delete dataToSend.cgpa;
      }

      const response = await axios.put(
        "http://localhost:5000/api/profile/basic-info",
        dataToSend,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      updateUser(response.data.user);
      toast.success("Profile updated successfully!");
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const submitFiles = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      if (files.photo) formData.append("photo", files.photo);
      if (files.resume) formData.append("resume", files.resume);
      if (files.collegeIdCard)
        formData.append("collegeIdCard", files.collegeIdCard);

      files.marksheets.forEach((file) => {
        formData.append("marksheets", file);
      });

      const response = await axios.post(
        "http://localhost:5000/api/profile/upload-files",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully!");
      updateUser(response.data.user);
      navigate("/dashboard");
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload files");
    } finally {
      setLoading(false);
    }
  };

  // Fix functions for managing backlogs
  const addBacklogToHistory = () => {
    if (backlogEntry.subject && backlogEntry.semester) {
      setBasicInfo(prev => ({
        ...prev,
        historyOfBacklogs: [...(prev.historyOfBacklogs || []), backlogEntry]
      }));
      setBacklogEntry({ subject: '', semester: '', cleared: false });
    }
  };

  const removeBacklogFromHistory = (index) => {
    setBasicInfo(prev => ({
      ...prev,
      historyOfBacklogs: prev.historyOfBacklogs.filter((_, i) => i !== index)
    }));
  };

  // Copy the render methods from CompleteProfile
  const renderBasicInfoStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            name="name"
            value={basicInfo.name}
            onChange={handleBasicInfoChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Roll Number *</label>
          <input
            type="text"
            name="rollNumber"
            value={basicInfo.rollNumber}
            onChange={handleBasicInfoChange}
            placeholder="e.g., 21CS001"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Degree *</label>
          <select
            name="degree"
            value={basicInfo.degree}
            onChange={handleBasicInfoChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Degree</option>
            <option value="B.E">B.E</option>
            <option value="B.TECH">B.TECH</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department *</label>
          <select
            name="department"
            value={basicInfo.department}
            onChange={handleBasicInfoChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Graduation Year *</label>
          <select
            name="graduationYear"
            value={basicInfo.graduationYear}
            onChange={handleBasicInfoChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Year</option>
            {graduationYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CGPA *</label>
          <input
            type="number"
            name="cgpa"
            value={basicInfo.cgpa}
            onWheel={(e) => e.target.blur()}
            onChange={handleBasicInfoChange}
            step="0.01"
            min="0"
            max="10"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
            required
            readOnly
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">
            CGPA can only be updated by Placement Officer
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current Backlogs</label>
          <input
            type="number"
            name="currentBacklogs"
            value={basicInfo.currentBacklogs}
            onWheel={(e) => e.target.blur()}
            onChange={handleBasicInfoChange}
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address *</label>
        <textarea
          name="address"
          value={basicInfo.address}
          onChange={handleBasicInfoChange}
          rows="3"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={basicInfo.phoneNumber}
            onChange={handleBasicInfoChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">LinkedIn URL *</label>
          <input
            type="url"
            name="linkedinUrl"
            value={basicInfo.linkedinUrl}
            onChange={handleBasicInfoChange}
            placeholder="https://linkedin.com/in/yourprofile"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          GitHub URL{" "}
          {["Computer Science and Engineering ", "Information Technology"].includes(basicInfo.department) ? "*" : "(Optional)"}
        </label>
        <input
          type="url"
          name="githubUrl"
          value={basicInfo.githubUrl}
          onChange={handleBasicInfoChange}
          placeholder="https://github.com/yourusername"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required={["Computer Science", "Information Technology"].includes(basicInfo.department)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">About Me *</label>
        <textarea
          name="aboutMe"
          value={basicInfo.aboutMe}
          onChange={handleBasicInfoChange}
          rows="4"
          minLength="50"
          maxLength="500"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        />
        <div className="text-sm text-gray-500 mt-1">
          {basicInfo.aboutMe.length}/500 characters (minimum 50)
        </div>
      </div>

      {/* Skills */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          name="skills"
          value={Array.isArray(basicInfo.skills) ? basicInfo.skills.join(', ') : basicInfo.skills || ''}
          onChange={(e) => {
            const skillsString = e.target.value;
            const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
            setBasicInfo(prev => ({ ...prev, skills: skillsArray }));
          }}
          placeholder="JavaScript, React, Node.js, Python"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <div className="text-sm text-gray-500 mt-1">
          {Array.isArray(basicInfo.skills) ? basicInfo.skills.length : 0} skills added
        </div>
      </div>

      {/* History of Backlogs */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          History of Backlogs (Optional)
        </label>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Subject"
              value={backlogEntry.subject}
              onChange={(e) => setBacklogEntry(prev => ({...prev, subject: e.target.value}))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="text"
              placeholder="Semester"
              value={backlogEntry.semester}
              onChange={(e) => setBacklogEntry(prev => ({...prev, semester: e.target.value}))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <select
              value={backlogEntry.cleared}
              onChange={(e) => setBacklogEntry(prev => ({...prev, cleared: e.target.value === 'true'}))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={false}>Not Cleared</option>
              <option value={true}>Cleared</option>
            </select>
            <button
              type="button"
              onClick={addBacklogToHistory}
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          
          {basicInfo.historyOfBacklogs && basicInfo.historyOfBacklogs.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Added Backlogs:</h4>
              <div className="space-y-2">
                {basicInfo.historyOfBacklogs.map((backlog, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">
                      {backlog.subject} - {backlog.semester} ({backlog.cleared ? 'Cleared' : 'Not Cleared'})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBacklogFromHistory(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={submitBasicInfo}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save & Continue"}
      </button>
    </div>
  );

  const renderFileUploadStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Document Upload</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Photo *</label>
          <input
            type="file"
            name="photo"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {user?.profile?.photo && (
            <div className="text-sm text-green-600 mt-1">Current: {user.profile.photo}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Resume *</label>
          <input
            type="file"
            name="resume"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {user?.profile?.resume && (
            <div className="text-sm text-green-600 mt-1">Current: {user.profile.resume}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">College ID Card *</label>
          <input
            type="file"
            name="collegeIdCard"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {user?.profile?.collegeIdCard && (
            <div className="text-sm text-green-600 mt-1">Current: {user.profile.collegeIdCard}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Marksheets * (All semesters)</label>
          <input
            type="file"
            name="marksheets"
            onChange={handleFileChange}
            accept=".pdf"
            multiple
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {user?.profile?.marksheets?.length > 0 && (
            <div className="text-sm text-green-600 mt-1">
              Current: {user.profile.marksheets.length} files uploaded
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={submitFiles}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-gray-600">Update your profile information</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="mb-6">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-300"
                }`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-4 ${
                  currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
                }`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-300"
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Basic Information</span>
                <span>Document Upload</span>
              </div>
            </div>

            {currentStep === 1 && renderBasicInfoStep()}
            {currentStep === 2 && renderFileUploadStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;




















