"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRepository = void 0;
const cart_1 = require("../models/cart");
exports.cartRepository = {
    findByUserId: async (userId) => {
        return await cart_1.Cart.findOne({ userId }).lean();
    },
    save: async (userId, items) => {
        return await cart_1.Cart.findOneAndUpdate({ userId }, {
            userId,
            items,
        }, {
            upsert: true,
            returnDocument: "after",
            setDefaultsOnInsert: true,
        }).lean();
    },
    clear: async (userId) => {
        return await cart_1.Cart.findOneAndUpdate({ userId }, { items: [] }, { returnDocument: "after" }).lean();
    },
    removeItem: async (userId, cartItemId) => {
        return await cart_1.Cart.findOneAndUpdate({ userId }, { $pull: { items: { cartItemId } } }, { returnDocument: "after" }).lean();
    },
};
//# sourceMappingURL=cartRepository.js.map