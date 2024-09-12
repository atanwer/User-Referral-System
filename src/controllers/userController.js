import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateReferralCode } from '../utils/referralUtils.js';
import { validateMobile } from '../utils/validation.js';
import { delteUploadedImages } from '../utils/deleteUploadedImages.js';

export const register = async (req, res) => {
    try {
        const { name, mobile, gender, technologies, dateOfBirth, referralCode, password } = req.body;
        const techArray = technologies ? JSON.parse(technologies) : []

        if (!name || !mobile || !password) {
            delteUploadedImages(req.files);
            return res.status(400).json({ message: 'Please provide all required fields (name, mobile, password).' });
        }

        const isInvalidMobile = validateMobile(mobile);
        if (isInvalidMobile) {
            delteUploadedImages(req.files);
            return res.status(400).json({ message: isInvalidMobile });
        }

        const isUserExist = await User.findOne({ mobile });
        if (isUserExist) {
            delteUploadedImages(req.files);
            return res.status(400).json({ message: `User already exist with ${mobile} mobile number` });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
        const referrer = await User.findOne({ referralCode })
        const newUser = new User({
            name,
            mobile,
            gender,
            technologies: techArray,
            dateOfBirth,
            photos: photoUrls,
            referralCode: generateReferralCode(),
            referredBy: referrer ? referrer._id : null,
            points: referrer ? 10 : 0,
            password: hashedPassword
        });
        if (referrer) {
            referrer.points += 20;
            await referrer.save();
        }
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
        const userWithoutPassword = newUser.toObject();
        delete userWithoutPassword.password;
        res.status(201).json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        // Delete uploaded images if error occurs
        delteUploadedImages(req.files);
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const user = await User.findOne({ mobile });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getReferrals = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const referrals = await User.find({ referredBy: req.user._id })
            .select("name mobile gender technologies dateOfBirth photos ")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments({ referredBy: req.user._id });

        res.json({
            referrals,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            count
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteReferral = async (req, res) => {
    try {
        const referral = await User.findOneAndUpdate(
            { _id: req.params.referralId, referredBy: req.user._id },
            { $unset: { referredBy: 1 } }
        );

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        res.json({ message: 'Referral removed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        if (updates.password) {
            return res.status(404).json({ message: 'Password Can Not Be Update.' });
        }
        if (updates.mobile) {
            return res.status(404).json({ message: 'Mobile Number can not be Update.' });
        }
        if (updates.referralCode) {
            return res.status(404).json({ message: 'Referral Code can not be Update.' });
        }

        if (updates.technologies) {
            updates.technologies = JSON.parse(updates.technologies);
        }
        const newPhotoUrls = req.files.map(file => `/uploads/${file.filename}`);

        updates.photos = [...req.user.photos, ...newPhotoUrls];

        if (updates.photosToRemove) {
            updates.photos = updates.photos.filter(photo => !JSON.parse(updates.photosToRemove).includes(photo));
            delete updates.photosToRemove;
        }


        const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
        const userWithoutPassword = updatedUser.toObject();
        delete userWithoutPassword.password;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getReferralCode = async (req, res) => {
    res.json({ referralCode: req.user.referralCode });
};

export const getProfile = async (req, res) => {
    const userWithoutPassword = req.user.toObject();
    delete userWithoutPassword.password;
    res.json(userWithoutPassword);
};
