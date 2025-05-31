import mongoose, {Mongoose} from "mongoose";

const URI = process.env?.MONGODB_URI;

if (!URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const DB_URI: string = URI;

let connection: Mongoose | null = null;

async function connectToDatabase(): Promise<Mongoose> {
  if (connection) {
    return connection;
  }

  try {
    connection = await mongoose.connect(DB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }

  return connection;
}

export async function getMongoConnection() {
  if (!connection) {
    await connectToDatabase();
  }
  return connection!;
}