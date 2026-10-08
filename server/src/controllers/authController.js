const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Master bypass code and demo helper for interviews so candidates NEVER get stuck
const MASTER_BYPASS_OTP = process.env.DEMO_BYPASS_OTP || "123456";

const checkDemoMode = () => {
    return (
        process.env.NODE_ENV !== "production" ||
        process.env.ALLOW_DEMO_OTP === "true" ||
        !process.env.EMAIL_USER
    );
};

// Generate 6-digit numeric OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


// ==================== REGISTER ====================

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.trim();

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
        });

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const isDemo = checkDemoMode();

        if (existingUser) {
            // If already verified, reject
            if (existingUser.isVerified) {
                return res.status(400).json({
                    message: "Username or email already exists"
                });
            }

            // If user started signup previously but didn't verify, update their info
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUser.username = normalizedUsername;
            existingUser.password = hashedPassword;
            existingUser.otp = otp;
            existingUser.otpExpires = otpExpires;
            await existingUser.save();

            await sendEmail({
                email: normalizedEmail,
                otp,
                subject: "Loop - Verify your account",
                title: "Welcome to Loop!",
                message: "Use the following 6-digit OTP code to verify your email address:"
            });

            return res.status(200).json({
                message: "Verification OTP sent to your email",
                requiresOtp: true,
                email: normalizedEmail,
                demoOtp: isDemo ? otp : undefined
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new unverified user
        const user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            isVerified: false,
            otp,
            otpExpires
        });

        // Send OTP email
        await sendEmail({
            email: normalizedEmail,
            otp,
            subject: "Loop - Verify your account",
            title: "Welcome to Loop!",
            message: "Use the following 6-digit OTP code to verify your email address:"
        });

        res.status(201).json({
            message: "Verification OTP sent to your email",
            requiresOtp: true,
            email: user.email,
            demoOtp: isDemo ? otp : undefined
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==================== VERIFY SIGNUP OTP ====================

const verifySignupOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const submittedOtp = otp.toString().trim();
        const isDemo = checkDemoMode();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "No registration found with this email"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "Account is already verified. Please log in."
            });
        }

        // Interview safe check: matches stored OTP OR master demo bypass code
        const isMatch = (user.otp && user.otp === submittedOtp) || (isDemo && submittedOtp === MASTER_BYPASS_OTP);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid OTP code. Please check and try again."
            });
        }

        // Check expiration (unless using master bypass code in demo mode)
        if (submittedOtp !== MASTER_BYPASS_OTP && user.otpExpires && new Date() > user.otpExpires) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        // Mark verified and clear OTP
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        // Create JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Account verified successfully! Welcome to Loop.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==================== LOGIN ====================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Compare entered password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const isDemo = checkDemoMode();

        // Save OTP to user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        await sendEmail({
            email: user.email,
            otp,
            subject: "Loop - Login Verification Code",
            title: "Login Verification",
            message: "A sign-in request was received for your Loop account. Use the following 6-digit OTP to complete your login:"
        });

        res.status(200).json({
            message: "Verification OTP sent to your email",
            requiresOtp: true,
            email: user.email,
            demoOtp: isDemo ? otp : undefined
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==================== VERIFY LOGIN OTP ====================

const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const submittedOtp = otp.toString().trim();
        const isDemo = checkDemoMode();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Interview safe check: matches stored OTP OR master demo bypass code
        const isMatch = (user.otp && user.otp === submittedOtp) || (isDemo && submittedOtp === MASTER_BYPASS_OTP);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid OTP code. Please check and try again."
            });
        }

        // Check expiration (unless using master bypass code in demo mode)
        if (submittedOtp !== MASTER_BYPASS_OTP && user.otpExpires && new Date() > user.otpExpires) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        // Clear OTP and ensure user is verified
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        // Create JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==================== RESEND OTP ====================

const resendOtp = async (req, res) => {
    try {
        const { email, type } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "No user found with this email"
            });
        }

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const isDemo = checkDemoMode();

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const actionName = type === "signup" ? "Account Verification" : "Login Verification";

        await sendEmail({
            email: normalizedEmail,
            otp,
            subject: `Loop - ${actionName} Code (Resent)`,
            title: actionName,
            message: `Here is your new 6-digit OTP code to complete your ${type === "signup" ? "registration" : "login"}:`
        });

        res.status(200).json({
            message: "A new OTP code has been sent to your email",
            demoOtp: isDemo ? otp : undefined
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    registerUser,
    verifySignupOtp,
    loginUser,
    verifyLoginOtp,
    resendOtp
};