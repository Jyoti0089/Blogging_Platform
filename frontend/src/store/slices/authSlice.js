import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/blogs';

const initialState = {
  blogs: [],
  blog: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  totalPages: 1,
  currentPage: 1
};

// Create blog
export const createBlog = createAsyncThunk(
  'blog/create',
  async (blogData, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user?.token;

      const response = await axios.post(API_URL, blogData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all blogs
export const getBlogs = createAsyncThunk(
  'blog/getAll',
  async (filters = {}, thunkAPI) => {
    try {
      const { category, search, page = 1 } = filters;
      let url = `${API_URL}?page=${page}`;
      
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single blog
export const getBlog = createAsyncThunk(
  'blog/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update blog
export const updateBlog = createAsyncThunk(
  'blog/update',
  async ({ id, blogData }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user?.token;

      const response = await axios.put(`${API_URL}/${id}`, blogData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete blog
export const deleteBlog = createAsyncThunk(
  'blog/delete',
  async (id, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user?.token;

      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Like blog
export const likeBlog = createAsyncThunk(
  'blog/like',
  async (id, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user?.token;

      const response = await axios.post(
        `${API_URL}/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { id, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add comment
export const addComment = createAsyncThunk(
  'blog/addComment',
  async ({ id, text }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user?.token;

      const response = await axios.post(
        `${API_URL}/${id}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.blogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get all blogs
      .addCase(getBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.blogs = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get single blog
      .addCase(getBlog.fulfilled, (state, action) => {
        state.blog = action.payload;
      })
      // Update blog
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.blog = action.payload;
      })
      // Delete blog
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((blog) => blog._id !== action.payload);
      })
      // Like blog
      .addCase(likeBlog.fulfilled, (state, action) => {
        if (state.blog && state.blog._id === action.payload.id) {
          state.blog.likes = action.payload.data.likes;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.blog) {
          state.blog.comments = action.payload;
        }
      });
  }
});

export const { reset } = blogSlice.actions;
export default blogSlice.reducer;