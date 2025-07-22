import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import api from '../api/axios';

const PostDrive = () => {
  const [formData, setFormData] = useState({
    driveTitle: '',
    description: '',
    eligibilityCriteria: '',
    dateTime: '',
    mode: 'Online'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate date
    if (!formData.dateTime) {
      toast.error('Please select a date and time for the drive');
      return;
    }

    const selectedDate = new Date(formData.dateTime);
    const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (selectedDate < minDate) {
      toast.error('Drive date must be at least 24 hours from now');
      return;
    }

    setLoading(true);

    try {
      await api.post('/company/request-drive', formData);
      toast.success('Drive request submitted successfully!');
      navigate('/requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit drive request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Post New Drive</h1>
            <p className="text-gray-600">Submit a new recruitment drive request</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="driveTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Drive Title *
                </label>
                <input
                  type="text"
                  id="driveTitle"
                  name="driveTitle"
                  required
                  value={formData.driveTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Software Developer - Campus Recruitment 2024"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the job role, responsibilities, and requirements..."
                />
              </div>

              <div>
                <label htmlFor="eligibilityCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                  Eligibility Criteria *
                </label>
                <textarea
                  id="eligibilityCriteria"
                  name="eligibilityCriteria"
                  required
                  rows={3}
                  value={formData.eligibilityCriteria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., B.Tech/M.Tech in CS/IT, CGPA >= 7.0, No active backlogs..."
                />
              </div>

              <div>
                <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Drive Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  required
                  value={formData.dateTime}
                  onChange={handleChange}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Select date and time"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please select date and time for the recruitment drive (minimum 24 hours from now)
                </p>
              </div>

              <div>
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-2">
                  Drive Mode *
                </label>
                <select
                  id="mode"
                  name="mode"
                  required
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Drive Request'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All drive requests are subject to approval by the Placement Office</li>
              <li>• You will be notified via email once your request is reviewed</li>
              <li>• Please ensure all information is accurate before submitting</li>
              <li>• Drive dates should be at least 7 days from the submission date</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PostDrive;
