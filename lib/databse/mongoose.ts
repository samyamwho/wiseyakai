import mongoose, { ConnectOptions } from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "wiseyakai",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);

    isConnected = !!db.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (error: unknown) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to database");
  }
};
