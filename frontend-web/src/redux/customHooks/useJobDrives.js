import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchJobDrives,
  fetchJobDriveById,
  createJobDrive,
  updateJobDrive,
  deleteJobDrive,
  applyToJobDrive,
  withdrawApplication,
  setFilters,
  clearFilters,
  clearError,
} from '../features/jobDrivesSlice';

export const useJobDrives = () => {
  const dispatch = useAppDispatch();
  const { jobDrives, currentJobDrive, loading, error, filters } = useAppSelector(
    (state) => state.jobDrives
  );

  const loadJobDrives = async (filters) => {
    try {
      await dispatch(fetchJobDrives(filters)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const loadJobDriveById = async (id) => {
    try {
      await dispatch(fetchJobDriveById(id)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const handleCreateJobDrive = async (jobDriveData) => {
    try {
      await dispatch(createJobDrive(jobDriveData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const handleUpdateJobDrive = async (id, data) => {
    try {
      await dispatch(updateJobDrive({ id, data })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const handleDeleteJobDrive = async (id) => {
    try {
      await dispatch(deleteJobDrive(id)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const handleApplyToJobDrive = async (jobDriveId) => {
    try {
      await dispatch(applyToJobDrive(jobDriveId)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const handleWithdrawApplication = async (jobDriveId) => {
    try {
      await dispatch(withdrawApplication(jobDriveId)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const handleSetFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const clearJobDrivesError = () => {
    dispatch(clearError());
  };

  return {
    jobDrives,
    currentJobDrive,
    loading,
    error,
    filters,
    loadJobDrives,
    loadJobDriveById,
    createJobDrive: handleCreateJobDrive,
    updateJobDrive: handleUpdateJobDrive,
    deleteJobDrive: handleDeleteJobDrive,
    applyToJobDrive: handleApplyToJobDrive,
    withdrawApplication: handleWithdrawApplication,
    setFilters: handleSetFilters,
    clearFilters: handleClearFilters,
    clearError: clearJobDrivesError,
  };
}; 