const { Event } = require("../models/event");
const User = require("../models/user");

// GET /ticket/:passId — returns full ticket info for QR scan page
const getTicket = async (req, res) => {
    try {
        const { passId } = req.params;

        // Find the event that has this participant pass
        const event = await Event.findOne({ "participants.pass": passId });

        if (!event) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        // Find the specific participant
        const participant = event.participants.find((p) => p.pass === passId);

        if (!participant) {
            return res.status(404).json({ error: "Participant not found" });
        }

        return res.status(200).json({
            pass: passId,
            attendee: participant.name,
            email: participant.email,
            regNo: participant.regNo,
            entry: participant.entry,
            event: {
                name: event.name,
                venue: event.venue,
                date: event.date,
                time: event.time,
                cover: event.cover,
                organizer: event.organizer,
                price: event.price,
            },
        });
    } catch (error) {
        console.error("Get ticket error:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getTicket };
