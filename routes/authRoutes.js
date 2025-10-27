import express from 'express';
import { 
    registerUser,
    loginUser, 
    logoutUser,
    } from '../controller/authController.js';
import { authMiddleware } from '../middleware/authMiddeleware.js';


const router = express.Router();



router.post('/register', registerUser);

router.post('/login', loginUser);
// router.post('/change-password', authMiddleware, changePassword);
// router.post('/forget-password-admin', sendOtpToEmail);
// router.post('/reset-password-admin', verifyOtpAndResetPassword);
// router.post('/reset-password-no-otp', resetPassword);
// router.post('/forget-password-phone', sendOtpToPhone);
// router.post('/reset-password-phone', verifyOtpAndResetPasswordPhone);
router.get('/logout', authMiddleware, logoutUser);

export default router;
