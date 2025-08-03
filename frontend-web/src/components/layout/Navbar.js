import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../redux/customHooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/login");
    }
  };

  const handleEditProfile = () => {
    setIsProfileDropdownOpen(false);
    navigate("/edit-profile");
  };

  const getDashboardRoute = () => {
    if (user?.role === "student") return "/dashboard";
    if (user?.role === "placement_officer" || user?.role === "po")
      return "/po-dashboard";
    if (user?.role === "pr" || user?.role === "placement_representative")
      return "/pr-dashboard";
    return "/dashboard";
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-violet-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 lavender-gradient rounded-lg flex items-center justify-center lavender-shadow">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">
              Campus Portal
            </span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center space-x-6">
              <Link
                to={getDashboardRoute()}
                className="text-gray-700 hover:text-violet-700 transition-colors duration-300 font-medium"
              >
                Dashboard
              </Link>

              {user.role === "student" && (
                <Link
                  to="/job-drives"
                  className="text-gray-700 hover:text-violet-700 transition-colors duration-300 font-medium"
                >
                  Job Drives
                </Link>
              )}

              {(user.role === "placement_officer" || user.role === "po") && (
                <>
                  <Link
                    to="/manage-drives"
                    className="text-gray-700 hover:text-violet-700 transition-colors duration-300 font-medium"
                  >
                    Manage Drives
                  </Link>
                  <Link
                    to="/create-job-drive"
                    className="text-gray-700 hover:text-violet-700 transition-colors duration-300 font-medium"
                  >
                    Create Drive
                  </Link>
                  <Link
                    to="/student-details"
                    className="text-gray-700 hover:text-violet-700 transition-colors duration-300 font-medium"
                  >
                    Student Details
                  </Link>
                </>
              )}

              {(user.role === "pr" || user.role === "placement_representative") && (
                <Link
                  to="/pr-create-job"
                  className="text-gray-700 hover:text-violet-700 transition-colors duration-300 font-medium"
                >
                  Create Job Drive
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(user.profile?.name || user.email)}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-medium">
                          {getInitials(user.profile?.name || user.email)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile?.name || user.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.role === "student"
                              ? "Student"
                              : user.role === "placement_officer" ||
                                user.role === "po"
                              ? "Placement Officer"
                              : user.role === "pr" || user.role === "placement_representative"
                              ? "Placement Representative"
                              : user.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleEditProfile}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Profile
                      </button>

                      <Link
                        to={getDashboardRoute()}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                          />
                        </svg>
                        Dashboard
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;











