"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsByCorrelationId = exports.getTimeline = void 0;
const eventService_1 = require("../services/eventService");
const orderService_1 = require("../services/orderService");
const getTimeline = async (req, res) => {
    try {
        const { orderId } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 50));
        const order = await orderService_1.orderService.getOrderById(orderId);
        const timeline = await eventService_1.eventService.getTimeline(order.correlationId, page, pageSize);
        res.status(200).json(timeline);
    }
    catch (error) {
        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.status(500).json({ message: "Error al obtener el timeline" });
    }
};
exports.getTimeline = getTimeline;
const getEventsByCorrelationId = async (req, res) => {
    try {
        const { correlationId } = req.params;
        const events = await eventService_1.eventService.findByCorrelationId(correlationId);
        res.status(200).json(events);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error al obtener eventos por Correlation ID" });
    }
};
exports.getEventsByCorrelationId = getEventsByCorrelationId;
//# sourceMappingURL=eventHandler.js.map