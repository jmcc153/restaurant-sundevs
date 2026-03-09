"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderStatuses = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "DELIVERED",
    "CANCELLED",
];
const OrderItemSchema = new mongoose_1.Schema({
    cartItemId: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    modifiers: [
        {
            groupName: { type: String, required: true },
            optionName: { type: String, required: true },
            extraPrice: { type: Number, required: true },
        },
    ],
    subtotal: { type: Number, required: true },
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    correlationId: { type: String, required: true, index: true },
    idempotencyKey: { type: String, required: true, unique: true },
    status: {
        type: String,
        required: true,
        enum: OrderStatuses,
        default: "PENDING",
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
}, { timestamps: true });
exports.Order = (0, mongoose_1.model)("Order", OrderSchema);
//# sourceMappingURL=order.js.map