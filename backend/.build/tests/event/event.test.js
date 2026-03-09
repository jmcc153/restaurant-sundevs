"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock("@/models/event", () => {
    const mockSave = vitest_1.vi.fn().mockResolvedValue({});
    const mockFind = vitest_1.vi.fn();
    const mockCountDocuments = vitest_1.vi.fn();
    const MockEvent = vitest_1.vi.fn(function (data) {
        Object.assign(this, data);
        this.save = mockSave;
    });
    Object.assign(MockEvent, {
        find: mockFind,
        countDocuments: mockCountDocuments,
    });
    return { Event: MockEvent };
});
vitest_1.vi.mock("@/models/order", () => {
    const mockLean = vitest_1.vi.fn();
    return {
        Order: {
            findOne: vitest_1.vi.fn(() => ({ lean: mockLean })),
            find: vitest_1.vi.fn(() => ({ sort: vitest_1.vi.fn(() => ({ lean: mockLean })) })),
            findOneAndUpdate: vitest_1.vi.fn(() => ({ lean: mockLean })),
        },
    };
});
vitest_1.vi.mock("uuid", () => ({ v4: vitest_1.vi.fn(() => "event-uuid-123") }));
const event_1 = require("@/models/event");
const order_1 = require("@/models/order");
const eventRepository_1 = require("@/repository/eventRepository");
const eventService_1 = require("@/services/eventService");
const eventHandler_1 = require("@/handlers/eventHandler");
const getEventMocks = () => {
    const find = event_1.Event.find;
    const countDocuments = event_1.Event.countDocuments;
    const EventConstructor = event_1.Event;
    const saveMock = EventConstructor.mock?.results?.[0]?.value?.save ?? vitest_1.vi.fn();
    return { find, countDocuments, saveMock };
};
const getOrderMocks = () => {
    const findOne = order_1.Order.findOne;
    const lean = vitest_1.vi.fn();
    findOne.mockReturnValue({ lean });
    return { findOne, lean };
};
const createRes = () => {
    const res = {};
    res.status = vitest_1.vi.fn().mockReturnValue(res);
    res.json = vitest_1.vi.fn().mockReturnValue(res);
    return res;
};
const mockEventData = {
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
(0, vitest_1.describe)("Event Domain - Unit Tests", () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.describe)("Repository Layer", () => {
        (0, vitest_1.it)("save: lanza PAYLOAD_TOO_LARGE si payload supera 16KB", async () => {
            const bigPayload = { data: "x".repeat(17000) };
            const eventData = { ...mockEventData, payload: bigPayload };
            await (0, vitest_1.expect)(eventRepository_1.eventRepository.save(eventData)).rejects.toThrow("PAYLOAD_TOO_LARGE");
        });
        (0, vitest_1.it)("save: crea y guarda evento con UUID generado", async () => {
            const saveMock = vitest_1.vi.fn().mockResolvedValue(mockEvent);
            vitest_1.vi.mocked(event_1.Event).mockImplementationOnce(function (data) {
                Object.assign(this, data);
                this.save = saveMock;
            });
            await eventRepository_1.eventRepository.save(mockEventData);
            (0, vitest_1.expect)(vitest_1.vi.mocked(event_1.Event)).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                eventId: "event-uuid-123",
                userId: "user-1",
                type: "ORDER_PLACED",
            }));
            (0, vitest_1.expect)(saveMock).toHaveBeenCalled();
        });
        (0, vitest_1.it)("getTimeline: pagina correctamente con page y pageSize", async () => {
            const { find, countDocuments } = getEventMocks();
            const leanMock = vitest_1.vi.fn().mockResolvedValue([mockEvent]);
            const limitMock = vitest_1.vi.fn(() => ({ lean: leanMock }));
            const skipMock = vitest_1.vi.fn(() => ({ limit: limitMock }));
            const sortMock = vitest_1.vi.fn(() => ({ skip: skipMock }));
            find.mockReturnValue({ sort: sortMock });
            countDocuments.mockResolvedValue(15);
            const result = await eventRepository_1.eventRepository.getTimeline("corr-1", 2, 5);
            (0, vitest_1.expect)(find).toHaveBeenCalledWith({ correlationId: "corr-1" });
            (0, vitest_1.expect)(skipMock).toHaveBeenCalledWith(5);
            (0, vitest_1.expect)(result.page).toBe(2);
            (0, vitest_1.expect)(result.totalPages).toBe(3);
        });
        (0, vitest_1.it)("getTimeline: clampea pageSize a máximo 10", async () => {
            const { find, countDocuments } = getEventMocks();
            const leanMock = vitest_1.vi.fn().mockResolvedValue([]);
            const limitMock = vitest_1.vi.fn(() => ({ lean: leanMock }));
            const skipMock = vitest_1.vi.fn(() => ({ limit: limitMock }));
            find.mockReturnValue({ sort: vitest_1.vi.fn(() => ({ skip: skipMock })) });
            countDocuments.mockResolvedValue(0);
            await eventRepository_1.eventRepository.getTimeline("corr-1", 1, 100);
            (0, vitest_1.expect)(limitMock).toHaveBeenCalledWith(10);
        });
        (0, vitest_1.it)("findByCorrelationId: busca y ordena por timestamp asc", async () => {
            const { find } = getEventMocks();
            const leanMock = vitest_1.vi.fn().mockResolvedValue([mockEvent]);
            const sortMock = vitest_1.vi.fn(() => ({ lean: leanMock }));
            find.mockReturnValue({ sort: sortMock });
            await eventRepository_1.eventRepository.findByCorrelationId("corr-1");
            (0, vitest_1.expect)(find).toHaveBeenCalledWith({ correlationId: "corr-1" });
            (0, vitest_1.expect)(sortMock).toHaveBeenCalledWith({ timestamp: 1 });
        });
    });
    (0, vitest_1.describe)("Service Layer", () => {
        (0, vitest_1.it)("getTimeline: delega al repo con los parámetros correctos", async () => {
            const { find, countDocuments } = getEventMocks();
            const leanMock = vitest_1.vi.fn().mockResolvedValue([mockEvent]);
            const limitMock = vitest_1.vi.fn(() => ({ lean: leanMock }));
            const skipMock = vitest_1.vi.fn(() => ({ limit: limitMock }));
            find.mockReturnValue({ sort: vitest_1.vi.fn(() => ({ skip: skipMock })) });
            countDocuments.mockResolvedValue(1);
            const result = await eventService_1.eventService.getTimeline("corr-1", 1, 10);
            (0, vitest_1.expect)(result.events).toHaveLength(1);
            (0, vitest_1.expect)(result.page).toBe(1);
        });
        (0, vitest_1.it)("findByCorrelationId: retorna eventos del correlationId", async () => {
            const { find } = getEventMocks();
            const leanMock = vitest_1.vi.fn().mockResolvedValue([mockEvent]);
            find.mockReturnValue({ sort: vitest_1.vi.fn(() => ({ lean: leanMock })) });
            const result = await eventService_1.eventService.findByCorrelationId("corr-1");
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].correlationId).toBe("corr-1");
        });
    });
    (0, vitest_1.describe)("Handler Layer", () => {
        (0, vitest_1.it)("getTimeline: responde 200 con el timeline de la orden", async () => {
            const { lean: orderLean } = getOrderMocks();
            const { find, countDocuments } = getEventMocks();
            orderLean.mockResolvedValue(mockOrder);
            const leanMock = vitest_1.vi.fn().mockResolvedValue([mockEvent]);
            const limitMock = vitest_1.vi.fn(() => ({ lean: leanMock }));
            const skipMock = vitest_1.vi.fn(() => ({ limit: limitMock }));
            find.mockReturnValue({ sort: vitest_1.vi.fn(() => ({ skip: skipMock })) });
            countDocuments.mockResolvedValue(1);
            const req = {
                params: { orderId: "order-1" },
                query: { page: "1", pageSize: "10" },
            };
            const res = createRes();
            await (0, eventHandler_1.getTimeline)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ events: [mockEvent] }));
        });
        (0, vitest_1.it)("getTimeline: responde 404 si orden no existe", async () => {
            const { lean: orderLean } = getOrderMocks();
            orderLean.mockResolvedValue(null);
            const req = {
                params: { orderId: "no-existe" },
                query: {},
            };
            const res = createRes();
            await (0, eventHandler_1.getTimeline)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(404);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                message: "Orden no encontrada",
            });
        });
        (0, vitest_1.it)("getTimeline: responde 500 en error inesperado", async () => {
            const { lean: orderLean } = getOrderMocks();
            orderLean.mockRejectedValue(new Error("DB crash"));
            const req = {
                params: { orderId: "order-1" },
                query: {},
            };
            const res = createRes();
            await (0, eventHandler_1.getTimeline)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
        });
        (0, vitest_1.it)("getEventsByCorrelationId: responde 200 con eventos", async () => {
            const { find } = getEventMocks();
            const leanMock = vitest_1.vi.fn().mockResolvedValue([mockEvent]);
            find.mockReturnValue({ sort: vitest_1.vi.fn(() => ({ lean: leanMock })) });
            const req = {
                params: { correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, eventHandler_1.getEventsByCorrelationId)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith([mockEvent]);
        });
        (0, vitest_1.it)("getEventsByCorrelationId: responde 500 en error", async () => {
            const { find } = getEventMocks();
            find.mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const req = {
                params: { correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, eventHandler_1.getEventsByCorrelationId)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
        });
    });
});
//# sourceMappingURL=event.test.js.map