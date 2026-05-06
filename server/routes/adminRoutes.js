const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
    setAdmin,
    adminAuth,
    adminDetails,
} = require("../controllers/adminController");

// Configure CORS specifically for admin routes
const corsOptions = {
    origin: ['https://eventxmanagement.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Handle OPTIONS requests explicitly for each route
router.options("/admin/auth", cors(corsOptions), (req, res) => {
    res.status(200).end();
});

router.options("/admin/details", cors(corsOptions), (req, res) => {
    res.status(200).end();
});

router.route("/setadmin").post(cors(corsOptions), setAdmin);
router.route("/admin/auth").post(cors(corsOptions), adminAuth);
router.route("/admin/details").post(cors(corsOptions), adminDetails);

module.exports = router;
