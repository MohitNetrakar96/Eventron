const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_ATLAS_URI).then(async () => {
    const updates = [
        { email: 'mohit24122004@gmail.com', username: 'Mohit' },
        { email: 'mohitnetrakar43@gmail.com', username: 'Mohit Netrakar' },
        { email: 'mn1473499@gmail.com', username: 'MN User' },
    ];

    for (const u of updates) {
        // Update if username is null or missing
        await mongoose.connection.collection('users').updateOne(
            { email: u.email },
            { $set: { username: u.username } }
        );
        console.log('Set username for', u.email, '→', u.username);
    }

    // Verify
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log('\n--- Verification ---');
    users.forEach(u => console.log(u.email, '| username:', u.username));

    mongoose.disconnect();
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
