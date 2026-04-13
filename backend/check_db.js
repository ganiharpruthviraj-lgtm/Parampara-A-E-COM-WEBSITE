require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Product.countDocuments();
        console.log(`Connection Success! Total products in DB: ${count}`);
        process.exit(0);
    } catch (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    }
}
check();
