// models/User.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

// Common user fields with role differentiation

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'seller' | 'deliveryboy';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'seller', 'deliveryboy'], required: true },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);


export default User