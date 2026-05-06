const { Event } = require("../models/event");
const { Venue } = require("../models/venue");
const Admin = require("../models/admin");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const nodemailer = require("nodemailer");

function sendCheckInMail(data) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODE_MAILER_USER,
            pass: process.env.NODE_MAILER_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    let mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: data.email,
        subject: `Check-in Confirmed - EventX`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
                
                .email-wrapper {
                    max-width: 600px;
                    margin: 30px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
                }
                
                .email-header {
                    background: linear-gradient(135deg, #11cb8d 0%, #25c3fc 100%);
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .email-header .logo {
                    color: white;
                    font-weight: 700;
                    font-size: 32px;
                    letter-spacing: 1px;
                    margin-bottom: 5px;
                }
                
                .email-header h1 {
                    color: white;
                    font-size: 24px;
                    font-weight: 500;
                    margin: 0;
                }
                
                .email-body {
                    padding: 30px;
                }
                
                .greeting {
                    font-size: 18px;
                    margin-bottom: 15px;
                }
                
                .message {
                    margin-bottom: 25px;
                    color: #555;
                }
                
                .success-box {
                    background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
                    border-radius: 12px;
                    padding: 30px;
                    color: white;
                    text-align: center;
                    margin: 25px 0;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 176, 155, 0.2);
                }
                
                .success-content {
                    position: relative;
                    z-index: 1;
                }
                
                .success-icon {
                    width: 80px;
                    height: 80px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 40px;
                }
                
                .success-box h2 {
                    margin: 0 0 10px;
                    font-weight: 600;
                    font-size: 24px;
                }
                
                .success-box p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 16px;
                }
                
                .details-card {
                    background-color: #f8f9fa;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 5px solid #11cb8d;
                }
                
                .details-card h3 {
                    color: #333;
                    font-size: 18px;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px dashed #eee;
                }
                
                .detail-row:last-child {
                    border-bottom: none;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #555;
                }
                
                .detail-value {
                    color: #333;
                    text-align: right;
                }
                
                .note-box {
                    background-color: #fff8e1;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 25px 0;
                    border-radius: 4px;
                }
                
                .note-box p {
                    color: #856404;
                    margin: 0;
                }
                
                .help-box {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 25px;
                }
                
                .help-box h3 {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 10px;
                }
                
                .help-box p {
                    font-size: 14px;
                    color: #666;
                    margin: 5px 0;
                }
                
                .email-footer {
                    background-color: #f8f9fa;
                    text-align: center;
                    padding: 20px;
                    border-top: 1px solid #eeeeee;
                    font-size: 12px;
                    color: #777777;
                }
                
                .social-links {
                    margin: 15px 0;
                }
                
                .social-links a {
                    display: inline-block;
                    margin: 0 5px;
                    color: #11cb8d;
                    text-decoration: none;
                }
                
                @media only screen and (max-width: 600px) {
                    .email-wrapper {
                        margin: 10px;
                        width: calc(100% - 20px);
                    }
                    
                    .email-body {
                        padding: 20px;
                    }
                    
                    .detail-row {
                        flex-direction: column;
                        padding: 8px 0;
                    }
                    
                    .detail-value {
                        text-align: left;
                        margin-top: 5px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="email-header">
                    <div class="logo">EventX</div>
                    <h1>Check-in Confirmed</h1>
                </div>
                
                <div class="email-body">
                    <p class="greeting">Dear ${data.name},</p>
                    <p class="message">We're pleased to confirm that you have successfully checked in to <strong>${data.event}</strong>!</p>
                    
                    <div class="success-box">
                        <div class="success-content">
                            <div class="success-icon">✓</div>
                            <h2>Check-in Successful</h2>
                            <p>Thank you for attending our event!</p>
                        </div>
                    </div>
                    
                    <div class="details-card">
                        <h3>Your Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Name</span>
                            <span class="detail-value">${data.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Registration Number</span>
                            <span class="detail-value">${data.regNo}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Event</span>
                            <span class="detail-value">${data.event}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Check-in Time</span>
                            <span class="detail-value">${new Date().toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="note-box">
                        <p>We hope you enjoy the event. If you need any assistance, please approach any of our staff members wearing EventX badges.</p>
                    </div>
                    
                    <div class="help-box">
                        <h3>Need assistance?</h3>
                        <p>Email: <a href="mailto:support@eventx.com">support@eventx.com</a></p>
                        <p>Website: <a href="https://eventx.com">eventx.com</a></p>
                    </div>
                </div>
                
                <div class="email-footer">
                    <div class="social-links">
                        <a href="#">Facebook</a> • 
                        <a href="#">Twitter</a> • 
                        <a href="#">Instagram</a>
                    </div>
                    <p>&copy; ${new Date().getFullYear()} EventX. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        `,
    };

    transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
            console.log(err);
        } else {
            console.log("Checked In Email sent successfully");
        }
    });
}

// Helper function to check for venue conflicts
const checkVenueConflict = async (venue, date, time) => {
    try {
        console.log(`Checking venue conflicts for: ${venue}, ${date}, ${time}`);
        
        if (!venue || !date || !time) {
            console.log('Missing parameters for venue conflict check');
            return { conflict: false };
        }
        
        // Parse the incoming date and time
        let eventStartTime;
        try {
            // Try to handle different date formats (DD/MM/YYYY or MM/DD/YYYY)
            let day, month, year;
            
            if (date.includes('/')) {
                const dateParts = date.split('/');
                if (dateParts.length === 3) {
                    // Assuming DD/MM/YYYY format
                    day = parseInt(dateParts[0]);
                    month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS Date
                    year = parseInt(dateParts[2]);
                    if (year < 100) year += 2000; // Handle two-digit years
                }
            } else if (date.includes('-')) {
                const dateParts = date.split('-');
                if (dateParts.length === 3) {
                    // Assuming YYYY-MM-DD format
                    year = parseInt(dateParts[0]);
                    month = parseInt(dateParts[1]) - 1;
                    day = parseInt(dateParts[2]);
                }
            }
            
            // Parse time
            let hours = 0, minutes = 0;
            if (time.includes(':')) {
                const timeParts = time.split(':');
                hours = parseInt(timeParts[0]);
                if (timeParts[1]) {
                    // Handle minutes and AM/PM
                    const minutesPart = timeParts[1].replace(/\s*[APap][Mm].*$/, '');
                    minutes = parseInt(minutesPart);
                    
                    // Handle AM/PM
                    if (time.toLowerCase().includes('pm') && hours < 12) {
                        hours += 12;
                    } else if (time.toLowerCase().includes('am') && hours === 12) {
                        hours = 0;
                    }
                }
            }
            
            // Create event start time
            eventStartTime = new Date(year, month, day, hours, minutes);
            console.log(`Parsed event time: ${eventStartTime}`);
        } catch (error) {
            console.error('Error parsing date/time:', error);
            return { conflict: false }; // Skip conflict check if date parsing fails
        }
        
        // Create event end time (assuming events are 2 hours long by default)
        const eventEndTime = new Date(eventStartTime);
        eventEndTime.setHours(eventEndTime.getHours() + 2);
        
        // Find all events at the same venue
        const eventsAtVenue = await Event.find({ venue: venue });
        console.log(`Found ${eventsAtVenue.length} events at venue ${venue}`);
        
        // Check for conflicts
        for (const existingEvent of eventsAtVenue) {
            try {
                console.log(`Checking conflict with: ${existingEvent.name}, ${existingEvent.date}, ${existingEvent.time}`);
                
                // Parse existing event date and time
                let existingStartTime;
                try {
                    let eDay, eMonth, eYear;
                    
                    if (existingEvent.date.includes('/')) {
                        const dateParts = existingEvent.date.split('/');
                        if (dateParts.length === 3) {
                            eDay = parseInt(dateParts[0]);
                            eMonth = parseInt(dateParts[1]) - 1;
                            eYear = parseInt(dateParts[2]);
                            if (eYear < 100) eYear += 2000;
                        }
                    } else if (existingEvent.date.includes('-')) {
                        const dateParts = existingEvent.date.split('-');
                        if (dateParts.length === 3) {
                            eYear = parseInt(dateParts[0]);
                            eMonth = parseInt(dateParts[1]) - 1;
                            eDay = parseInt(dateParts[2]);
                        }
                    }
                    
                    // Parse time
                    let eHours = 0, eMinutes = 0;
                    if (existingEvent.time.includes(':')) {
                        const timeParts = existingEvent.time.split(':');
                        eHours = parseInt(timeParts[0]);
                        if (timeParts[1]) {
                            const minutesPart = timeParts[1].replace(/\s*[APap][Mm].*$/, '');
                            eMinutes = parseInt(minutesPart);
                            
                            // Handle AM/PM
                            if (existingEvent.time.toLowerCase().includes('pm') && eHours < 12) {
                                eHours += 12;
                            } else if (existingEvent.time.toLowerCase().includes('am') && eHours === 12) {
                                eHours = 0;
                            }
                        }
                    }
                    
                    existingStartTime = new Date(eYear, eMonth, eDay, eHours, eMinutes);
                    console.log(`Parsed existing event time: ${existingStartTime}`);
                } catch (parseError) {
                    console.error('Error parsing existing event date/time:', parseError);
                    continue; // Skip this event if date parsing fails
                }
                
                // Create existing event end time
                const existingEndTime = new Date(existingStartTime);
                if (existingEvent.end_time) {
                    // If end time is specified, use it
                    try {
                        let endHours = 0, endMinutes = 0;
                        if (existingEvent.end_time.includes(':')) {
                            const timeParts = existingEvent.end_time.split(':');
                            endHours = parseInt(timeParts[0]);
                            if (timeParts[1]) {
                                const minutesPart = timeParts[1].replace(/\s*[APap][Mm].*$/, '');
                                endMinutes = parseInt(minutesPart);
                                
                                // Handle AM/PM
                                if (existingEvent.end_time.toLowerCase().includes('pm') && endHours < 12) {
                                    endHours += 12;
                                } else if (existingEvent.end_time.toLowerCase().includes('am') && endHours === 12) {
                                    endHours = 0;
                                }
                            }
                        }
                        existingEndTime.setHours(endHours, endMinutes);
                    } catch (endTimeError) {
                        // If parsing end time fails, default to 2 hours
                        existingEndTime.setHours(existingEndTime.getHours() + 2);
                    }
                } else {
                    // Default to 2 hours if no end time
                    existingEndTime.setHours(existingEndTime.getHours() + 2);
                }
                
                // Check if there's an overlap
                if (
                    (eventStartTime >= existingStartTime && eventStartTime < existingEndTime) ||
                    (eventEndTime > existingStartTime && eventEndTime <= existingEndTime) ||
                    (eventStartTime <= existingStartTime && eventEndTime >= existingEndTime)
                ) {
                    console.log(`Conflict detected with event: ${existingEvent.name}`);
                    return {
                        conflict: true,
                        conflictingEvent: existingEvent
                    };
                }
            } catch (eventCheckError) {
                console.error('Error checking event conflict:', eventCheckError);
                continue; // Skip this event if checking fails
            }
        }
        
        // No conflicts found
        return { conflict: false };
    } catch (error) {
        console.error('Error in checkVenueConflict:', error);
        return { conflict: false }; // Default to no conflict on error
    }
};

const postEvent = async (req, res) => {
    try {
        console.log("Event creation request received:", req.body);
        
        const Name = req.body.name;
        const VenueName = req.body.venue;
        const VenueId = req.body.venue_id;
        const EventDate = req.body.date;
        const Time = req.body.time;
        const Desc = req.body.description;
        const Price = req.body.price;
        const Profile = req.body.profile;
        const Cover = req.body.cover;
        const Organizer = req.body.organizer;
        const Images = req.body.images || [];
        const EndTime = req.body.end_time || '';

        const adminId = req.body.admin_id;
        console.log("Admin creating event: ", adminId);
        
        if (!Name || !VenueName || !EventDate || !Time || !Organizer) {
            console.error("Missing required fields:", { Name, VenueName, EventDate, Time, Organizer });
            return res.status(400).json({ 
                msg: "Missing required fields", 
                required: ["name", "venue", "date", "time", "organizer"] 
            });
        }

        // Check for venue conflicts
        const conflictCheck = await checkVenueConflict(VenueName, EventDate, Time);
        if (conflictCheck && conflictCheck.conflict) {
            return res.status(409).json({ 
                msg: "Venue scheduling conflict detected", 
                conflictingEvent: {
                    name: conflictCheck.conflictingEvent.name,
                    date: conflictCheck.conflictingEvent.date,
                    time: conflictCheck.conflictingEvent.time,
                    venue: conflictCheck.conflictingEvent.venue
                }
            });
        }

        // Generate a unique ID for the event
        const secret = JWT_SECRET;
        const payload = {
            name: Name,
            timestamp: new Date().getTime()
        };
        const token = await jwt.sign(payload, secret);

        // Create the new event with all required fields
        const new_event = new Event({
            event_id: token,
            name: Name,
            venue: VenueName,
            date: EventDate,
            time: Time,
            description: Desc,
            price: Price || 0,
            profile: Profile || 'https://i.etsystatic.com/15907303/r/il/c8acad/1940223106/il_794xN.1940223106_9tfg.jpg',
            cover: Cover || 'https://eventplanning24x7.files.wordpress.com/2018/04/events.png',
            organizer: Organizer,
            images: Images,
            participants: [],
            admin_id: adminId,
            end_time: EndTime
        });

        console.log("Saving new event:", {
            id: token,
            name: Name,
            venue: VenueName,
            date: EventDate,
            time: Time
        });

        // Save the event to the database
        const savedEvent = await new_event.save();
        console.log("Admin event created successfully:", savedEvent.event_id);
        
        // Verify the event was saved
        const verifyEvent = await Event.findOne({ event_id: token });
        if (!verifyEvent) {
            console.error('Event was not found after saving!');
            return res.status(500).json({ msg: "Error verifying event creation" });
        }

        // Update the admin's record with the new event
        try {
            await Admin.updateOne(
                { admin_id: adminId },
                {
                    $push: {
                        eventCreated: {
                            event_id: token,
                            name: Name,
                            venue: VenueName,
                            date: EventDate,
                            time: Time,
                            description: Desc,
                            price: Price || 0,
                            profile: Profile || "https://i.etsystatic.com/15907303/r/il/c8acad/1940223106/il_794xN.1940223106_9tfg.jpg",
                            cover: Cover || "https://eventplanning24x7.files.wordpress.com/2018/04/events.png",
                            organizer: Organizer,
                            images: Images
                        },
                    },
                }
            );
            console.log("Admin::eventCreated::updated");
        } catch (error) {
            console.error("Error updating admin record:", error);
            // Continue even if admin update fails
        }

        // Update venue bookings if a venue is specified
        if (VenueName) {
            try {
                console.log(`Attempting to update venue bookings for event: ${Name}, venue: ${VenueName}`);
                
                // Direct database update using venue name - more reliable than ID lookup
                const updateResult = await Venue.findOneAndUpdate(
                    { name: VenueName }, // Find by name which is more reliable
                    { 
                        $push: { // Use $push instead of $addToSet to ensure it's always added
                            bookings: {
                                event_id: token,
                                event_name: Name,
                                date: EventDate,
                                start_time: Time,
                                end_time: EndTime || '',
                                status: 'confirmed'
                            }
                        }
                    },
                    { new: true } // Return the updated document
                );
                
                if (updateResult) {
                    console.log(`Successfully updated venue bookings. New booking count: ${updateResult.bookings.length}`);
                    console.log(`Bookings for ${VenueName}:`, updateResult.bookings.map(b => b.event_name));
                } else {
                    console.error(`Failed to update venue bookings. Venue not found: ${VenueName}`);
                    
                    // Fallback: try to find by venue_id if name lookup failed
                    if (VenueId) {
                        const venueByIdResult = await Venue.findOneAndUpdate(
                            { venue_id: VenueId },
                            { 
                                $push: {
                                    bookings: {
                                        event_id: token,
                                        event_name: Name,
                                        date: EventDate,
                                        start_time: Time,
                                        end_time: EndTime || '',
                                        status: 'confirmed'
                                    }
                                }
                            },
                            { new: true }
                        );
                        
                        if (venueByIdResult) {
                            console.log(`Successfully updated venue bookings using venue_id. New booking count: ${venueByIdResult.bookings.length}`);
                        } else {
                            console.error(`Failed to update venue bookings using venue_id. Venue not found with ID: ${VenueId}`);
                        }
                    }
                }
            } catch (venueError) {
                console.error("Error updating venue bookings:", venueError);
                // Continue even if venue update fails
            }
        }

        // Return success response
        return res.status(200).json({ 
            msg: "Event Created Successfully",
            event: {
                event_id: token,
                name: Name
            }
        });
    } catch (error) {
        console.error("Error in postEvent:", error);
        return res.status(500).json({ 
            msg: "Error creating event", 
            error: error.message 
        });
    }
};

const allEvents = async (req, res) => {
    try {
        console.log('allEvents function called - retrieving all events');
        
        // Explicitly count events in the database
        const count = await Event.countDocuments();
        console.log(`Total events in database: ${count}`);
        
        // Get all events with no filters
        const events = await Event.find({});
        
        // Log each event to verify they're being retrieved correctly
        console.log('All events retrieved:');
        events.forEach(event => {
            console.log({
                id: event.event_id,
                name: event.name,
                admin_id: event.admin_id || 'not set',
                venue: event.venue
            });
        });
        
        console.log(`Retrieved ${events.length} events from database`);
        
        // Return the events as plain objects
        return res.status(200).json(events.map(event => event.toObject()));
    } catch (error) {
        console.error('Error fetching all events:', error);
        return res.status(500).json({ 
            msg: "Error fetching events", 
            error: error.message 
        });
    }
};

const particularEvent = async (req, res) => {
    const eventId = req.body.event_id;
    Event.find({ event_id: eventId })
        .then((data) => {
            res.status(200).send(data[0]);
        })
        .catch((err) => {
            res.status(400).send({ msg: "Error fetching event", error: err });
        });
};

const deleteEvent = async (req, res) => {
    const eventId = req.body.event_id;
    const adminId = req.body.admin_id;

    Event.deleteOne({ event_id: eventId }, function (err) {
        if (err) return handleError(err);
        else {
            console.log("Event deleted::events collection.");
        }
    });

    Admin.updateOne(
        { admin_id: adminId },
        { $pull: { eventCreated: { event_id: eventId } } },
        function (err) {
            if (err) return handleError(err);
            else {
                console.log("Event deleted::admin collection.");
            }
        }
    );
    res.status(200).send({ msg: "success" });
};

const checkin = async (req, res) => {
    const eventId = req.body.event_id;
    const userList = req.body.checkInList;

    let eventName = "";

    Event.find({ event_id: eventId })
        .then((data) => {
            eventName = data[0].name;
            console.log(eventName);
        })
        .catch((err) => {
            res.status(400).send({ msg: "Error fetching event", error: err });
        });

    for (let i = 0; i < userList.length; i++) {
        Event.updateOne(
            { event_id: eventId, "participants.id": userList[i] },
            { $set: { "participants.$.entry": true } },
            function (err) {
                if (err) return handleError(err);
                else {
                    console.log(`user :: checked-in`);
                }
            }
        );
    }

    for (let i = 0; i < userList.length; i++) {
        User.find({ user_token: userList[i] })
            .then((data) => {
                const data_obj = {
                    name: data[0].username,
                    regNo: data[0].reg_number,
                    email: data[0].email,
                    number: data[0].contactNumber,
                    event: eventName,
                };

                sendCheckInMail(data_obj);
            })
            .catch((err) => {
                // console.log({ msg: "Error fetching event", error: err });
            });
    }

    res.status(200).send({ msg: "success" });
};

module.exports = {
    postEvent,
    allEvents,
    particularEvent,
    deleteEvent,
    checkin,
};
