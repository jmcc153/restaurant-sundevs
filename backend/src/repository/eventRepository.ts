import { Event } from "../models/event";
import { EventData } from "../types/event";
import { v4 as uuidv4 } from "uuid";

export const eventRepository = {
  save: async (eventData: EventData) => {
    const payloadString = JSON.stringify(eventData.payload);
    const sizeInBytes = Buffer.byteLength(payloadString, "utf8");

    if (sizeInBytes > 16384) {
      throw new Error("PAYLOAD_TOO_LARGE");
    }

    const newEvent = new Event({
      ...eventData,
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
    });

    return await newEvent.save();
  },

  getTimeline: async (
    correlationId: string,
    page: number = 1,
    pageSize: number = 10,
  ) => {
    const skip = (page - 1) * pageSize;
    const clampedSize = Math.min(pageSize, 10);

    const [events, totalCount] = await Promise.all([
      Event.find({ correlationId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(clampedSize)
        .lean(),
      Event.countDocuments({ correlationId }),
    ]);

    return {
      events,
      page,
      pageSize: clampedSize,
      totalCount,
      totalPages: Math.ceil(totalCount / clampedSize),
    };
  },

  findByCorrelationId: async (correlationId: string) => {
    return await Event.find({ correlationId }).sort({ timestamp: 1 }).lean();
  },
};
