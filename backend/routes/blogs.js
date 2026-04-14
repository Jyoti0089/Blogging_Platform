const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/auth');
const Blog = require('../models/Blog');
const User = require('../models/User');

/* =========================
   GET ALL BLOGS (PUBLIC)
========================= */
router.get('/', async (req, res) => {
  try {
    const { category, search, author, page = 1, limit = 10 } = req.query;
    const query = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   GET SINGLE BLOG (PUBLIC)
========================= */
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profileImage bio')
      .populate('comments.user', 'username profileImage');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.views += 1;
    await blog.save();

    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   CREATE BLOG (PRIVATE)
========================= */
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, status } = req.body;

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      status,
      author: req.user.id
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { blogs: blog._id }
    });

    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username profileImage');

    res.status(201).json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   UPDATE BLOG (PRIVATE)
========================= */
router.put('/:id', protect, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'username profileImage');

    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   DELETE BLOG (PRIVATE)
========================= */
router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await blog.deleteOne();

    await User.findByIdAndUpdate(blog.author, {
      $pull: { blogs: blog._id }
    });

    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   LIKE / UNLIKE BLOG
========================= */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const likeIndex = blog.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      blog.likes.splice(likeIndex, 1);
    } else {
      blog.likes.push(req.user.id);
    }

    await blog.save();

    res.json({
      success: true,
      data: {
        likes: blog.likes.length,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   ADD COMMENT
========================= */
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.comments.push({
      user: req.user.id,
      text
    });

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id)
      .populate('comments.user', 'username profileImage');

    res.json({
      success: true,
      data: updatedBlog.comments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   DELETE COMMENT
========================= */
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.deleteOne();
    await blog.save();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;