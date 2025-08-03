import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../utils/apiWrapper/apiRequest';

const initialState = {
  jobDrives: [],
  currentJobDrive: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    location: '',
    company: '',
  },
};

// Async thunks
export const fetchJobDrives = createAsyncThunk(
  'jobDrives/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await apiRequest('get', '/job-drives', filters || {}, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job drives');
    }
  }
);

export const fetchJobDriveById = createAsyncThunk(
  'jobDrives/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiRequest('get', `/job-drives/${id}`, {}, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job drive');
    }
  }
);

export const createJobDrive = createAsyncThunk(
  'jobDrives/create',
  async (jobDriveData, { rejectWithValue }) => {
    try {
      const response = await apiRequest('post', '/job-drives', jobDriveData, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create job drive');
    }
  }
);

export const updateJobDrive = createAsyncThunk(
  'jobDrives/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('put', `/job-drives/${id}`, data, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update job drive');
    }
  }
);

export const deleteJobDrive = createAsyncThunk(
  'jobDrives/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest('delete', `/job-drives/${id}`, {}, true);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete job drive');
    }
  }
);

export const applyToJobDrive = createAsyncThunk(
  'jobDrives/apply',
  async (jobDriveId, { rejectWithValue }) => {
    try {
      const response = await apiRequest('post', `/job-drives/${jobDriveId}/apply`, {}, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply to job drive');
    }
  }
);

export const withdrawApplication = createAsyncThunk(
  'jobDrives/withdraw',
  async (jobDriveId, { rejectWithValue }) => {
    try {
      const response = await apiRequest('delete', `/job-drives/${jobDriveId}/apply`, {}, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to withdraw application');
    }
  }
);

const jobDrivesSlice = createSlice({
  name: 'jobDrives',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentJobDrive: (state, action) => {
      state.currentJobDrive = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        location: '',
        company: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all job drives
      .addCase(fetchJobDrives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDrives.fulfilled, (state, action) => {
        state.loading = false;
        state.jobDrives = action.payload;
        state.error = null;
      })
      .addCase(fetchJobDrives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch job drive by ID
      .addCase(fetchJobDriveById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDriveById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJobDrive = action.payload;
        state.error = null;
      })
      .addCase(fetchJobDriveById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create job drive
      .addCase(createJobDrive.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJobDrive.fulfilled, (state, action) => {
        state.loading = false;
        state.jobDrives.unshift(action.payload);
        state.error = null;
      })
      .addCase(createJobDrive.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update job drive
      .addCase(updateJobDrive.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobDrive.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobDrives.findIndex(jd => jd._id === action.payload._id);
        if (index !== -1) {
          state.jobDrives[index] = action.payload;
        }
        if (state.currentJobDrive?._id === action.payload._id) {
          state.currentJobDrive = action.payload;
        }
        state.error = null;
      })
      .addCase(updateJobDrive.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete job drive
      .addCase(deleteJobDrive.fulfilled, (state, action) => {
        state.jobDrives = state.jobDrives.filter(jd => jd._id !== action.payload);
        if (state.currentJobDrive?._id === action.payload) {
          state.currentJobDrive = null;
        }
      })
      // Apply to job drive
      .addCase(applyToJobDrive.fulfilled, (state, action) => {
        const jobDrive = state.jobDrives.find(jd => jd._id === action.payload.jobDriveId);
        if (jobDrive) {
          jobDrive.appliedStudents.push(action.payload.studentId);
        }
        if (state.currentJobDrive?._id === action.payload.jobDriveId) {
          state.currentJobDrive.appliedStudents.push(action.payload.studentId);
        }
      })
      // Withdraw application
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        const jobDrive = state.jobDrives.find(jd => jd._id === action.payload.jobDriveId);
        if (jobDrive) {
          jobDrive.appliedStudents = jobDrive.appliedStudents.filter(
            id => id !== action.payload.studentId
          );
        }
        if (state.currentJobDrive?._id === action.payload.jobDriveId) {
          state.currentJobDrive.appliedStudents = state.currentJobDrive.appliedStudents.filter(
            id => id !== action.payload.studentId
          );
        }
      });
  },
});

export const { clearError, setCurrentJobDrive, setFilters, clearFilters } = jobDrivesSlice.actions;
export default jobDrivesSlice.reducer; 