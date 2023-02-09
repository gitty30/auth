const express = require("express");
const router = express.Router();

const { signup, login, verify, getUser,refreshToken } = require("../controllers/auth");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/user").get(verify, getUser);
router.get("/refresh", refreshToken, verify, getUser);
module.exports = router;
