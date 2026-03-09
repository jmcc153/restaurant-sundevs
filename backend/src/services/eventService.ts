import { eventRepository } from "@/repository/eventRepository";

export const eventService = {
  getTimeline: async (
    correlationId: string,
    page: number = 1,
    pageSize: number = 10,
  ) => {
    return await eventRepository.getTimeline(correlationId, page, pageSize);
  },
  findByCorrelationId: async (correlationId: string) => {
    return await eventRepository.findByCorrelationId(correlationId);
  },
};
