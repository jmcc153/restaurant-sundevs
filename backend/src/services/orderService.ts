import { orderRepository } from "../repository/orderRepository";
import { cartRepository } from "../repository/cartRepository";
import { productRepository } from "../repository/productRepository";
import { eventRepository } from "../repository/eventRepository";
import { OrderItemType, OrderStatus } from "../types/order";
import { v4 as uuidv4 } from "uuid";

export const orderService = {
  checkout: async (
    userId: string,
    idempotencyKey: string,
    correlationId: string,
  ) => {
    const existingOrder =
      await orderRepository.findByIdempotencyKey(idempotencyKey);
    if (existingOrder) {
      return existingOrder;
    }

    const orderId = uuidv4();

    const cart = await cartRepository.findByUserId(userId);
    console.log(cart);
    if (!cart || cart.items.length === 0) {
      throw new Error("CART_EMPTY");
    }

    const orderItems: OrderItemType[] = [];
    let total = 0;

    for (const cartItem of cart.items) {
      const product = await productRepository.getProductById(cartItem.id);
      if (!product) {
        await eventRepository.save({
          userId,
          orderId,
          type: "VALIDATION_FAILED",
          correlationId,
          payload: {
            reason: "PRODUCT_NOT_FOUND",
            productId: cartItem.id,
          },
          source: "api",
        });
        throw new Error("PRODUCT_NOT_FOUND");
      }

      let unitPrice = product.basePrice;
      const modifiers = cartItem.selectedModifiers.map((mod) => ({
        groupName: mod.groupName,
        optionName: mod.option?.name ?? "",
        extraPrice: mod.option?.extraPrice ?? 0,
      }));

      for (const mod of modifiers) {
        unitPrice += mod.extraPrice;
      }

      const subtotal = unitPrice * cartItem.quantity;
      total += subtotal;

      orderItems.push({
        cartItemId: cartItem.cartItemId,
        productId: cartItem.id,
        name: product.name,
        quantity: cartItem.quantity,
        unitPrice,
        modifiers,
        subtotal,
      });
    }

    await eventRepository.save({
      userId,
      orderId,
      type: "PRICING_CALCULATED",
      correlationId,
      payload: { items: orderItems, total },
      source: "api",
    });

    const order = await orderRepository.create({
      orderId,
      userId,
      correlationId,
      idempotencyKey,
      items: orderItems,
      total,
    });

    await eventRepository.save({
      userId,
      orderId,
      type: "ORDER_PLACED",
      correlationId,
      payload: { orderId, total, itemCount: orderItems.length },
      source: "api",
    });

    await cartRepository.clear(userId);

    return order;
  },

  getOrderById: async (orderId: string) => {
    const order = await orderRepository.findByOrderId(orderId);
    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }
    return order;
  },

  getOrdersByUserId: async (userId: string) => {
    return await orderRepository.findByUserId(userId);
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const order = await orderRepository.findByOrderId(orderId);
    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, status);

    await eventRepository.save({
      userId: order.userId,
      orderId,
      type: "ORDER_STATUS_CHANGED",
      correlationId: order.correlationId,
      payload: { previousStatus: order.status, newStatus: status },
      source: "api",
    });

    return updatedOrder;
  },
};
