const express = require("express");
const router = express.Router();
const {
    createVenue,
    getAllVenues,
    getVenueById,
    updateVenue,
    deleteVenue,
    checkVenueAvailability,
    bookVenue,
    cancelBooking
} = require("../controllers/venueController");

// Create a new venue
router.post("/venues", createVenue);

// Get all venues
router.get("/venues", getAllVenues);

// Get venue by ID
router.get("/venues/:venue_id", getVenueById);

// Update venue
router.put("/venues/:venue_id", updateVenue);

// Delete venue
router.delete("/venues/:venue_id", deleteVenue);

// Check venue availability
router.post("/venues/check-availability", checkVenueAvailability);

// Book a venue
router.post("/venues/book", bookVenue);

// Cancel venue booking
router.post("/venues/cancel-booking", cancelBooking);

// Fix venue bookings
router.route("/venue/bookings/fix").get(async (req, res) => {
    try {
        const { Event } = require('../models/event');
        const { Venue } = require('../models/venue');
        
        console.log('Starting venue booking fix...');
        
        // Get all events
        const events = await Event.find({});
        console.log(`Found ${events.length} events to process`);
        
        let updatedVenues = 0;
        let totalBookingsAdded = 0;
        
        // Process each event
        for (const event of events) {
            console.log(`Processing event: ${event.name} (${event.event_id})`);
            
            // Skip if no venue
            if (!event.venue) {
                console.log(`  - No venue specified, skipping`);
                continue;
            }
            
            // Find the venue
            let venue = await Venue.findOne({ venue_id: event.venue });
            
            // If not found by venue_id, try by name
            if (!venue) {
                venue = await Venue.findOne({ name: event.venue });
                if (venue) {
                    console.log(`  - Found venue by name: ${venue.name}`);
                } else {
                    console.log(`  - Venue not found: ${event.venue}`);
                    continue;
                }
            } else {
                console.log(`  - Found venue by ID: ${venue.name}`);
            }
            
            // Check if this event is already in the bookings
            const existingBooking = venue.bookings.find(b => b.event_id === event.event_id);
            
            if (!existingBooking) {
                // Add new booking
                venue.bookings.push({
                    event_id: event.event_id,
                    event_name: event.name,
                    date: event.date,
                    start_time: event.time,
                    end_time: event.end_time || '',
                    status: 'confirmed'
                });
                
                await venue.save();
                updatedVenues++;
                totalBookingsAdded++;
                console.log(`  - Added booking to venue ${venue.name}. Total bookings: ${venue.bookings.length}`);
            } else {
                console.log(`  - Event already booked for this venue`);
            }
        }
        
        console.log('Venue booking fix completed successfully');
        
        // Return success response
        res.status(200).json({
            message: 'Venue bookings fixed successfully',
            stats: {
                eventsProcessed: events.length,
                venuesUpdated: updatedVenues,
                bookingsAdded: totalBookingsAdded
            }
        });
    } catch (error) {
        console.error('Error fixing venue bookings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to refresh venue bookings from events
router.post('/refresh-bookings', async (req, res) => {
    try {
        const { Event } = require('../models/event');
        const { Venue } = require('../models/venue');
        
        console.log('Starting venue bookings refresh');
        
        // Get all venues
        const venues = await Venue.find({});
        console.log(`Found ${venues.length} venues to refresh`);
        
        // For each venue, clear bookings and rebuild from events
        for (const venue of venues) {
            // Get all events for this venue
            const events = await Event.find({ venue: venue.name });
            console.log(`Found ${events.length} events for venue: ${venue.name}`);
            
            // Clear existing bookings
            venue.bookings = [];
            
            // Add bookings from events
            for (const event of events) {
                venue.bookings.push({
                    event_id: event.event_id,
                    event_name: event.name,
                    date: event.date,
                    start_time: event.time,
                    end_time: event.end_time || '',
                    status: 'confirmed'
                });
            }
            
            // Save updated venue
            await venue.save();
            console.log(`Updated venue ${venue.name} with ${venue.bookings.length} bookings`);
        }
        
        res.status(200).json({ 
            msg: 'Venue bookings refreshed successfully',
            venuesUpdated: venues.length
        });
    } catch (error) {
        console.error('Error refreshing venue bookings:', error);
        res.status(500).json({ 
            msg: 'Server error during venue bookings refresh', 
            error: error.message 
        });
    }
});

module.exports = router;
