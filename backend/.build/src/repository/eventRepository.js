"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRepository = void 0;
const event_1 = require("../models/event");
const uuid_1 = require("uuid");
exports.eventRepository = {
    save: async (eventData) => {
        const payloadString = JSON.stringify(eventData.payload);
        const sizeInBytes = Buffer.byteLength(payloadString, "utf8");
        if (sizeInBytes > 16384) {
            throw new Error("PAYLOAD_TOO_LARGE");
        }
        const newEvent = new event_1.Event({
            ...eventData,
            eventId: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
        });
        return await newEvent.save();
    },
    getTimeline: async (correlationId, page = 1, pageSize = 10) => {
        const skip = (page - 1) * pageSize;
        const clampedSize = Math.min(pageSize, 10);
        const [events, totalCount] = await Promise.all([
            event_1.Event.find({ correlationId })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(clampedSize)
                .lean(),
            event_1.Event.countDocuments({ correlationId }),
        ]);
        return {
            events,
            page,
            pageSize: clampedSize,
            totalCount,
            totalPages: Math.ceil(totalCount / clampedSize),
        };
    },
    findByCorrelationId: async (correlationId) => {
        return await event_1.Event.find({ correlationId }).sort({ timestamp: 1 }).lean();
    },
};
//# sourceMappingURL=eventRepository.js.map