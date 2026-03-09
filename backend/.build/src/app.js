"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const menuHandler = __importStar(require("./handlers/menuHandler"));
const cartHandler = __importStar(require("./handlers/cartHandler"));
const eventHandler = __importStar(require("./handlers/eventHandler"));
const orderHandler = __importStar(require("./handlers/orderHandler"));
const db_1 = require("./lib/db");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use(async (req, res, next) => {
    await (0, db_1.connectDB)();
    next();
});
app.get("/menu", menuHandler.getMenu);
app.get("/cart/:userId", cartHandler.getCart);
app.post("/cart/items", cartHandler.addItem);
app.put("/cart/items", cartHandler.updateItem);
app.delete("/cart/items", cartHandler.deleteItem);
app.post("/orders", orderHandler.createOrder);
app.get("/orders/user/:userId", orderHandler.getOrdersByUser);
app.get("/orders/:orderId", orderHandler.getOrder);
app.patch("/orders/:orderId/status", orderHandler.updateOrderStatus);
app.get("/orders/:orderId/timeline", eventHandler.getTimeline);
app.get("/events/:correlationId", eventHandler.getEventsByCorrelationId);
exports.handler = (0, serverless_http_1.default)(app);
//# sourceMappingURL=app.js.map