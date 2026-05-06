const express = require("express");
const app = express();
const OtpAuth = require("../models/otpAuth");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const otpGenerator = require("otp-generator");

const { sendSMS } = require("./smsController");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
console.log("in auth - ", JWT_SECRET);

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// route - http://localhost:5000/user/signin
const signIn = async (req, res) => {
    try {
        const Email = req.body.email;
        const docs = await User.find({ email: Email });
        
        if (docs.length !== 0) {
            // clearing otp auth table
            await OtpAuth.deleteMany({ email: Email });
            console.log("Users deleted successfully");

            // generate otp for new user
            const OTP = otpGenerator.generate(6, {
                digits: true,
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
            });

            const otp = {
                email: Email,
                otp: OTP,
            };

            sendSMS(Email, otp.otp);
            console.log("Generated otp for signin: ", otp);

            // encrypting the otp and then saving to Otp_table
            const salt = await bcrypt.genSalt(10);
            const hashedOtp = await bcrypt.hash(otp.otp, salt);

            const newUserLogin = new OtpAuth({
                email: otp.email,
                otp: hashedOtp,
            });

            await newUserLogin.save();
            console.log("Saved::otp-temporarily::ready for validation");

            return res.status(200).send({ msg: "Otp sent successfully!" });
        } else {
            return res.status(400).send({
                msg: "This Email ID is not registered. Try Signing Up instead!",
            });
        }
    } catch (error) {
        console.error("Error in signIn:", error);
        res.status(500).send({ msg: "Server error during sign in" });
    }
};

// route - http://localhost:5000/user/signup
const signUp = async (req, res) => {
    try {
        const Email = req.body.email;
        const docs = await User.find({ email: Email });

        if (docs.length !== 0) {
            return res.status(400).send({
                msg: "This Email ID is already registered. Try Signing In instead!",
            });
        } else {
            // clearing otp auth table
            await OtpAuth.deleteMany({ email: Email });
            console.log("Users deleted successfully");

            // generate otp for new user
            const OTP = otpGenerator.generate(6, {
                digits: true,
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
            });

            const otp = {
                email: Email,
                otp: OTP,
            };
            console.log("Before hashing: ", otp);

            sendSMS(Email, otp.otp);

            // encrypting the otp and then saving to Otp_table
            const salt = await bcrypt.genSalt(10);
            const hashedOtp = await bcrypt.hash(otp.otp, salt);

            const newUserLogin = new OtpAuth({
                email: otp.email,
                otp: hashedOtp,
            });

            await newUserLogin.save();
            console.log("Saved::otp::ready for validation");

            return res.status(200).send({ msg: "Otp sent successfully!" });
        }
    } catch (error) {
        console.error("Error in signUp:", error);
        res.status(500).send({ msg: "Server error during sign up" });
    }
};

// route - http://localhost:5000/user/signin/verify
const verifyLogin = async (req, res) => {
    try {
        const Email = req.body.email;
        const inputOtp = req.body.otp;

        const docs = await OtpAuth.find({ email: Email });
        
        if (docs.length === 0) {
            return res.status(400).send({ msg: "The OTP expired. Please try again!" });
        } else {
            const generatedOtp = docs[0].otp;
            const validUser = await bcrypt.compare(inputOtp, generatedOtp);

            if (Email === docs[0].email && validUser) {
                const user = await User.find({ email: Email });
                res.status(200).send({
                    msg: "Sign-In successful!",
                    user_id: user[0].user_token,
                });
            } else {
                return res.status(406).send({ msg: "OTP does not match. Please try again!" });
            }
        }
    } catch (error) {
        console.error("Error in verifyLogin:", error);
        res.status(500).send({ msg: "Server error during verification" });
    }
};

// route - http://localhost:5000/user/signup/verify
const verifyOtp = async (req, res) => {
    try {
        const number = req.body.contactNumber;
        const inputOtp = req.body.otp;
        const Email = req.body.email;
        const name = req.body.username;
        const regNumber = req.body.regNumber;

        const docs = await OtpAuth.find({ email: Email });
        
        if (docs.length === 0) {
            return res.status(400).send("The OTP expired. Please try again!");
        } else {
            const generatedOtp = docs[0].otp;
            const validUser = await bcrypt.compare(inputOtp, generatedOtp);

            if (Email === docs[0].email && validUser) {
                const secret = JWT_SECRET;
                const payload = { email: Email };
                const token = jwt.sign(payload, secret);

                // saving new user
                const newUser = new User({
                    user_token: token,
                    reg_number: regNumber,
                    username: name,
                    email: Email,
                    contactNumber: number,
                });

                await newUser.save();
                console.log("Signup successful: ", newUser);

                await OtpAuth.deleteMany({ email: Email });
                console.log(`OTP table for ${Email} cleared.`);

                return res.status(200).send({
                    msg: "Account creation successful!",
                    user_id: token,
                });
            } else {
                return res.status(400).send({ msg: "OTP does not match. Please try again!" });
            }
        }
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).send({ msg: "Server error during verification" });
    }
};

module.exports = {
    signUp,
    verifyOtp,
    signIn,
    verifyLogin,
};
