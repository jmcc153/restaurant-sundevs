import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant_db";

let cachedConnection: typeof mongoose | null = null;

export const connectDB = async () => {
  if (cachedConnection) {
    console.log("=> Usando conexión existente");
    return cachedConnection;
  }

  console.log("=> Creando nueva conexión a MongoDB");
  try {
    const opts = {
      bufferCommands: false,
    };

    cachedConnection = await mongoose.connect(MONGODB_URI, opts);
    return cachedConnection;
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw error;
  }
};
