const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
    {
        venue_id: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        capacity: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        facilities: {
            type: [String],
            default: [],
        },
        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1469&auto=format&fit=crop",
        },
        availability: {
            type: Boolean,
            default: true,
        },
        created_by: {
            type: String, // admin_id
            required: true,
        },
        bookings: [
            {
                event_id: String,
                event_name: String,
                date: String,
                start_time: String,
                end_time: String,
                status: {
                    type: String,
                    enum: ["confirmed", "pending", "cancelled"],
                    default: "confirmed",
                },
            },
        ],
    },
    { timestamps: true }
);

const Venue = mongoose.model("Venue", venueSchema);

module.exports = {
    Venue,
    venueSchema,
};
