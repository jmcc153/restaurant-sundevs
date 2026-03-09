"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartService = void 0;
const cartRepository_1 = require("@/repository/cartRepository");
const eventRepository_1 = require("@/repository/eventRepository");
exports.cartService = {
    getCartByUserId: async (userId) => {
        return await cartRepository_1.cartRepository.findByUserId(userId);
    },
    addItemToCart: async (userId, itemData, correlationId) => {
        const currentCart = await cartRepository_1.cartRepository.findByUserId(userId);
        const existingItems = currentCart ? currentCart.items : [];
        const updatedItems = [...existingItems, itemData];
        const updatedCart = await cartRepository_1.cartRepository.save(userId, updatedItems);
        await eventRepository_1.eventRepository.save({
            userId,
            type: "CART_ITEM_ADDED",
            correlationId,
            payload: { item: itemData },
            source: "web",
        });
        return updatedCart;
    },
    updateCartItem: async (userId, itemData, correlationId) => {
        const currentCart = await cartRepository_1.cartRepository.findByUserId(userId);
        const existingItems = currentCart ? currentCart.items : [];
        const updatedItems = existingItems.map((item) => item.cartItemId === itemData.cartItemId ? itemData : item);
        const updatedCart = await cartRepository_1.cartRepository.save(userId, updatedItems);
        await eventRepository_1.eventRepository.save({
            userId,
            type: "CART_ITEM_UPDATED",
            correlationId,
            payload: { item: itemData },
            source: "web",
        });
        return updatedCart;
    },
    removeCartItem: async (userId, cartItemId, correlationId) => {
        const updatedCart = await cartRepository_1.cartRepository.removeItem(userId, cartItemId);
        await eventRepository_1.eventRepository.save({
            userId,
            type: "CART_ITEM_REMOVED",
            correlationId,
            payload: { cartItemId },
            source: "web",
        });
        return updatedCart;
    },
};
//# sourceMappingURL=cartService.js.map