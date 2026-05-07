const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables FIRST before requiring any files that use them
dotenv.config();
console.log("in index - ", process.env.MONGO_ATLAS_URI);

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const userRouter = require("./routes/authRoutes");
const dashboardRouter = require("./routes/userDashboardRoutes");
const paymentRouter = require("./routes/paymentRoute");
const adminRouter = require("./routes/adminRoutes");
const eventRouter = require("./routes/eventRoutes");
const venueRouter = require("./routes/venueRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const ticketRouter = require("./routes/ticketRoute");
const debugRouter = require("./routes/debugRoutes");
// const checkInRouter = require("./routes/checkInRoutes")

//database url
mongoose
    .connect(process.env.MONGO_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {})
    .catch((err) => {
        console.log(err);
    });

require("./models/otpAuth");
require("./models/user");
require("./models/admin");
require("./models/event");
require("./models/venue");

// Increase payload size limits for handling larger file uploads
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

app.use(cookieParser());

// Simplified and highly permissive CORS configuration
const corsOptions = {
    origin: true, // Allows any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Global middleware to ensure CORS headers are set for all responses
app.use((req, res, next) => {
    const origin = req.headers.origin || process.env.CLIENT_URL || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/", paymentRouter);
app.use("/user", userRouter);
app.use("/user", dashboardRouter);

app.use("/", adminRouter);
app.use("/", eventRouter);
app.use("/", venueRouter);
app.use("/upload", uploadRouter);
app.use("/debug", debugRouter);
app.use("/", ticketRouter);

app.get("/", (req, res) => {
    res.send("Event Management micro services API.");
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server Running on🚀: ${process.env.PORT}`);
});
