import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/alumni/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action, response = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/alumni/requests/${requestId}`, {
        status: action,
        response
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Request ${action} successfully`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Requests</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded ${filter === 'accepted' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            Accepted
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">No requests found.</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.student.name}</h3>
                  <p className="text-gray-600">{request.student.email}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-1">
                    {request.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status.toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{request.message}</p>
              
              {request.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequestAction(request._id, 'accepted')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(request._id, 'rejected')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {request.response && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Response:</p>
                  <p className="text-gray-800">{request.response}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentRequests;

