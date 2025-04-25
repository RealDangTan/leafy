import app from './app.js';
import Connect from './db/dbConnect.js';
import dotenv from 'dotenv';

// dotenv.config();

let db_status = false;
try {
    Connect(process.env.MONGODB_URI);
    db_status = true;
} catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
}

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`); 
})