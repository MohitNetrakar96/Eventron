const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        event_id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        venue: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            default: 0,
        },
        cover: {
            type: String,
            default:
                "https://eventplanning24x7.files.wordpress.com/2018/04/events.png",
        },
        images: {
            type: [String],
            default: [],
        },
        profile: {
            type: String,
            default:
                "https://i.etsystatic.com/15907303/r/il/c8acad/1940223106/il_794xN.1940223106_9tfg.jpg",
        },
        organizer: {
            type: String,
            required: true,
        },
        participants: {
            type: Array,
            default: [],
        },
        // Admin who created the event
        admin_id: {
            type: String,
        },
        end_time: {
            type: String,
        }
    },
    { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = {
    Event,
    eventSchema,
};
