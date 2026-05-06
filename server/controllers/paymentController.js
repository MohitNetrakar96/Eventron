const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_51MzZkLSGZ9D2j42f3t5J5s...");
const { Event } = require("../models/event");
const User = require("../models/user");
const { sendTicket } = require("./smsController");

const payment = async (req, res) => {
    try {
        console.log("PAYMENT REQUEST RECEIVED:", JSON.stringify(req.body, null, 2));
        const { product, token, user, event } = req.body;

        const eventId = event.event_id;
        const userId = user.user_id;

        // Fetch User and Event
        const currentUser = await User.findOne({ user_token: userId });
        const currentEvent = await Event.findOne({ event_id: eventId });
        
        console.log("Found User:", !!currentUser, "Found Event:", !!currentEvent);

        if (!currentUser || !currentEvent) {
            return res.status(404).json({ error: "User or Event not found" });
        }

        // Check if user is already registered
        const isRegistered = currentEvent.participants.some(
            (p) => p.id === userId
        );
        if (isRegistered) {
            return res.status(200).json({ status: "alreadyregistered" });
        }

        // Handle free events (price = 0) without charging Stripe
        if (!product.price || product.price === 0) {
            await Event.updateOne(
                { event_id: eventId },
                { $push: { participants: { id: userId, name: currentUser.username, email: currentUser.email, regNo: currentUser.reg_number, entry: false } } }
            );
            await User.updateOne(
                { user_token: userId },
                { $push: { eventRegistered: { event_id: eventId, name: currentEvent.name, venue: currentEvent.venue, date: currentEvent.date, time: currentEvent.time } } }
            );
            sendTicket({ email: currentUser.email, event_name: currentEvent.name, name: currentUser.username, pass: "FREE", price: 0, address1: "N/A", city: "N/A", zip: "N/A" });
            return res.status(200).json({ status: "success", charge: { id: "free", status: "succeeded" } });
        }

        // Stripe minimum charge for INR is ₹50 (5000 paise)
        const amountInPaise = product.price * 100;
        const STRIPE_INR_MINIMUM = 5000; // ₹50
        if (amountInPaise < STRIPE_INR_MINIMUM) {
            return res.status(400).json({
                status: "error",
                error: `Amount ₹${product.price} is below Stripe's minimum charge of ₹50 for INR. Please update the event price.`
            });
        }

        // Create Stripe charge
        const charge = await stripe.charges.create({
            amount: amountInPaise, // Amount in paise
            currency: "inr",
            source: token.id,
            receipt_email: token.email,
            description: product.description,
        });

        if (charge.status === "succeeded") {
            // Update Event participants
            await Event.updateOne(
                { event_id: eventId },
                {
                    $push: {
                        participants: {
                            id: userId,
                            name: currentUser.username,
                            email: currentUser.email,
                            regNo: currentUser.reg_number,
                            pass: charge.id,
                            entry: false,
                        },
                    },
                }
            );

            // Update User registered events
            await User.updateOne(
                { user_token: userId },
                {
                    $push: {
                        eventRegistered: {
                            event_id: eventId,
                            name: currentEvent.name,
                            venue: currentEvent.venue,
                            date: currentEvent.date,
                            time: currentEvent.time,
                        },
                    },
                }
            );

            const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
            const ticketUrl = `${clientUrl}/ticket/${charge.id}`;

            const ticketDetails = {
                email: currentUser.email,
                event_name: currentEvent.name,
                name: currentUser.username,
                pass: charge.id,
                ticketUrl: ticketUrl,
                price: product.price,
                address1: token.card.address_line1 || "Not provided",
                city: token.card.address_city || "Not provided",
                zip: token.card.address_zip || "Not provided",
            };

            // Send digital ticket via email
            sendTicket(ticketDetails);

            return res.status(200).json({ status: "success", charge });
        } else {
            return res.status(400).json({ status: "failed", charge });
        }
    } catch (error) {
        console.error("Payment error:", error);
        return res.status(500).json({ status: "error", error: error.message });
    }
};

module.exports = { payment };
