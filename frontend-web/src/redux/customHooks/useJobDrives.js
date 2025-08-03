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
      const result = await dispatch(fetchJobDrives(filters)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const loadJobDriveById = async (id) => {
    try {
      const result = await dispatch(fetchJobDriveById(id)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleCreateJobDrive = async (jobDriveData) => {
    try {
      const result = await dispatch(createJobDrive(jobDriveData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateJobDrive = async (id, data) => {
    try {
      const result = await dispatch(updateJobDrive({ id, data })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteJobDrive = async (id) => {
    try {
      await dispatch(deleteJobDrive(id)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const handleApplyToJobDrive = async (jobDriveId) => {
    try {
      const result = await dispatch(applyToJobDrive(jobDriveId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleWithdrawApplication = async (jobDriveId) => {
    try {
      const result = await dispatch(withdrawApplication(jobDriveId)).unwrap();
      return result;
    } catch (error) {
      throw error;
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
    fetchJobDrives: loadJobDrives,
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