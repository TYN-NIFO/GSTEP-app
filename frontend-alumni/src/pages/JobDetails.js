import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/alumni/opportunity/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJob(response.data.opportunity);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
          <Link to="/opportunities" className="text-blue-600 hover:text-blue-800">
            Back to opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/opportunities" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            ← Back to opportunities
          </Link>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {job.company.charAt(0)}
                </div>
                <div className="ml-6">
                  <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
                  <p className="text-xl text-slate-600 mt-1">{job.company}</p>
                  <div className="flex items-center mt-2 space-x-4 text-slate-500">
                    <span>📍 {job.location}</span>
                    <span>💼 {job.type}</span>
                    {job.salary && <span>💰 {job.salary}</span>}
                  </div>
                </div>
              </div>
              {user && job.postedBy === user.id && (
                <Link
                  to={`/edit-job/${job._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Job
                </Link>
              )}
            </div>

            {/* Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Posted</h3>
                <p className="text-slate-600">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
              {job.deadline && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Deadline</h3>
                  <p className="text-slate-600">{new Date(job.deadline).toLocaleDateString()}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Applications</h3>
                <p className="text-slate-600">{job.applicants?.length || 0}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-slate-700">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-slate-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Department */}
            {job.department && job.department.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Target Departments</h2>
                <div className="flex flex-wrap gap-2">
                  {job.department.map((dept, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="border-t border-slate-200 pt-6">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;