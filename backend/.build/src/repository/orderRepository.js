"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = void 0;
const order_1 = require("../models/order");
exports.orderRepository = {
    findByOrderId: async (orderId) => {
        return await order_1.Order.findOne({ orderId }).lean();
    },
    findByIdempotencyKey: async (idempotencyKey) => {
        return await order_1.Order.findOne({ idempotencyKey }).lean();
    },
    findByUserId: async (userId) => {
        return await order_1.Order.find({ userId }).sort({ createdAt: -1 }).lean();
    },
    create: async (orderData) => {
        const order = new order_1.Order({
            ...orderData,
            status: "PENDING",
        });
        return await order.save();
    },
    updateStatus: async (orderId, status) => {
        return await order_1.Order.findOneAndUpdate({ orderId }, { status }, { returnDocument: "after" }).lean();
    },
};
//# sourceMappingURL=orderRepository.js.map