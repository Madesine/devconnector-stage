const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const config = require("config");
const request = require("request");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const authMiddleware = require("../../middlewares/auth");

// @route GET api/profile
// @desc Get all user profile
// @access Public
router.get("/", async (req, res) => {
	try {
		const profiles = await Profile.find().populate("user", ["name", "avatar"]);

		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// @route GET api/profile/user/:user_id
// @desc Get profile by user id
// @access Public
router.get("/user/:user_id", async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate("user", ["name", "avatar"]);

		if (!profile) {
			return res.status(404).json({ msg: "There is no profile for this user" });
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);

		if (err.kind === "ObjectId") {
			return res.status(404).json({ msg: "There is no profile for this user" });
		}

		res.status(500).send("Server error");
	}
});

// @route GET api/profile/me
// @desc Get user profile
// @access Private
router.get("/me", authMiddleware, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate("user", ["name", "avatar"]);

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
		authMiddleware,
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

// @route DELETE api/profile
// @desc Delete profile & user
// @access Private
router.delete("/", authMiddleware, async (req, res) => {
	try {
		await Profile.findOneAndDelete({ user: req.user.id });
		await User.findOneAndDelete({ _id: req.user.id });

		res.json({ msg: "User has been successfully deleted" });
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error");
	}
});

// @route PATCH api/profile/experience
// @desc Add profile experience
// @access Private
router.patch(
	"/experience",
	[
		authMiddleware,
		[
			check("title", "Title is required").not().isEmpty(),
			check("company", "Company is required").not().isEmpty(),
			check("from", "From date is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const newExp = ({
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		} = req.body);

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp);

			await profile.save();
			res.json(profile);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server error");
		}
	}
);

// @route DELETE api/profile/experience/:exp_id
// @desc Delete profile experience by id
// @access Private
router.delete("/experience/:exp_id", authMiddleware, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		const removeIndex = profile.experience.findIndex(
			(exp) => exp._id.toString() === req.params.exp_id
		);

		if (removeIndex === -1) {
			return res.status(404).json({ msg: "Experience not found" });
		}

		profile.experience.splice(removeIndex, 1);

		await profile.save();
		res.json(profile);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error");
	}
});

// @route PATCH api/profile/education
// @desc Add profile education
// @access Private
router.patch(
	"/education",
	[
		authMiddleware,
		[
			check("school", "School is required").not().isEmpty(),
			check("degree", "degree is required").not().isEmpty(),
			check("from", "From date is required").not().isEmpty(),
			check("fieldofstudy", "Field of study is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const newEdu = ({
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		} = req.body);

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.education.unshift(newEdu);

			await profile.save();
			res.json(profile);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server error");
		}
	}
);

// @route DELETE api/profile/education/:edu_id
// @desc Delete profile education by id
// @access Private
router.delete("/education/:edu_id", authMiddleware, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		const removeIndex = profile.education.findIndex(
			(edu) => edu._id.toString() === req.params.edu_id
		);

		if (removeIndex === -1) {
			return res.status(404).json({ msg: "Education not found" });
		}

		profile.education.splice(removeIndex, 1);

		await profile.save();
		res.json(profile);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error");
	}
});

// @route GET api/profile/github/:username
// @desc Get user repos from github
// @access Public
router.get("/github/:username", async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				"githubClientId"
			)}&client_secret=${config.get("githubSecret")}`,
			method: "GET",
			headers: {
				"user-agent": "node.js",
			},
		};

		request(options, (err, response, body) => {
			if (err) console.error(err);
			
			if (response.statusCode !== 200) {
				return res.status(400).json({ msg: "No github profile found" });
			}

			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error");
	}
});

module.exports = router;
