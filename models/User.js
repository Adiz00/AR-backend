import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
 name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, select: false }, // hashed password
 
  is_verified: { type: Boolean, default: false },
 
}, { timestamps: true });


export default mongoose.model('User', userSchema);
