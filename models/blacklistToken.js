import mongoose from 'mongoose';

const blacklistTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' }, 
});

export default mongoose.model('blacklistToken', blacklistTokenSchema);