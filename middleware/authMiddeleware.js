import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import blacklistTokenModel from '../models/blacklistToken.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({token});
    if(isBlacklisted){
       return res.status(401).json({ message: 'Unauthorized' }); 
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
}