import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBlog, likeBlog, addComment, deleteBlog } from '../store/slices/blogSlice';

const BlogDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { blog } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    dispatch(getBlog(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (blog && user) {
      setIsLiked(blog.likes?.includes(user.id));
    }
  }, [blog, user]);

  const handleLike = () => {
    if (!user) {
      alert('Please login to like');
      return;
    }
    dispatch(likeBlog(id));
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }
    if (!commentText.trim()) return;

    dispatch(addComment({ id, text: commentText }));
    setCommentText('');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      dispatch(deleteBlog(id));
      navigate('/');
    }
  };

  if (!blog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isAuthor = user && blog.author?._id === user.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Cover Image */}
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />
      )}

      {/* Blog Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
            {blog.category}
          </span>
          <span className="text-gray-500">
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-gray-800">{blog.title}</h1>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/profile/${blog.author?._id}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <img
              src={blog.author?.profileImage}
              alt={blog.author?.username}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-800">{blog.author?.username}</p>
              <p className="text-sm text-gray-500">{blog.views} views</p>
            </div>
          </Link>

          {isAuthor && (
            <div className="flex gap-2">
              <Link
                to={`/edit-blog/${blog._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
            isLiked
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
          <span className="font-semibold">{blog.likes?.length || 0} Likes</span>
        </button>
      </div>

      {/* Blog Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Comments ({blog.comments?.length || 0})
        </h2>

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              rows="3"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-600">
              Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to comment
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {blog.comments?.map((comment) => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <img
                  src={comment.user?.profileImage}
                  alt={comment.user?.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-800">{comment.user?.username}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;