import { Schema, model } from "mongoose";

const EventTypes = [
  "CART_ITEM_ADDED",
  "CART_ITEM_UPDATED",
  "CART_ITEM_REMOVED",
  "PRICING_CALCULATED",
  "ORDER_PLACED",
  "ORDER_STATUS_CHANGED",
  "VALIDATION_FAILED",
] as const;

const EventSources = ["web", "api", "worker"] as const;

export type EventType = (typeof EventTypes)[number];
export type EventSource = (typeof EventSources)[number];

const EventSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  timestamp: { type: Date, required: true },
  orderId: { type: String },
  userId: { type: String, required: true },
  type: { type: String, required: true, enum: EventTypes },
  source: { type: String, required: true, enum: EventSources },
  correlationId: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
});

export const Event = model("Event", EventSchema);
