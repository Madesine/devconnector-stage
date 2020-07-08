const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const authMiddlware = require("../../middlewares/auth");

// @route Post api/profile
// @desc Create or update profile
// @access Private
router.post(
	"/",
	[
		authMiddlware,
		[
			check("status", "Status is required").not().isEmpty(),
			check("skills", "Skills are required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		console.log(req.body);
	}
);

module.exports = router;
