import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Mail, Phone, User, GraduationCap, Star } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'react-toastify';

const DriveApplications = () => {
  const { driveId } = useParams();
  const [applications, setApplications] = useState([]);
  const [driveInfo, setDriveInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchApplications();
  }, [driveId]);

  const fetchApplications = async () => {
    try {
      const response = await api.get(`/company/drive/${driveId}/applications`);
      setApplications(response.data);
      
      // Get drive info from the first application
      if (response.data.length > 0) {
        const driveResponse = await api.get('/company/requests');
        const drive = driveResponse.data.find(d => d._id === driveId);
        setDriveInfo(drive);
      }
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shortlisted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Selected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'All' || app.status === filter
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/requests"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Requests
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {driveInfo ? driveInfo.driveTitle : 'Drive Applications'}
          </h1>
          <p className="text-gray-600">
            {applications.length} student{applications.length !== 1 ? 's' : ''} applied for this drive
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['All', 'Applied', 'Shortlisted', 'Selected', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status} ({status === 'All' ? applications.length : applications.filter(a => a.status === status).length})
              </button>
            ))}
          </nav>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application, index) => (
              <motion.div
                key={application._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.student.name}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <a href={`mailto:${application.student.email}`} className="hover:text-blue-600">
                            {application.student.email}
                          </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <a href={`tel:${application.student.phone}`} className="hover:text-blue-600">
                            {application.student.phone}
                          </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {application.student.department} - Year {application.student.year}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 mr-2" />
                          CGPA: {application.student.cgpa}
                        </div>
                        <div className="text-sm text-gray-600">
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {application.student.skills && application.student.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.student.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Notes:</h4>
                        <p className="text-sm text-gray-600">{application.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <a
                      href={application.student.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Resume
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto h-12 w-12 text-gray-400">
                <User className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'All' 
                  ? "No students have applied for this drive yet."
                  : `No ${filter.toLowerCase()} applications found.`
                }
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DriveApplications;
