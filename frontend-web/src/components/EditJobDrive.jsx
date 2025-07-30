import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const EditJobDrive = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Determine return path based on current location or referrer
  const getReturnPath = () => {
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get("returnTo");

    if (returnTo) {
      return returnTo;
    }

    // If coming from all-job-drives page, return there
    if (document.referrer.includes("/all-job-drives")) {
      return "/all-job-drives";
    }

    // Default return path
    return "/job-drives";
  };

  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    type: "full-time",
    ctc: "",
    location: "",
    date: "",
    deadline: "",
    description: "",
    requirements: "",
    skills: "",
    bond: "",
    rounds: "",
    eligibility: {
      minCGPA: "",
      allowedDepartments: [],
      maxBacklogs: "",
    },
  });

  useEffect(() => {
    fetchJobDrive();
  }, [id]);

  const fetchJobDrive = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/job-drives/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const drive = response.data.jobDrive;
      console.log("Fetched raw drive data:", drive); // Debug log

      setFormData({
        companyName: drive.companyName || "",
        role: drive.role || "",
        type: drive.type || drive.jobType || "full-time",
        ctc: drive.ctc || "",
        location: drive.location || "",
        date: drive.date ? drive.date.split('T')[0] : "",
        deadline: drive.deadline ? drive.deadline.split('T')[0] : "",
        description: drive.description || "",
        requirements: drive.requirements || "", // Ensure it's a string
        skills: Array.isArray(drive.skills) ? drive.skills.join(", ") : "",
        bond: drive.bond || "",
        rounds: Array.isArray(drive.rounds) ? drive.rounds.join(", ") : "",
        eligibility: {
          minCGPA: drive.eligibility?.minCGPA || "",
          allowedDepartments: drive.eligibility?.allowedDepartments || [],
          maxBacklogs: drive.eligibility?.maxBacklogs || "",
        },
      });
    } catch (error) {
      console.error("Error fetching job drive:", error);
      toast.error("Failed to fetch job drive details");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        jobType: formData.type,
        ctc: parseFloat(formData.ctc),
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        rounds: formData.rounds
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        eligibility: {
          cgpa: parseFloat(formData.eligibility.minCGPA) || 0,
          maxBacklogs: parseInt(formData.eligibility.maxBacklogs) || 0,
          departments: Array.isArray(formData.eligibility.allowedDepartments)
            ? formData.eligibility.allowedDepartments
            : formData.eligibility.allowedDepartments
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s),
        },
      };

      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/job-drives/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Job drive updated successfully!");
      navigate(getReturnPath());
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update job drive"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("eligibility.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading job drive details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Job Drive
                </h1>
                <p className="text-gray-600">Update job drive information</p>
              </div>
              <button
                onClick={() => navigate(getReturnPath())}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="full-time">Full Time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  CTC (LPA)
                </label>
                <input
                  type="number"
                  name="ctc"
                  value={formData.ctc}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Min CGPA
                </label>
                <input
                  type="number"
                  name="eligibility.minCGPA"
                  value={formData.eligibility.minCGPA}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  step="0.1"
                  min="0"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Backlogs
                </label>
                <input
                  type="number"
                  name="eligibility.maxBacklogs"
                  value={formData.eligibility.maxBacklogs}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Skills (comma separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Selection Rounds (comma separated)
              </label>
              <input
                type="text"
                name="rounds"
                value={formData.rounds}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Online Assessment, Technical Interview, HR Interview"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bond Details
              </label>
              <textarea
                name="bond"
                value={formData.bond}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Service agreement details (if any)"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(getReturnPath())}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Job Drive"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditJobDrive;



