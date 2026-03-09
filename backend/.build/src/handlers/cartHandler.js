"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const cartService_1 = require("../services/cartService");
const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await cartService_1.cartService.getCartByUserId(userId);
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el carrito" });
    }
};
exports.getCart = getCart;
const addItem = async (req, res) => {
    try {
        const { userId, item, correlationId } = req.body;
        const updatedCart = await cartService_1.cartService.addItemToCart(userId, item, correlationId);
        res.status(200).json(updatedCart);
    }
    catch (error) {
        if (error.message === "PAYLOAD_TOO_LARGE") {
            return res.status(400).json({ message: "El item excede los 16KB" });
        }
        res.status(500).json({ message: "Error al agregar al carrito" });
    }
};
exports.addItem = addItem;
const updateItem = async (req, res) => {
    try {
        const { userId, item, correlationId } = req.body;
        const updatedCart = await cartService_1.cartService.updateCartItem(userId, item, correlationId);
        res.status(200).json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ message: "Error al actualizar item" });
    }
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    try {
        const { userId, cartItemId, correlationId } = req.body;
        const updatedCart = await cartService_1.cartService.removeCartItem(userId, cartItemId, correlationId);
        res.status(200).json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar item" });
    }
};
exports.deleteItem = deleteItem;
//# sourceMappingURL=cartHandler.js.map