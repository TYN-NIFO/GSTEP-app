import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Building, Edit3, Save, X } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthPage';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    email: '',
    contactNumber: '',
    description: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || '',
        hrName: user.hrName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        description: user.description || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put('/company/profile', formData);
      
      // Update the user context with new data
      const updatedUser = { ...user, ...response.data };
      login(updatedUser, localStorage.getItem('token'));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      companyName: user.companyName || '',
      hrName: user.hrName || '',
      email: user.email || '',
      contactNumber: user.contactNumber || '',
      description: user.description || '',
      location: user.location || ''
    });
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                  <p className="text-gray-600">Manage your company information and settings</p>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{loading ? 'Saving...' : 'Save'}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Company Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {user?.companyName || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description of your company"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[80px]">
                        {user?.description || 'No description provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Company location"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        {user?.location || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                {/* HR Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    HR Contact Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HR Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="hrName"
                        value={formData.hrName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {user?.hrName || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {user?.contactNumber || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Created
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <p className="text-gray-900 bg-green-50 px-3 py-2 rounded-md">
                      <span className="inline-flex items-center">
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                        Active
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
