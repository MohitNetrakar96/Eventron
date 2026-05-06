const express = require('express');
const router = express.Router();
const { Event } = require('../models/event');

// Debug route to check participants for a specific event
router.get('/check-participants/:eventId', async (req, res) => {
    try {
        const eventId = req.params.eventId;
        console.log(`Checking participants for event ID: ${eventId}`);
        
        // Try to find by public_id first
        let event = await Event.findOne({ public_id: eventId });
        
        // If not found, try by event_id
        if (!event) {
            event = await Event.findOne({ event_id: eventId });
        }
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Return event details with participants
        return res.json({
            event_id: event.event_id,
            public_id: event.public_id,
            name: event.name,
            participants: event.participants || [],
            participantCount: event.participants ? event.participants.length : 0
        });
    } catch (error) {
        console.error('Debug route error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Debug route to list all events with their participant counts
router.get('/list-events', async (req, res) => {
    try {
        const events = await Event.find({});
        const eventSummary = events.map(event => ({
            event_id: event.event_id,
            public_id: event.public_id,
            name: event.name,
            participantCount: event.participants ? event.participants.length : 0
        }));
        
        return res.json(eventSummary);
    } catch (error) {
        console.error('Debug route error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
