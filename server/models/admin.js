const mongoose = require("mongoose");
const { eventSchema } = require("./event");

const adminSchema = new mongoose.Schema(
    {
        admin_id: {
            type: String,
            requird: true,
        },
        email: {
            type: String,
            unique: true,
        },
        pass: {
            type: String,
        },
        name: {
            type: String,
        },
        eventCreated: [],

        expireAt: {
            type: Date,
            default: Date.now,
            index: { expires: "2592000s" },
        },
    },
    { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

const test_credential = new Admin({
    admin_id: "hqwkufywealufyewf.weiugbfre654wegreg",
    email: "invite.testing@gmail.com",
    name: "test",
    pass: "invite123",
});

Admin.find({ admin_id: "hqwkufywealufyewf.weiugbfre654wegreg" })
    .then(docs => {
        if (docs.length === 0) {
            test_credential.save()
                .then(() => console.log("Saved::Admin::test credentials"))
                .catch(err => console.log("Error saving test credentials:", err.message));
        }
    })
    .catch(err => {
        console.error("Error finding test admin (database might be disconnected):", err.message);
    });

module.exports = Admin;
