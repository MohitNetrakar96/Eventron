const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGO_ATLAS_URI).then(async () => {
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log('Found', users.length, 'users');

    for (const user of users) {
        if (!user.user_token) {
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
            await mongoose.connection.collection('users').updateOne(
                { _id: user._id },
                { $set: { user_token: token } }
            );
            console.log(`Fixed token for: ${user.email}`);
            console.log(`  New token: ${token.substring(0, 40)}...`);
        } else {
            console.log(`Already has token: ${user.email}`);
        }
    }

    // Verify fix
    const fixed = await mongoose.connection.collection('users').find({}).toArray();
    console.log('\n--- Verification ---');
    fixed.forEach(u => {
        console.log(`${u.email} | token exists: ${!!u.user_token}`);
    });

    mongoose.disconnect();
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
