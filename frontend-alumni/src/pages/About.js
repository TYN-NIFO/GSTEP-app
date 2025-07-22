import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    graduationYear: user?.graduationYear || '',
    currentCompany: user?.currentCompany || '',
    position: user?.position || '',
    experience: '',
    location: '',
    phone: '',
    linkedin: '',
    website: '',
    bio: '',
    skills: user?.skills?.join(', ') || '',
    achievements: '',
    specialization: ''
  });

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: API call to update profile
      console.log('Updating profile:', profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      graduationYear: user?.graduationYear || '',
      currentCompany: user?.currentCompany || '',
      position: user?.position || '',
      experience: '',
      location: '',
      phone: '',
      linkedin: '',
      website: '',
      bio: '',
      skills: user?.skills?.join(', ') || '',
      achievements: '',
      specialization: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                About Me
              </h1>
              <p className="text-slate-600 mt-2">Manage your professional profile and information</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <PencilIcon className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                >
                  <CheckIcon className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{profileData.name}</h2>
                <p className="text-blue-100 text-lg">{profileData.position}</p>
                <p className="text-blue-200">{profileData.currentCompany}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-slate-600">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                  <span>{profileData.department}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span>Class of {profileData.graduationYear}</span>
                </div>
                {profileData.location && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                {profileData.phone && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-slate-600">
                  <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                  <span>{profileData.email}</span>
                </div>
                {profileData.website && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <GlobeAltIcon className="w-5 h-5 text-blue-600" />
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900">Professional Information</h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={profileData.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      name="graduationYear"
                      value={profileData.graduationYear}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Current Company
                    </label>
                    <input
                      type="text"
                      name="currentCompany"
                      value={profileData.currentCompany}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Current Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={profileData.position}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={profileData.experience}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g., 5 years"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g., San Francisco, CA"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={profileData.linkedin}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Website/Portfolio
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={profileData.specialization}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g., Full Stack Development, Data Science"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="React, Node.js, Python, AWS, etc."
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell students about your career journey, experience, and what you're passionate about..."
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Key Achievements
                    </label>
                    <textarea
                      name="achievements"
                      value={profileData.achievements}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="List your major achievements, awards, certifications, or notable projects..."
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none ${
                        isEditing 
                          ? 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                          : 'border-slate-200 bg-slate-50'
                      } text-slate-900 font-medium`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;