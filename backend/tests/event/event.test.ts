import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("@/models/event", () => {
  const mockSave = vi.fn().mockResolvedValue({});
  const mockFind = vi.fn();
  const mockCountDocuments = vi.fn();

  const MockEvent = vi.fn(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = mockSave;
  });

  Object.assign(MockEvent, {
    find: mockFind,
    countDocuments: mockCountDocuments,
  });

  return { Event: MockEvent };
});

vi.mock("@/models/order", () => {
  const mockLean = vi.fn();
  return {
    Order: {
      findOne: vi.fn(() => ({ lean: mockLean })),
      find: vi.fn(() => ({ sort: vi.fn(() => ({ lean: mockLean })) })),
      findOneAndUpdate: vi.fn(() => ({ lean: mockLean })),
    },
  };
});

vi.mock("uuid", () => ({ v4: vi.fn(() => "event-uuid-123") }));

import { Event } from "@/models/event";
import { Order } from "@/models/order";
import { eventRepository } from "@/repository/eventRepository";
import { eventService } from "@/services/eventService";
import { getTimeline, getEventsByCorrelationId } from "@/handlers/eventHandler";
import type { EventData } from "@/types/event";

const getEventMocks = () => {
  const find = Event.find as ReturnType<typeof vi.fn>;
  const countDocuments = Event.countDocuments as ReturnType<typeof vi.fn>;
  const EventConstructor = Event as unknown as ReturnType<typeof vi.fn>;
  const saveMock = EventConstructor.mock?.results?.[0]?.value?.save ?? vi.fn();
  return { find, countDocuments, saveMock };
};

const getOrderMocks = () => {
  const findOne = Order.findOne as ReturnType<typeof vi.fn>;
  const lean = vi.fn();
  findOne.mockReturnValue({ lean });
  return { findOne, lean };
};

const createRes = () => {
  const res = {} as Response;
  (res as any).status = vi.fn().mockReturnValue(res);
  (res as any).json = vi.fn().mockReturnValue(res);
  return res;
};

const mockEventData: EventData = {
  userId: "user-1",
  type: "ORDER_PLACED",
  correlationId: "corr-1",
  payload: { orderId: "order-1" },
  source: "api",
  orderId: "order-1",
};

const mockEvent = {
  eventId: "event-uuid-123",
  timestamp: new Date().toISOString(),
  orderId: "order-1",
  userId: "user-1",
  type: "ORDER_PLACED",
  source: "api",
  correlationId: "corr-1",
  payload: { orderId: "order-1" },
};

const mockOrder = {
  orderId: "order-1",
  correlationId: "corr-1",
  userId: "user-1",
  status: "PENDING",
  total: 2000,
  items: [],
  idempotencyKey: "idem-1",
};

