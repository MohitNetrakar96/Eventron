/**
 * Script to fix venue bookings for existing events
 * This script will update venue bookings for all existing events
 */

const mongoose = require('mongoose');
const { Event } = require('../models/event');
const { Venue } = require('../models/venue');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function fixVenueBookings() {
    try {
        console.log('Starting venue booking fix...');
        
        // Get all events
        const events = await Event.find({});
        console.log(`Found ${events.length} events to process`);
        
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
                console.log(`  - Added booking to venue ${venue.name}. Total bookings: ${venue.bookings.length}`);
            } else {
                console.log(`  - Event already booked for this venue`);
            }
        }
        
        console.log('Venue booking fix completed successfully');
    } catch (error) {
        console.error('Error fixing venue bookings:', error);
    } finally {
        // Close MongoDB connection
        mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the fix
fixVenueBookings();
