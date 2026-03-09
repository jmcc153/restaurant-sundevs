"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant_db";
let cachedConnection = null;
const connectDB = async () => {
    if (cachedConnection) {
        console.log("=> Usando conexión existente");
        return cachedConnection;
    }
    console.log("=> Creando nueva conexión a MongoDB");
    try {
        const opts = {
            bufferCommands: false,
        };
        cachedConnection = await mongoose_1.default.connect(MONGODB_URI, opts);
        return cachedConnection;
    }
    catch (error) {
        console.error("Error al conectar a MongoDB:", error);
        throw error;
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map