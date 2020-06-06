const express = require("express");
const router = express.Router();

// @route GET api/profile
// @desc Test
// @access Public
router.get("/", (req, res) => {
	res.send("Hello i'm GET 'api/profile'");
});

module.exports = router;
