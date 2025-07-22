import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const MyOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOpportunity, setExpandedOpportunity] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/alumni/opportunities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities(response.data.opportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filter === 'all') return true;
    return opp.type === filter;
  });

  const toggleApplicants = (opportunityId) => {
    setExpandedOpportunity(expandedOpportunity === opportunityId ? null : opportunityId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Opportunities</h1>
        <p className="text-gray-600">Manage your posted job opportunities and view applicants</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'job', 'internship'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === type
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {type === 'all' ? 'All Opportunities' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {type === 'all' ? opportunities.length : opportunities.filter(o => o.type === type).length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by posting a new opportunity.
          </p>
          <div className="mt-6">
            <a href="/post" className="btn-primary">
              Post New Opportunity
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity._id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {opportunity.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                            {opportunity.company}
                          </div>
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {opportunity.location}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            opportunity.type === 'job' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {opportunity.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{opportunity.description}</p>
                    
                    {opportunity.requirements && opportunity.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {opportunity.requirements.slice(0, 3).map((req, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {req}
                            </li>
                          ))}
                          {opportunity.requirements.length > 3 && (
                            <li className="text-gray-500 italic">
                              +{opportunity.requirements.length - 3} more requirements
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Applicants Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {opportunity.applicants?.length || 0} applicants
                      </span>
                      <span className="text-sm text-gray-500">
                        Posted {new Date(opportunity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {opportunity.applicants?.length > 0 && (
                      <button
                        onClick={() => toggleApplicants(opportunity._id)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {expandedOpportunity === opportunity._id ? (
                          <>
                            <EyeSlashIcon className="w-4 h-4" />
                            <span>Hide Applicants</span>
                          </>
                        ) : (
                          <>
                            <EyeIcon className="w-4 h-4" />
                            <span>View Applicants</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Applicants List */}
                  {expandedOpportunity === opportunity._id && opportunity.applicants?.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-semibold text-gray-900">
                        Applicants ({opportunity.applicants.length})
                      </h4>
                      <div className="grid gap-3">
                        {opportunity.applicants.map((applicant) => (
                          <div key={applicant._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {applicant.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{applicant.name}</p>
                                <p className="text-sm text-gray-600">{applicant.email}</p>
                                <p className="text-sm text-gray-500">{applicant.department}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => window.open(`mailto:${applicant.email}`, '_blank')}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                📧 Contact
                              </button>
                              <button 
                                onClick={() => toast.success('Feature coming soon!')}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                👤 View Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOpportunities;

