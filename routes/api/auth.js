const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const authMiddlware = require("../../middlewares/auth");

// @route GET api/auth
// @desc Get user
// @access Private
router.get("/", authMiddlware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json({ user });
	} catch (err) {
		console.err(err.message);
		res.status(500).send("Server error");
	}
});

module.exports = router;
