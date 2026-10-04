const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Parampara Web Server running on http://localhost:${PORT}`);
});
