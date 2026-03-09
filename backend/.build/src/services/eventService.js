"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventService = void 0;
const eventRepository_1 = require("@/repository/eventRepository");
exports.eventService = {
    getTimeline: async (correlationId, page = 1, pageSize = 10) => {
        return await eventRepository_1.eventRepository.getTimeline(correlationId, page, pageSize);
    },
    findByCorrelationId: async (correlationId) => {
        return await eventRepository_1.eventRepository.findByCorrelationId(correlationId);
    },
};
//# sourceMappingURL=eventService.js.map