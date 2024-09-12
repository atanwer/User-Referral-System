import express from 'express';
import multer from 'multer';
import { register, login, getReferrals, deleteReferral, updateProfile, getReferralCode, getProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({
    dest: 'uploads/',
    limits: {
        files: 5
    }
});

router.post('/register', upload.array('photos', 5), register);
router.post('/login', login);
router.get('/referrals', authMiddleware, getReferrals);
router.delete('/referrals/:referralId', authMiddleware, deleteReferral);
router.put('/profile', authMiddleware, upload.array('photos', 5), updateProfile);
router.get('/referral-code', authMiddleware, getReferralCode);
router.get('/profile', authMiddleware, getProfile);

export default router;