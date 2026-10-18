import mongoose from "mongoose";

declare global {
  var mongooseConnection: typeof mongoose | null | undefined;
  var mongoosePromise: Promise<typeof mongoose> | null | undefined;
}

const cached = globalThis as typeof globalThis & {
  mongooseConnection?: typeof mongoose | null;
  mongoosePromise?: Promise<typeof mongoose> | null;
};

export async function mongooseConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  if (cached.mongooseConnection) {
    return cached.mongooseConnection;
  }

  if (!cached.mongoosePromise) {
    mongoose.set("strictQuery", false);
    cached.mongoosePromise = mongoose.connect(uri).catch((err) => {
      cached.mongoosePromise = null;
      throw err;
    });
  }

  cached.mongooseConnection = await cached.mongoosePromise;
  return cached.mongooseConnection;
}
