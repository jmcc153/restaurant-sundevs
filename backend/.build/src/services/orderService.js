"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = void 0;
const orderRepository_1 = require("../repository/orderRepository");
const cartRepository_1 = require("../repository/cartRepository");
const menuRepository_1 = require("../repository/menuRepository");
const eventRepository_1 = require("../repository/eventRepository");
const uuid_1 = require("uuid");
exports.orderService = {
    checkout: async (userId, idempotencyKey, correlationId) => {
        const existingOrder = await orderRepository_1.orderRepository.findByIdempotencyKey(idempotencyKey);
        if (existingOrder) {
            return existingOrder;
        }
        const orderId = (0, uuid_1.v4)();
        const cart = await cartRepository_1.cartRepository.findByUserId(userId);
        console.log(cart);
        if (!cart || cart.items.length === 0) {
            throw new Error("CART_EMPTY");
        }
        const orderItems = [];
        let total = 0;
        for (const cartItem of cart.items) {
            const product = await menuRepository_1.productRepository.getProductById(cartItem.id);
            if (!product) {
                await eventRepository_1.eventRepository.save({
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
        await eventRepository_1.eventRepository.save({
            userId,
            orderId,
            type: "PRICING_CALCULATED",
            correlationId,
            payload: { items: orderItems, total },
            source: "api",
        });
        const order = await orderRepository_1.orderRepository.create({
            orderId,
            userId,
            correlationId,
            idempotencyKey,
            items: orderItems,
            total,
        });
        await eventRepository_1.eventRepository.save({
            userId,
            orderId,
            type: "ORDER_PLACED",
            correlationId,
            payload: { orderId, total, itemCount: orderItems.length },
            source: "api",
        });
        await cartRepository_1.cartRepository.clear(userId);
        return order;
    },
    getOrderById: async (orderId) => {
        const order = await orderRepository_1.orderRepository.findByOrderId(orderId);
        if (!order) {
            throw new Error("ORDER_NOT_FOUND");
        }
        return order;
    },
    getOrdersByUserId: async (userId) => {
        return await orderRepository_1.orderRepository.findByUserId(userId);
    },
    updateOrderStatus: async (orderId, status) => {
        const order = await orderRepository_1.orderRepository.findByOrderId(orderId);
        if (!order) {
            throw new Error("ORDER_NOT_FOUND");
        }
        const updatedOrder = await orderRepository_1.orderRepository.updateStatus(orderId, status);
        await eventRepository_1.eventRepository.save({
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
//# sourceMappingURL=orderService.js.map