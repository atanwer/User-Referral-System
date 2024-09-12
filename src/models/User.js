import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    technologies: [{ type: String, enum: ['PHP', 'Angular', 'Nodejs'] }],
    dateOfBirth: { type: Date, required: true },
    photos: [{ type: String }],
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    points: { type: Number, default: 0 },
    password: { type: String, required: true }
});

export default mongoose.model('User', userSchema);