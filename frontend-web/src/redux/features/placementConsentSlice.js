import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../utils/apiWrapper/apiRequest';

const initialState = {
  consents: [],
  currentConsent: null,
  loading: false,
  error: null,
  userConsent: null,
};

// Async thunks
export const fetchAllConsents = createAsyncThunk(
  'placementConsent/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest('get', '/placement-consent', {}, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consents');
    }
  }
);

export const fetchUserConsent = createAsyncThunk(
  'placementConsent/fetchUserConsent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest('get', '/placement-consent/status', {}, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user consent');
    }
  }
);

export const submitConsent = createAsyncThunk(
  'placementConsent/submit',
  async (consentData, { rejectWithValue }) => {
    try {
      const response = await apiRequest('post', '/placement-consent', consentData, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit consent');
    }
  }
);

export const updateConsent = createAsyncThunk(
  'placementConsent/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('put', `/placement-consent/${id}`, data, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update consent');
    }
  }
);

export const approveConsent = createAsyncThunk(
  'placementConsent/approve',
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('patch', `/placement-consent/${id}/approve`, { remarks }, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve consent');
    }
  }
);

export const rejectConsent = createAsyncThunk(
  'placementConsent/reject',
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('patch', `/placement-consent/${id}/reject`, { remarks }, true);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject consent');
    }
  }
);

export const deleteConsent = createAsyncThunk(
  'placementConsent/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest('delete', `/placement-consent/${id}`, {}, true);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete consent');
    }
  }
);

const placementConsentSlice = createSlice({
  name: 'placementConsent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConsent: (state, action) => {
      state.currentConsent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all consents
      .addCase(fetchAllConsents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllConsents.fulfilled, (state, action) => {
        state.loading = false;
        state.consents = action.payload;
        state.error = null;
      })
      .addCase(fetchAllConsents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user consent
      .addCase(fetchUserConsent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserConsent.fulfilled, (state, action) => {
        state.loading = false;
        state.userConsent = action.payload;
        state.error = null;
      })
      .addCase(fetchUserConsent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit consent
      .addCase(submitConsent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitConsent.fulfilled, (state, action) => {
        state.loading = false;
        state.userConsent = action.payload;
        state.consents.unshift(action.payload);
        state.error = null;
      })
      .addCase(submitConsent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update consent
      .addCase(updateConsent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConsent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.consents.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.consents[index] = action.payload;
        }
        if (state.currentConsent?._id === action.payload._id) {
          state.currentConsent = action.payload;
        }
        if (state.userConsent?._id === action.payload._id) {
          state.userConsent = action.payload;
        }
        state.error = null;
      })
      .addCase(updateConsent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve consent
      .addCase(approveConsent.fulfilled, (state, action) => {
        const consent = state.consents.find(c => c._id === action.payload._id);
        if (consent) {
          consent.consentStatus = 'approved';
          consent.approvedBy = action.payload.approvedBy;
          consent.approvedDate = action.payload.approvedDate;
          consent.remarks = action.payload.remarks;
        }
        if (state.currentConsent?._id === action.payload._id) {
          state.currentConsent = action.payload;
        }
        if (state.userConsent?._id === action.payload._id) {
          state.userConsent = action.payload;
        }
      })
      // Reject consent
      .addCase(rejectConsent.fulfilled, (state, action) => {
        const consent = state.consents.find(c => c._id === action.payload._id);
        if (consent) {
          consent.consentStatus = 'rejected';
          consent.approvedBy = action.payload.approvedBy;
          consent.approvedDate = action.payload.approvedDate;
          consent.remarks = action.payload.remarks;
        }
        if (state.currentConsent?._id === action.payload._id) {
          state.currentConsent = action.payload;
        }
        if (state.userConsent?._id === action.payload._id) {
          state.userConsent = action.payload;
        }
      })
      // Delete consent
      .addCase(deleteConsent.fulfilled, (state, action) => {
        state.consents = state.consents.filter(c => c._id !== action.payload);
        if (state.currentConsent?._id === action.payload) {
          state.currentConsent = null;
        }
        if (state.userConsent?._id === action.payload) {
          state.userConsent = null;
        }
      });
  },
});

export const { clearError, setCurrentConsent } = placementConsentSlice.actions;
export default placementConsentSlice.reducer; 