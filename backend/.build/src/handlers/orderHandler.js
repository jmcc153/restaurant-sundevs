"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrdersByUser = exports.getOrder = exports.createOrder = void 0;
const orderService_1 = require("../services/orderService");
const createOrder = async (req, res) => {
    try {
        const idempotencyKey = req.headers["idempotency-key"];
        if (!idempotencyKey) {
            return res
                .status(400)
                .json({ message: "Idempotency-Key header es requerido" });
        }
        const { userId, correlationId } = req.body;
        const order = await orderService_1.orderService.checkout(userId, idempotencyKey, correlationId);
        res.status(202).json(order);
    }
    catch (error) {
        if (error.message === "CART_EMPTY") {
            return res.status(400).json({ message: "El carrito está vacío" });
        }
        if (error.message === "PRODUCT_NOT_FOUND") {
            return res
                .status(400)
                .json({ message: "Producto no encontrado en el catálogo" });
        }
        if (error.message === "PAYLOAD_TOO_LARGE") {
            return res.status(400).json({ message: "El payload excede los 16KB" });
        }
        res.status(500).json({ message: "Error al crear la orden" });
    }
};
exports.createOrder = createOrder;
const getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderService_1.orderService.getOrderById(orderId);
        res.status(200).json(order);
    }
    catch (error) {
        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.status(500).json({ message: "Error al obtener la orden" });
    }
};
exports.getOrder = getOrder;
const getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await orderService_1.orderService.getOrdersByUserId(userId);
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener las órdenes" });
    }
};
exports.getOrdersByUser = getOrdersByUser;
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await orderService_1.orderService.updateOrderStatus(orderId, status);
        res.status(200).json(order);
    }
    catch (error) {
        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.status(500).json({ message: "Error al actualizar la orden" });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=orderHandler.js.map