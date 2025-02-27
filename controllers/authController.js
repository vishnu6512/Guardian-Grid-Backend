const User = require("../models/requestModel");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const VERIFY_SERVICE_ID = process.env.TWILIO_VERIFY_SERVICE_ID;

// Phone number validation regex
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const OTP_EXPIRY = process.env.OTP_EXPIRY || 300000; // 5 minutes default

exports.sendOTP = async (req, res) => {
    const { name, email, phone, location } = req.body;

    // Input validation
    if (!name || !email || !phone || !location) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (!PHONE_REGEX.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number format. Please use international format (e.g., +1234567890)" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    try {
        // Check for existing recent verification
        const existingUser = await User.findOne({ phone });
        if (existingUser && existingUser.otpExpires > Date.now()) {
            return res.status(429).json({ 
                error: "Please wait before requesting another verification",
                retryAfter: Math.ceil((existingUser.otpExpires - Date.now()) / 1000)
            });
        }

        // Send verification using Twilio Verify
        const verification = await client.verify.v2
            .services(VERIFY_SERVICE_ID)
            .verifications
            .create({ to: phone, channel: 'sms' });

        // Update or create user
        await User.findOneAndUpdate(
            { phone },
            { 
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone,
                location: location.trim(),
                otpExpires: Date.now() + OTP_EXPIRY
            },
            { upsert: true }
        );

        res.status(200).json({ message: "Verification code sent successfully!" });
    } catch (error) {
        console.error('Error in sendOTP:', error);
        if (error.code === 60200) {
            return res.status(400).json({ error: "Invalid phone number" });
        }
        res.status(500).json({ error: "Failed to send verification code. Please try again later." });
    }
};

exports.verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ error: "Phone number and verification code are required" });
    }

    if (!PHONE_REGEX.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number format" });
    }

    try {
        // Verify the code using Twilio Verify
        const verificationCheck = await client.verify.v2
            .services(VERIFY_SERVICE_ID)
            .verificationChecks
            .create({ to: phone, code: otp });

        if (verificationCheck.status === 'approved') {
            // Update user verification status
            await User.findOneAndUpdate(
                { phone },
                { 
                    otpExpires: null,
                    isVerified: true
                }
            );

            res.status(200).json({ message: "Phone number verified successfully!" });
        } else {
            res.status(400).json({ error: "Invalid verification code" });
        }
    } catch (error) {
        console.error('Error in verifyOTP:', error);
        res.status(500).json({ error: "Verification failed. Please try again." });
    }
};
