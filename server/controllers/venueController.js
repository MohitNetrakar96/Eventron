const { Venue } = require("../models/venue");
const Admin = require("../models/admin");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Create a new venue
const createVenue = async (req, res) => {
    const { name, location, capacity, description, facilities, image, admin_id } = req.body;

    // Validate admin
    try {
        const admin = await Admin.findOne({ admin_id });
        if (!admin) {
            return res.status(401).send({ msg: "Unauthorized. Admin not found." });
        }

        // Generate venue_id
        const secret = JWT_SECRET;
        const payload = {
            name,
            timestamp: Date.now(),
        };
        const venue_id = await jwt.sign(payload, secret);

        // Create new venue
        const newVenue = new Venue({
            venue_id,
            name,
            location,
            capacity,
            description,
            facilities: facilities || [],
            image: image || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1469&auto=format&fit=crop",
            created_by: admin_id,
            bookings: [],
        });

        await newVenue.save();
        res.status(201).send({ 
            msg: "Venue created successfully", 
            venue_id,
            venue: newVenue
        });
    } catch (error) {
        console.error("Error creating venue:", error);
        res.status(500).send({ msg: "Server error", error: error.message });
    }
};

// Get all venues
const getAllVenues = async (req, res) => {
    try {
        const venues = await Venue.find({});
        res.status(200).send(venues);
    } catch (error) {
        console.error("Error fetching venues:", error);
        res.status(500).send({ msg: "Server error", error: error.message });
    }
};

// Get venue by ID
const getVenueById = async (req, res) => {
    const { venue_id } = req.params;
    
    try {
        const venue = await Venue.findOne({ venue_id });
        if (!venue) {
            return res.status(404).send({ msg: "Venue not found" });
        }
        res.status(200).send(venue);
    } catch (error) {
        console.error("Error fetching venue:", error);
        res.status(500).send({ msg: "Server error", error: error.message });
    }
};

// Update venue
const updateVenue = async (req, res) => {
    const { venue_id } = req.params;
    const { name, location, capacity, description, facilities, image, availability, admin_id } = req.body;
    
    try {
        // Validate admin
        const admin = await Admin.findOne({ admin_id });
        if (!admin) {
            return res.status(401).send({ msg: "Unauthorized. Admin not found." });
        }
        
        const venue = await Venue.findOne({ venue_id });
        if (!venue) {
            return res.status(404).send({ msg: "Venue not found" });
        }
        
        // Update venue fields
        if (name) venue.name = name;
        if (location) venue.location = location;
        if (capacity) venue.capacity = capacity;
        if (description) venue.description = description;
        if (facilities) venue.facilities = facilities;
        if (image) venue.image = image;
        if (availability !== undefined) venue.availability = availability;
        
        await venue.save();
        res.status(200).send({ msg: "Venue updated successfully", venue });
    } catch (error) {
        console.error("Error updating venue:", error);
        res.status(500).send({ msg: "Server error", error: error.message });
    }
};

// Delete venue
const deleteVenue = async (req, res) => {
    const { venue_id } = req.params;
    const { admin_id } = req.body;
    
    try {
        // Validate admin
        const admin = await Admin.findOne({ admin_id });
        if (!admin) {
            return res.status(401).send({ msg: "Unauthorized. Admin not found." });
        }
        
        const venue = await Venue.findOne({ venue_id });
        if (!venue) {
            return res.status(404).send({ msg: "Venue not found" });
        }
        
        // Check if venue has bookings
        if (venue.bookings && venue.bookings.length > 0) {
            return res.status(400).send({ 
                msg: "Cannot delete venue with existing bookings. Cancel all bookings first." 
            });
        }
        
        await Venue.deleteOne({ venue_id });
        res.status(200).send({ msg: "Venue deleted successfully" });
    } catch (error) {
        console.error("Error deleting venue:", error);
        res.status(500).send({ msg: "Server error", error: error.message });
    }
};

