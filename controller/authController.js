
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import jwt from 'jsonwebtoken';
import blacklistToken from '../models/blacklistToken.js';
import { generateOtp } from '../utils/otpHelper.js';
import { sendEmail } from '../utils/sendEmail.js';
import Otp from '../models/Otp.js';

export const registerUser = async (req, res) => {
    try {

      console.log(`[ENTRY registerUser] ${req.method} ${req.originalUrl} params:${JSON.stringify(req.params||{})} query:${JSON.stringify(req.query||{})} body:${JSON.stringify(req.body||{})}`);
      // Accept both JSON and multipart/form-data
      const { name, email, password } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(409).json({ message: 'Email already registered' });

      let hashed = '';
      
        hashed = await hashPassword(password);
      

      const user = await User.create({
        name,
        email,
        password: hashed,
      });


      res.status(201).json({ message: 'User registered successfully', user_id: user._id });
  }
   catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Registration failed', error: err.message });
    }
  };

  
  

  export const loginUser = async (req, res) => {
    try {
      console.log(`[ENTRY loginUser] ${req.method} ${req.originalUrl} params:${JSON.stringify(req.params||{})} query:${JSON.stringify(req.query||{})} body:${JSON.stringify(req.body||{})}`);

      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({
            message:
              "Email and password are required",
          });
      }

      const user = await User.findOne({ email }).select('+password'); // Include password field for comparison
      if (!user){
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch){
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const payload = {
        _id: user._id,
        email: user?.email,
      };
      const token = jwt.sign( payload , process.env.JWT_SECRET, {expiresIn: '7d'});

      const cookieOptions = {
        httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production', // Only send over HTTPS
        sameSite: 'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      const responsePayload = { message: 'Login successful', token, user: { id: user._id, role: user.role, email: user.email, phone: user.phone } };
      console.log('[RESPONSE loginUser]', responsePayload);
      res.cookie('token', token, cookieOptions).status(200).json(responsePayload);

      
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  export const logoutUser = async (req, res) => {
    try {
      res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });

      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      await blacklistToken.create({token}); 

      res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Logout failed', error: err.message });
    }
  }

//   export const changePassword = async (req, res) => {
//     try {
//         const { oldPassword, newPassword } = req.body;
//         const userId = req.user._id; // user is set in auth middleware

//         if (!oldPassword || !newPassword) {
//             return res.status(400).json({ message: 'Old and new passwords are required' });
//         }

//         const user = await User.findById(userId).select('+password'); 
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const isMatch = await comparePassword(oldPassword, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Old password is incorrect' });
//         }

//         const hashedNewPassword = await hashPassword(newPassword);
//         user.password = hashedNewPassword;
//         await user.save();

//         res.status(200).json({ message: 'Password changed successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to change password', error: err.message });
//     }
//   }

//   // FORGOT PASSWORD - Send OTP
  export const sendOtpToEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOtp();
    await Otp.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );

    await sendEmail(email, 'Password Reset OTP', `Your OTP is: ${otp}`);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
  };

// // VERIFY OTP and RESET PASSWORD
  export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6 || confirmPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const record = await Otp.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await hashPassword(newPassword);
    await user.save();
    await Otp.deleteOne({ email });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
  };

// // RESET PASSWORD (Manual - without OTP flow)
//   export const resetPassword = async (req, res) => {
//   try {
//     const { identifier, newPassword } = req.body;

//     if (!identifier || !newPassword) {
//       return res.status(400).json({ message: 'Identifier (email/phone) and new password are required' });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({ message: 'Password must be at least 6 characters long' });
//     }

//     const query = identifier.includes('@') ? { email: identifier } : { phone: identifier };
//     const user = await User.findOne(query);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const hashed = await hashPassword(newPassword);
//     user.password = hashed;
//     await user.save();

//     res.status(200).json({ message: 'Password updated successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Reset password error', error: err.message });
//   }
//   };



