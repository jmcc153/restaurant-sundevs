"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
const EventTypes = [
    "CART_ITEM_ADDED",
    "CART_ITEM_UPDATED",
    "CART_ITEM_REMOVED",
    "PRICING_CALCULATED",
    "ORDER_PLACED",
    "ORDER_STATUS_CHANGED",
    "VALIDATION_FAILED",
];
const EventSources = ["web", "api", "worker"];
const EventSchema = new mongoose_1.Schema({
    eventId: { type: String, required: true, unique: true },
    timestamp: { type: Date, required: true },
    orderId: { type: String },
    userId: { type: String, required: true },
    type: { type: String, required: true, enum: EventTypes },
    source: { type: String, required: true, enum: EventSources },
    correlationId: { type: String, required: true },
    payload: { type: mongoose_1.Schema.Types.Mixed, required: true },
});
exports.Event = (0, mongoose_1.model)("Event", EventSchema);
//# sourceMappingURL=event.js.map