import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://blogging-platform-mnra.onrender.com/api/auth';

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/login`, userData);

      // ✅ IMPORTANT: log dekhne ke liye (debug)
      console.log("LOGIN RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null, // ✅ persist login
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },

    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user"); // ✅ clear storage
    },

    updateProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
      localStorage.setItem("user", JSON.stringify(state.user));
    }
  },

  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const userData = action.payload.user || action.payload.data;

        state.user = userData;
        localStorage.setItem("user", JSON.stringify(userData)); // ✅ save
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const userData = action.payload.user || action.payload.data;

        state.user = userData;
        localStorage.setItem("user", JSON.stringify(userData)); // ✅ save
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

// exports
export const { reset, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;