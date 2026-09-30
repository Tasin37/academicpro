import mongoose from "mongoose";

const configuredUri = process.env.MONGODB_URI;
if (!configuredUri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}
const uri: string = configuredUri;

declare global {
  var mongooseConnection: typeof mongoose | null | undefined;
  var mongoosePromise: Promise<typeof mongoose> | null | undefined;
}

const cached = globalThis as typeof globalThis & {
  mongooseConnection?: typeof mongoose | null;
  mongoosePromise?: Promise<typeof mongoose> | null;
};

export async function mongooseConnect() {
  if (cached.mongooseConnection) {
    return cached.mongooseConnection;
  }

  if (!cached.mongoosePromise) {
    mongoose.set("strictQuery", false);
    cached.mongoosePromise = mongoose.connect(uri);
  }

  cached.mongooseConnection = await cached.mongoosePromise;
  return cached.mongooseConnection;
}
