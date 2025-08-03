import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import userReducer from './features/userSlice';
import jobDrivesReducer from './features/jobDrivesSlice';
import placementConsentReducer from './features/placementConsentSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  jobDrives: jobDrivesReducer,
  placementConsent: placementConsentReducer,
});

export default rootReducer; 