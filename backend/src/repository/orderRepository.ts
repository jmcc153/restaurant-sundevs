import { Order } from "../models/order";
import { OrderItemType, OrderStatus } from "../types/order";

export const orderRepository = {
  findByOrderId: async (orderId: string) => {
    return await Order.findOne({ orderId }).lean();
  },

  findByIdempotencyKey: async (idempotencyKey: string) => {
    return await Order.findOne({ idempotencyKey }).lean();
  },

  findByUserId: async (userId: string) => {
    return await Order.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  create: async (orderData: {
    orderId: string;
    userId: string;
    correlationId: string;
    idempotencyKey: string;
    items: OrderItemType[];
    total: number;
  }) => {
    const order = new Order({
      ...orderData,
      status: "PENDING",
    });
    return await order.save();
  },

  updateStatus: async (orderId: string, status: OrderStatus) => {
    return await Order.findOneAndUpdate(
      { orderId },
      { status },
      { returnDocument: "after" },
    ).lean();
  },
};
