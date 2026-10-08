const express = require("express");

const {
    registerUser,
    verifySignupOtp,
    loginUser,
    verifyLoginOtp,
    resendOtp
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/login", loginUser);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/resend-otp", resendOtp);

module.exports = router;