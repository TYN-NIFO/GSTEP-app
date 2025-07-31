import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [eligibleDrives, setEligibleDrives] = useState([]);
  const [allDrives, setAllDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalDrives: 0,
    appliedDrives: 0,
    availableDrives: 0,
    allDrives: 0,
  });
  const navigate = useNavigate();

  // Add debugging
  console.log("=== StudentDashboard Debug ===");
  console.log("authLoading:", authLoading);
  console.log("user:", user);
  console.log("user.profile:", user?.profile);
  console.log("isProfileComplete:", user?.profile?.isProfileComplete);
  console.log("loading:", loading);
  console.log("token exists:", !!localStorage.getItem("token"));

  // If auth is still loading, show loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user after auth loading is complete, redirect to login
  if (!user) {
    console.log("No user found, redirecting to login");
    navigate("/login");
    return null;
  }

  // If student profile is not complete, redirect to complete profile
  if (
    user.role === "student" &&
    user.profile &&
    !user.profile.isProfileComplete
  ) {
    console.log("Profile incomplete, redirecting to complete-profile");
    navigate("/complete-profile");
    return null;
  }

  // Use useCallback to define the function
  const fetchEligibleDrives = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("=== FETCHING DRIVES ===");
      console.log("User:", user.email, "Role:", user.role);

      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        navigate("/login");
        return;
      }

      // Use the protected student-drives endpoint
      const response = await axios.get(
        "http://localhost:5000/api/job-drives/student-drives",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Drives response:", response.data);
      const drives = response.data.drives || [];
      setEligibleDrives(drives);

      // Also fetch all drives for stats
      const allDrivesResponse = await axios.get(
        "http://localhost:5000/api/job-drives/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allDrivesData = allDrivesResponse.data.jobDrives || [];
      setAllDrives(allDrivesData);

      // Calculate stats
      const total = drives.length;
      const applied = drives.filter((drive) =>
        drive.applications?.some((app) => {
          const studentId = app.student?._id || app.student;
          const userId = user?.id || user?._id;
          return studentId === userId;
        })
      ).length;
      const available = total - applied;

      setStats({
        totalDrives: total,
        appliedDrives: applied,
        availableDrives: available,
        allDrives: allDrivesData.length,
      });
    } catch (error) {
      console.error("=== FETCH ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        const errorData = error.response.data;
        if (errorData.needsProfileCompletion) {
          navigate("/complete-profile");
        } else if (errorData.needsPlacementConsent) {
          navigate("/placement-consent");
        } else if (errorData.needsOtpVerification) {
          navigate("/otp-verification");
        } else {
          alert("Access denied. Please contact administrator.");
        }
      } else {
        alert("Failed to fetch drives. Please try again.");
      }

      setEligibleDrives([]);
      setAllDrives([]);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (authLoading) {
      console.log("Auth still loading, waiting...");
      return;
    }

    if (!user) {
      console.log("No user found after auth loading complete");
      setLoading(false);
      return;
    }

    console.log("User found, fetching drives for:", user.email);
    fetchEligibleDrives();
  }, [user, authLoading, fetchEligibleDrives]);

  // Show loading only if auth is loading or we're fetching data
  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleApply = async (driveId) => {
    try {
      const token = localStorage.getItem("token");

      console.log("Applying to drive:", driveId);
      console.log("User profile:", user?.profile);

      const response = await axios.post(
        `http://localhost:5000/api/job-drives/${driveId}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Application submitted successfully!");

      // Update the local state to reflect the application immediately
      setEligibleDrives((prevDrives) =>
        prevDrives.map((drive) => {
          if (drive._id === driveId) {
            // Create a new applications array if it doesn't exist
            const applications = drive.applications || [];
            // Add the current user's application
            return {
              ...drive,
              applications: [
                ...applications,
                { student: user?.id, appliedAt: new Date() },
              ],
            };
          }
          return drive;
        })
      );

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        appliedDrives: prevStats.appliedDrives + 1,
        availableDrives: prevStats.availableDrives - 1,
      }));

      // Also fetch fresh data from the server
      fetchEligibleDrives();
    } catch (error) {
      console.error("Apply error:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Application failed");
      } else if (error.response?.status === 403) {
        toast.error(`Access denied: ${error.response.data?.message}`);
      } else if (error.response?.status === 401) {
        toast.error("Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to apply. Please try again.");
      }
    }
  };

  // Helper function to check if user has applied to a drive
  const hasApplied = (drive) => {
    if (!drive.applications || (!user?.id && !user?._id)) return false;

    const userId = user?.id || user?._id;

    return drive.applications.some((app) => {
      // Handle both object format { student: "id" } and string format "id"
      if (typeof app === "object" && app !== null) {
        const studentId = app.student?._id || app.student?.id || app.student;
        return (
          studentId === userId ||
          studentId === user?.id ||
          studentId === user?._id
        );
      }
      return app === userId || app === user?.id || app === user?._id;
    });
  };

  // Helper function to check if drive has ended
  const isDriveEnded = (drive) => {
    if (!drive.date) return false;
    
    const driveDate = new Date(drive.date);
    const currentDate = new Date();
    
    // If drive has time, use it for comparison
    if (drive.time) {
      const [hours, minutes] = drive.time.split(':').map(Number);
      driveDate.setHours(hours, minutes, 0, 0);
      return currentDate > driveDate;
    } else {
      // If no time specified, consider drive ended at end of day
      driveDate.setHours(23, 59, 59, 999);
      return currentDate > driveDate;
    }
  };

  // Helper function to check if user is eligible for a drive
  const isEligibleForDrive = (drive) => {
    if (!user?.profile) return false;

    const userCGPA = parseFloat(user.profile.cgpa) || 0;
    const userBacklogs = parseInt(user.profile.currentBacklogs || user.profile.backlogs) || 0;
    const userDepartment = user.profile.department;
    const userBatch = user.profile.batch;
    const isUserPlaced = user.profile.isPlaced || user.profile.placementStatus === 'placed';

    // Check CGPA requirement
    if (drive.eligibility?.minCGPA && drive.eligibility.minCGPA > userCGPA) {
      return false;
    }

    // Check department requirement
    if (drive.eligibility?.allowedDepartments && 
        drive.eligibility.allowedDepartments.length > 0 && 
        !drive.eligibility.allowedDepartments.includes(userDepartment)) {
      return false;
    }

    // Check backlog requirement
    if (drive.eligibility?.maxBacklogs !== undefined && 
        drive.eligibility.maxBacklogs < userBacklogs) {
      return false;
    }

    // Check batch eligibility
    if (drive.eligibility?.allowedBatches && 
        drive.eligibility.allowedBatches.length > 0 && 
        !drive.eligibility.allowedBatches.includes(userBatch)) {
      return false;
    }

    // Check placement status eligibility
    const driveCTC = parseFloat(drive.ctc) || 0;

    // If user is placed, only show drives with CTC > 10 LPA
    if (isUserPlaced && driveCTC <= 10) {
      return false;
    }

    // If drive is for unplaced only, check placement status
    if (drive.unplacedOnly && isUserPlaced) {
      return false;
    }

    return true;
  };

  const handleViewDrive = (drive) => {
    setSelectedDrive(drive);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDrive(null);
  };

  // Modal component
  const DriveModal = ({ drive, onClose }) => {
    if (!drive) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {drive.companyName}
                </h2>
                <p className="text-xl text-gray-600">{drive.role}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Job Details</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {drive.type || drive.jobType || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {drive.location ||
                        drive.locations?.join(", ") ||
                        "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">CTC:</span>{" "}
                      {drive.ctc ? `₹${drive.ctc} LPA` : "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {drive.date
                        ? new Date(drive.date).toLocaleDateString()
                        : "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Deadline:</span>{" "}
                      {drive.deadline
                        ? new Date(drive.deadline).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Eligibility Criteria
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Min CGPA:</span>{" "}
                      {drive.eligibility?.minCGPA || 0}
                    </p>
                    <p>
                      <span className="font-medium">Max Backlogs:</span>{" "}
                      {drive.eligibility?.maxBacklogs || 0}
                    </p>
                    <p>
                      <span className="font-medium">Departments:</span>{" "}
                      {drive.eligibility?.allowedDepartments?.join(", ") ||
                        "All"}
                    </p>
                    <p>
                      <span className="font-medium">Batches:</span>{" "}
                      {drive.eligibility?.allowedBatches?.join(", ") || "All"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    {drive.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Requirements</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    {drive.requirements || "No specific requirements mentioned"}
                  </p>
                </div>

                {drive.skills && drive.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Required Skills
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {drive.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {drive.bond && (
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Bond Details
                    </h3>
                    <p className="mt-2 text-sm text-gray-700">{drive.bond}</p>
                  </div>
                )}

                {drive.rounds && drive.rounds.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Selection Rounds
                    </h3>
                    <div className="mt-2 space-y-1">
                      {drive.rounds.map((round, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          {index + 1}. {round}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Applications: {drive.applications?.length || 0}</p>
                  <p>
                    Created by:{" "}
                    {drive.createdBy?.profile?.name ||
                      drive.createdBy?.email ||
                      "Unknown"}
                  </p>
                </div>

                <div className="flex space-x-2">
                  {hasApplied(drive) ? (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center">
                      ✓ Applied
                    </span>
                  ) : new Date(drive.date) >= new Date() &&
                    isEligibleForDrive(drive) ? (
                    <button
                      onClick={() => {
                        handleApply(drive._id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium"
                    >
                      Apply Now
                    </button>
                  ) : !isEligibleForDrive(drive) ? (
                    <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                      Not Eligible
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                      Drive Ended
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="card-white-hover p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div
          className={`w-12 h-12 lavender-bg-light rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Student Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {user?.profile?.name || user?.name}!
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/edit-profile")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Drives
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.allDrives}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Eligible Drives
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalDrives}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applied</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.appliedDrives}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.availableDrives}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* All Available Drives */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Available Job Drives
            </h2>
          </div>
          <div className="p-6">
            {allDrives.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No job drives available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allDrives
                  .filter(drive => {
                    // Filter by department eligibility
                    const userDepartment = user?.profile?.department;
                    if (!userDepartment) return false;
                    
                    // If no department restrictions, it's available to all departments
                    if (!drive.eligibility?.allowedDepartments || drive.eligibility.allowedDepartments.length === 0) {
                      return true;
                    }
                    // Check if user's department is in allowed departments
                    return drive.eligibility.allowedDepartments.includes(userDepartment);
                  })
                  .slice(0, 5)
                  .map((drive) => (
                  <div
                    key={drive._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {drive.companyName}
                        </h3>
                        <p className="text-gray-600">{drive.role}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                          <div>
                            <span className="font-medium">Location:</span>{" "}
                            {drive.location ||
                              drive.locations?.join(", ") ||
                              "Not specified"}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {drive.type === 'full-time' ? 'Full Time' : 
                             drive.type === 'internship' ? 'Internship' : 
                             drive.jobType === 'full-time' ? 'Full Time' :
                             drive.jobType === 'internship' ? 'Internship' : 'Full Time'}
                          </div>
                          <div>
                            <span className="font-medium">CTC:</span>
                            {drive.ctc ? `₹${drive.ctc} LPA` : "Not specified"}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{" "}
                            {drive.date
                              ? new Date(drive.date).toLocaleDateString()
                              : "Not specified"}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Applications: {drive.applications?.length || 0}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDrive(drive)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium"
                        >
                          View
                        </button>
                        {hasApplied(drive) ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                            ✓ Applied
                          </span>
                        ) : new Date(drive.date) >= new Date() &&
                          isEligibleForDrive(drive) ? (
                          <button
                            onClick={() => handleApply(drive._id)}
                            className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded text-sm font-medium"
                          >
                            Apply
                          </button>
                        ) : !isEligibleForDrive(drive) ? (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                            Not Eligible
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium">
                            Ended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <button
                    onClick={() => navigate("/job-drives")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    View Eligible Drives
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && <DriveModal drive={selectedDrive} onClose={closeModal} />}
    </div>
  );
};

export default StudentDashboard;








