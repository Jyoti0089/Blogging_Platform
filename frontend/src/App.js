import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateBlog from './pages/CreateBlog';
import BlogDetail from './pages/BlogDetail';
import EditBlog from './pages/EditBlog';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';



function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/create-blog" element={<CreateBlog />} />
              <Route path="/edit-blog/:id" element={<EditBlog />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;