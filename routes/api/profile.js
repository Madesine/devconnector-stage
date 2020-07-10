const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const authMiddlware = require("../../middlewares/auth");

// @route GET api/profile/me
// @desc Get user profile profile
// @access Private
router.get("/me", authMiddlware, async (req, res) => {
	try {
		const profile = await (
			await Profile.findOne({ user: req.user.id })
		).populate("user", ["name", "avatar"]);

		if (!profile) {
			return res.status(404).json({ msg: "There is no profile for this user" });
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});
// @route POST api/profile
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

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			linkedin,
			instagram,
		} = req.body;

		const profileFields = {};
		profileFields.user = req.user.id;

		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills.split(",").map((skill) => skill.trim());
		}

		profileFields.social = {};

		if (youtube) profileFields.social.youtube = youtube;
		if (facebook) profileFields.social.facebook = facebook;
		if (twitter) profileFields.social.twitter = twitter;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);

				return res.json(profile);
			}

			profile = new Profile(profileFields);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server error");
		}
	}
);

module.exports = router;
