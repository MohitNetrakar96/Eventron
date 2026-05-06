const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_ATLAS_URI).then(async () => {
    const result = await mongoose.connection.collection('events').updateOne(
        { name: 'Cosplay' },
        { $set: { price: 100 } }
    );
    console.log('Updated:', result.modifiedCount, 'event(s)');
    const event = await mongoose.connection.collection('events').findOne({ name: 'Cosplay' });
    console.log('New price: Rs.', event.price);
    mongoose.disconnect();
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
