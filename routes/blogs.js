const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Blog = require('../models/Blog')
const User = require('../models/User')
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Notes using: GET "/api/blogs/fetchallblogs". Login required
router.get('/fetchallblogs', fetchuser, async (req, res) => {
    try {
        const blogs = await Blog.find({ user: req.user.id });
        res.json(blogs)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Add a new Note using: POST "/api/blogs/addblog". Login required
router.post('/addblog', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('content', 'Content must be atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {
            const { title, content, tag, imgUrl } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const blog = new Blog({
                title, content, tag, imgUrl, user: req.user.id, author: req.user.id
            })
            const savedBlog = await blog.save()

            const userId = req.user.id;
            const user = await User.findById(userId).select("-password")
            user.posts += 1;
            await user.save();

            res.json({ user, savedBlog });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })

// ROUTE 3: Update an existing Note using: PUT "/api/blogs/updateblog". Login required
router.put('/updateblog/:id', fetchuser, async (req, res) => {
    const { title, content, tag, imgUrl } = req.body; // Include imgUrl in the destructuring
    try {
        // Create a newBlog object
        const newBlog = {};
        if (title) { newBlog.title = title };
        if (content) { newBlog.content = content };
        if (tag) { newBlog.tag = tag };
        if (imgUrl) { newBlog.imgUrl = imgUrl };

        // Find the blog to be updated and update it
        let blog = await Blog.findById(req.params.id);
        if (!blog) { return res.status(404).send("Not Found") }

        if (blog.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        blog = await Blog.findByIdAndUpdate(req.params.id, { $set: newBlog }, { new: true }); // Correct variable name

        res.json(blog);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 4: Delete an existing Note using: DELETE "/api/blogs/deleteblog". Login required
router.delete('/deleteblog/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be delete and delete it
        let blog = await Blog.findById(req.params.id);
        if (!blog) { return res.status(404).send("Not Found") }

        // Allow deletion only if user owns this Note
        if (blog.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        blog = await Blog.findByIdAndDelete(req.params.id)

        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        user.posts -= 1;
        await user.save();

        res.json({ "Success": "Note has been deleted", blog: blog });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 5: Fetch all blogs: GET "/api/blogs/allblogs". Login not required
router.get('/allblogs', async (req, res) => {
    try {
        const blogs = await Blog.find(); // Fetch all blogs from the database
        res.json(blogs);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router