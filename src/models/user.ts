import mongoose, { model, Schema } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  hasCompany: boolean
}


export const User = mongoose.model<IUser>('User', new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  hasCompany: { type: Boolean, default: false }
}));