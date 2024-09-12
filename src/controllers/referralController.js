import User from '../models/User.js';

export const validateReferralCode = async (req, res) => {
    try {
        const { referralCode } = req.body;
        if (!referralCode) {
            return res.status(404).json({ message: 'Field required: referralCode' });
        }
        const referrer = await User.findOne({ referralCode });

        if (!referrer) {
            return res.status(404).json({ message: 'Invalid referral code' });
        }

        res.json({
            isValid: true,
            referrer: {
                name: referrer.name,
                mobile: referrer.mobile
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};