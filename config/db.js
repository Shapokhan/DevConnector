const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDb Connected...');
    } catch (err) {
        console.log(err.message);
        // Exit process with failure msg
        process.exit(1);
    }
};

module.exports = connectDB;