// Check venue availability
const checkVenueAvailability = async (req, res) => {
    const { venue_id, date, start_time, end_time } = req.body;
    
    try {
        const venue = await Venue.findOne({ venue_id });
        if (!venue) {
            return res.status(404).send({ msg: "Venue not found" });
        }
        
        // Check if venue is generally available
        if (!venue.availability) {
            return res.status(409).send({ 
                msg: "Venue is not available for booking",
                available: false
            });
        }
        
        // Check for booking conflicts
        const hasConflict = venue.bookings.some(booking => {
            if (booking.date !== date) return false;
            
            // Parse times
            const bookingStart = parseTimeToMinutes(booking.start_time);
            const bookingEnd = parseTimeToMinutes(booking.end_time);
            const requestStart = parseTimeToMinutes(start_time);
            const requestEnd = parseTimeToMinutes(end_time);
            
            // Check for overlap
            return (
                (requestStart >= bookingStart && requestStart < bookingEnd) ||
                (requestEnd > bookingStart && requestEnd <= bookingEnd) ||
                (requestStart <= bookingStart && requestEnd >= bookingEnd)
            );
        });
        
        if (hasConflict) {
            // Find the conflicting booking
            const conflictingBooking = venue.bookings.find(booking => {
                if (booking.date !== date) return false;
                
                const bookingStart = parseTimeToMinutes(booking.start_time);
                const bookingEnd = parseTimeToMinutes(booking.end_time);
                const requestStart = parseTimeToMinutes(start_time);
                const requestEnd = parseTimeToMinutes(end_time);
                
                return (
                    (requestStart >= bookingStart && requestStart < bookingEnd) ||
                    (requestEnd > bookingStart && requestEnd <= bookingEnd) ||
                    (requestStart <= bookingStart && requestEnd >= bookingEnd)
                );
            });
            
            return res.status(409).send({ 
                msg: "Venue is already booked during this time",
                available: false,
                conflictingBooking
            });
        }
        
        res.status(200).send({ 
            msg: "Venue is available for booking",
            available: true
        });
    } catch (error) {
        console.error("Error checking venue availability:", error);
        res.status(500).send({ msg: "Server error", error: error.message });
    }
};

// Book a venue
const bookVenue = async (req, res) => {
    const { venue_id, event_id, event_name, date, start_time, end_time, admin_id } = req.body;
    
    try {
        // Validate admin
        const admin = await Admin.findOne({ admin_id });
        if (!admin) {
            return res.status(401).send({ msg: "Unauthorized. Admin not found." });
        }
        
        const venue = await Venue.findOne({ venue_id });
        if (!venue) {
            return res.status(404).send({ msg: "Venue not found" });
        }
        
        // Check venue availability
        if (!venue.availability) {
            return res.status(409).send({ msg: "Venue is not available for booking" });
        }
        
        // Check for booking conflicts
        const hasConflict = venue.bookings.some(booking => {
            if (booking.date !== date) return false;
            
            // Parse times
            const bookingStart = parseTimeToMinutes(booking.start_time);
            const bookingEnd = parseTimeToMinutes(booking.end_time);
            const requestStart = parseTimeToMinutes(start_time);
            const requestEnd = parseTimeToMinutes(end_time);
            
            // Check for overlap
            return (
                (requestStart >= bookingStart && requestStart < bookingEnd) ||
                (requestEnd > bookingStart && requestEnd <= bookingEnd) ||
                (requestStart <= bookingStart && requestEnd >= bookingEnd)
            );
        });
        
        if (hasConflict) {
            return res.status(409).send({ msg: "Venue is already booked during this time" });
        }
        
        // Add booking
        venue.bookings.push({
            event_id,
            event_name,
            date,
            start_time,
            end_time,
            status: "confirmed"
        });
        
        await venue.save();
        res.status(200).send({ 
            msg: "Venue booked successfully",
            booking: venue.bookings[venue.bookings.length - 1]
        });
    } catch (error) {
        console.error("Error booking venue:", error);
        res.status(500).send({ msg: "Server error", error: error.message });
    }
};

// Cancel venue booking
const cancelBooking = async (req, res) => {
    const { venue_id, event_id, admin_id } = req.body;
    
    try {
        // Validate admin
        const admin = await Admin.findOne({ admin_id });
        if (!admin) {
            return res.status(401).send({ msg: "Unauthorized. Admin not found." });
        }
        
        const venue = await Venue.findOne({ venue_id });
        if (!venue) {
            return res.status(404).send({ msg: "Venue not found" });
        }
        
        // Find booking index
        const bookingIndex = venue.bookings.findIndex(booking => booking.event_id === event_id);
        
        if (bookingIndex === -1) {
            return res.status(404).send({ msg: "Booking not found" });
        }
        
        // Remove booking
        venue.bookings.splice(bookingIndex, 1);
        
        await venue.save();
        res.status(200).send({ msg: "Booking cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).send({ msg: "Server error", error: error.message });
    }
};

// Helper function to parse time string to minutes
function parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

module.exports = {
    createVenue,
    getAllVenues,
    getVenueById,
    updateVenue,
    deleteVenue,
    checkVenueAvailability,
    bookVenue,
    cancelBooking
};
