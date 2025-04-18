// lib/databse/models/user.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
  creditBalance: number;
  // Add any other fields
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  photo: { type: String },
  creditBalance: { type: Number, default: 10 },
  // Add any other fields
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;