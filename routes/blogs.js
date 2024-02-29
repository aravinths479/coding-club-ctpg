// controllers/blogController.js
const express = require("express");
const { marked } = require("marked"); // Import the marked library
const createDOMPurify = require("dompurify");
const DOMPurify = require("dompurify");

const { JSDOM } = require("jsdom");

const BlogPost = require("../models/BlogPost");
const { ensureAuthenticated, isStudent } = require("../config/auth");

const router = express.Router();

// Create a new blog post
router.get("/write-blog", ensureAuthenticated, isStudent, (req, res) => {
  return res.render("student/newBlog", { user: req.user });
});

router.post("/write-blog", ensureAuthenticated, isStudent, async (req, res) => {
  try {
    const { title, content } = req.body;

    // User ID can be accessed from the req.user object provided by the authentication middleware
    const userId = req.user.id;

    // Create a new blog post with user reference
    const blogPost = new BlogPost({ title, content, user: userId });
    await blogPost.save();
    console.log(blogPost);
    return res.redirect("/blogs/view-blogs");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all blog posts
router.get("/view-blogs", ensureAuthenticated, isStudent, async (req, res) => {
  try {
    var blogPosts = await BlogPost.find()
      .populate("user")
      .sort({ createdAt: -1 });

    return res.render("student/readBlogs", {
      user: req.user,
      blogs: blogPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-blog/:id", ensureAuthenticated, isStudent, async (req, res) => {
    try {
      // Retrieve the blog post by ID
      const blogPost = await BlogPost.findById(req.params.id).populate('user');
      
      // Check if the blog post exists
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Render the blog post
      res.render("student/singleBlog", {user:req.user, blogPost });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;
