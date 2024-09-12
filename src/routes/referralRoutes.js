import express from 'express';
import { validateReferralCode } from '../controllers/referralController.js';

const router = express.Router();

router.post('/validate', validateReferralCode);

export default router;