import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
import referralRoutes from './src/routes/referralRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Database Connected Successfully!'));

app.use('/api/users', userRoutes);
app.use('/api/referrals', referralRoutes);


app.use('/healthCheck', (req, res) => {
    res.send("Welcome to The User Referral System 🙏");
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));