"use server";

import { revalidatePath } from "next/cache";
import User from "../databse/models/user.model";
import { connectToDatabase } from "../databse/mongoose";
import { handleError } from "../utils";
import { UpdateUserParams } from "@/lib/databse/types";


// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
// In user.action.ts
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    // Filter out undefined values before update
    const updateData = Object.fromEntries(
      Object.entries(user).filter(([_, v]) => v !== undefined)
    );

    const updatedUser = await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) throw new Error("User not found");

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);

    revalidatePath("/"); // optional if you cache user data on homepage
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

// UPDATE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );

    if (!updatedUser) throw new Error("Failed to update user credits");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}
