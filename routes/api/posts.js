const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Post = require("../../models/Post");
const authMiddleware = require("../../middlewares/auth");

// @route POST api/posts
// @desc Create a post
// @access Private
router.post(
	"/",
	[authMiddleware, check("text", "Text is required").not().isEmpty()],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select("-password");

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			await newPost.save();
			res.status(201).json(newPost);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server error");
		}
	}
);

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get("/", authMiddleware, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });

		res.json(posts);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error");
	}
});

// @route GET api/posts/:id
// @desc Get a post by id
// @access Private
router.get("/:id", authMiddleware, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}

		res.json(post);
	} catch (err) {
		console.error(err.message);

		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}

		res.status(500).send("Server error");
	}
});

// @route DELETE api/posts/:id
// @desc Delete a post by id
// @access Private
router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}

		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: "User not authorized" });
		}

		await post.remove();
		res.json({ msg: "Post has been successfully deleted" });
	} catch (err) {
		console.error(err.message);

		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}

		res.status(500).send("Server error");
	}
});

// @route PATCH api/posts/like/:id
// @desc Like post
// @access Private
router.patch("/like/:id", authMiddleware, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}

		if (
			post.likes.filter((like) => like.user.toString() === req.user.id).length >
			0
		) {
			return res.status(400).json({ msg: "Post has been already liked" });
		}

		post.likes.push({ user: req.user.id });

		await post.save();
		res.json(post.likes);
	} catch (err) {
		console.error(err.message);

		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}

		res.status(500).send("Server error");
	}
});

// @route PATCH api/posts/unlike/:id
// @desc Like post
// @access Private
router.patch("/unlike/:id", authMiddleware, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}

		if (
			post.likes.filter((like) => like.user.toString() === req.user.id)
				.length === 0
		) {
			return res.status(400).json({ msg: "Post hasn't been already liked" });
		}

		const removeIndex = post.likes.findIndex(
			(like) => like.user.toString() === req.user.id
		);

		post.likes.splice(removeIndex, 1);

		await post.save();
		res.json(post.likes);
	} catch (err) {
		console.error(err.message);

		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}

		res.status(500).send("Server error");
	}
});

// @route PATCH api/posts/comment/:id
// @desc Comment to a post
// @access Private
router.patch(
	"/comment/:id",
	[authMiddleware, check("text", "Text is required").not().isEmpty()],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select("-password");
			const post = await Post.findById(req.params.id);

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			post.comments.unshift(newComment);

			await post.save();
			res.json(post.comments);
		} catch (err) {
			console.error(err.message);

			if (err.kind === "ObjectId") {
				return res.status(404).json({ msg: "Post not found" });
			}

			res.status(500).send("Server error");
		}
	}
);

// @route PATCH api/posts/comment/:id/:comment_id
// @desc Delete a comment
// @access Private
router.patch("/comment/:id/:comment_id", authMiddleware, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: "Post not found" });
		}

		const comment = post.comments.find(
			(comment) => comment.id === req.params.comment_id
		);

		if (!comment) {
			return res.status(404).json({ msg: "Comment doesn't exist" });
		}

		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: "User no authorized" });
		}

		const removeIndex = post.comments.findIndex(
			(comment) => comment.user.toString() === req.user.id
		);

		post.comments.splice(removeIndex, 1);

		await post.save();
		res.json(post.comments);
	} catch (err) {
		console.error(err.message);

		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "Post not found" });
		}

		res.status(500).send("Server error");
	}
});

module.exports = router;