describe("Event Domain - Unit Tests", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("Repository Layer", () => {
    it("save: lanza PAYLOAD_TOO_LARGE si payload supera 16KB", async () => {
      const bigPayload = { data: "x".repeat(17000) };
      const eventData: EventData = { ...mockEventData, payload: bigPayload };

      await expect(eventRepository.save(eventData)).rejects.toThrow(
        "PAYLOAD_TOO_LARGE",
      );
    });

    it("save: crea y guarda evento con UUID generado", async () => {
      const saveMock = vi.fn().mockResolvedValue(mockEvent);

      vi.mocked(Event).mockImplementationOnce(function (this: any, data: any) {
        Object.assign(this, data);
        this.save = saveMock;
      } as any);

      await eventRepository.save(mockEventData);

      expect(vi.mocked(Event)).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: "event-uuid-123",
          userId: "user-1",
          type: "ORDER_PLACED",
        }),
      );
      expect(saveMock).toHaveBeenCalled();
    });

    it("getTimeline: pagina correctamente con page y pageSize", async () => {
      const { find, countDocuments } = getEventMocks();

      const leanMock = vi.fn().mockResolvedValue([mockEvent]);
      const limitMock = vi.fn(() => ({ lean: leanMock }));
      const skipMock = vi.fn(() => ({ limit: limitMock }));
      const sortMock = vi.fn(() => ({ skip: skipMock }));
      find.mockReturnValue({ sort: sortMock });
      countDocuments.mockResolvedValue(15);

      const result = await eventRepository.getTimeline("corr-1", 2, 5);

      expect(find).toHaveBeenCalledWith({ correlationId: "corr-1" });
      expect(skipMock).toHaveBeenCalledWith(5);
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it("getTimeline: clampea pageSize a máximo 10", async () => {
      const { find, countDocuments } = getEventMocks();

      const leanMock = vi.fn().mockResolvedValue([]);
      const limitMock = vi.fn(() => ({ lean: leanMock }));
      const skipMock = vi.fn(() => ({ limit: limitMock }));
      find.mockReturnValue({ sort: vi.fn(() => ({ skip: skipMock })) });
      countDocuments.mockResolvedValue(0);

      await eventRepository.getTimeline("corr-1", 1, 100);

      expect(limitMock).toHaveBeenCalledWith(10);
    });

    it("findByCorrelationId: busca y ordena por timestamp asc", async () => {
      const { find } = getEventMocks();
      const leanMock = vi.fn().mockResolvedValue([mockEvent]);
      const sortMock = vi.fn(() => ({ lean: leanMock }));
      find.mockReturnValue({ sort: sortMock });

      await eventRepository.findByCorrelationId("corr-1");

      expect(find).toHaveBeenCalledWith({ correlationId: "corr-1" });
      expect(sortMock).toHaveBeenCalledWith({ timestamp: 1 });
    });
  });

  describe("Service Layer", () => {
    it("getTimeline: delega al repo con los parámetros correctos", async () => {
      const { find, countDocuments } = getEventMocks();
      const leanMock = vi.fn().mockResolvedValue([mockEvent]);
      const limitMock = vi.fn(() => ({ lean: leanMock }));
      const skipMock = vi.fn(() => ({ limit: limitMock }));
      find.mockReturnValue({ sort: vi.fn(() => ({ skip: skipMock })) });
      countDocuments.mockResolvedValue(1);

      const result = await eventService.getTimeline("corr-1", 1, 10);

      expect(result.events).toHaveLength(1);
      expect(result.page).toBe(1);
    });

    it("findByCorrelationId: retorna eventos del correlationId", async () => {
      const { find } = getEventMocks();
      const leanMock = vi.fn().mockResolvedValue([mockEvent]);
      find.mockReturnValue({ sort: vi.fn(() => ({ lean: leanMock })) });

      const result = await eventService.findByCorrelationId("corr-1");

      expect(result).toHaveLength(1);
      expect(result[0].correlationId).toBe("corr-1");
    });
  });

  describe("Handler Layer", () => {
    it("getTimeline: responde 200 con el timeline de la orden", async () => {
      const { lean: orderLean } = getOrderMocks();
      const { find, countDocuments } = getEventMocks();

      orderLean.mockResolvedValue(mockOrder);

      const leanMock = vi.fn().mockResolvedValue([mockEvent]);
      const limitMock = vi.fn(() => ({ lean: leanMock }));
      const skipMock = vi.fn(() => ({ limit: limitMock }));
      find.mockReturnValue({ sort: vi.fn(() => ({ skip: skipMock })) });
      countDocuments.mockResolvedValue(1);

      const req = {
        params: { orderId: "order-1" },
        query: { page: "1", pageSize: "10" },
      } as unknown as Request<{ orderId: string }>;
      const res = createRes();

      await getTimeline(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
      expect((res as any).json).toHaveBeenCalledWith(
        expect.objectContaining({ events: [mockEvent] }),
      );
    });

    it("getTimeline: responde 404 si orden no existe", async () => {
      const { lean: orderLean } = getOrderMocks();
      orderLean.mockResolvedValue(null);

      const req = {
        params: { orderId: "no-existe" },
        query: {},
      } as unknown as Request<{ orderId: string }>;
      const res = createRes();

      await getTimeline(req, res);

      expect((res as any).status).toHaveBeenCalledWith(404);
      expect((res as any).json).toHaveBeenCalledWith({
        message: "Orden no encontrada",
      });
    });

    it("getTimeline: responde 500 en error inesperado", async () => {
      const { lean: orderLean } = getOrderMocks();
      orderLean.mockRejectedValue(new Error("DB crash"));

      const req = {
        params: { orderId: "order-1" },
        query: {},
      } as unknown as Request<{ orderId: string }>;
      const res = createRes();

      await getTimeline(req, res);

      expect((res as any).status).toHaveBeenCalledWith(500);
    });

    it("getEventsByCorrelationId: responde 200 con eventos", async () => {
      const { find } = getEventMocks();
      const leanMock = vi.fn().mockResolvedValue([mockEvent]);
      find.mockReturnValue({ sort: vi.fn(() => ({ lean: leanMock })) });

      const req = {
        params: { correlationId: "corr-1" },
      } as Request<{ correlationId: string }>;
      const res = createRes();

      await getEventsByCorrelationId(req, res);

      expect((res as any).status).toHaveBeenCalledWith(200);
      expect((res as any).json).toHaveBeenCalledWith([mockEvent]);
    });

    it("getEventsByCorrelationId: responde 500 en error", async () => {
      const { find } = getEventMocks();
      find.mockImplementationOnce(() => {
        throw new Error("DB error");
      });

      const req = {
        params: { correlationId: "corr-1" },
      } as Request<{ correlationId: string }>;
      const res = createRes();

      await getEventsByCorrelationId(req, res);

      expect((res as any).status).toHaveBeenCalledWith(500);
    });
  });
});
