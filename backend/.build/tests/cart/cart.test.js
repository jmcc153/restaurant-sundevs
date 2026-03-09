"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock("@/models/cart", () => {
    const mockLean = vitest_1.vi.fn();
    const mockSave = vitest_1.vi.fn();
    const mockFindOne = vitest_1.vi.fn(() => ({ lean: mockLean }));
    const mockFindOneAndUpdate = vitest_1.vi.fn(() => ({ lean: mockLean }));
    return {
        Cart: {
            findOne: mockFindOne,
            findOneAndUpdate: mockFindOneAndUpdate,
            mockSave,
        },
    };
});
vitest_1.vi.mock("@/models/event", () => {
    const mockSave = vitest_1.vi.fn().mockResolvedValue({});
    const MockEvent = vitest_1.vi.fn(function (data) {
        Object.assign(this, data);
        this.save = mockSave;
    });
    return { Event: MockEvent };
});
vitest_1.vi.mock("uuid", () => ({ v4: vitest_1.vi.fn(() => "mock-uuid") }));
const cart_1 = require("@/models/cart");
const cartRepository_1 = require("@/repository/cartRepository");
const cartService_1 = require("@/services/cartService");
const cartHandler_1 = require("@/handlers/cartHandler");
const getMocks = () => {
    const findOne = cart_1.Cart.findOne;
    const findOneAndUpdate = cart_1.Cart.findOneAndUpdate;
    const lean = vitest_1.vi.fn();
    findOne.mockReturnValue({ lean });
    findOneAndUpdate.mockReturnValue({ lean });
    return { findOne, findOneAndUpdate, lean };
};
const createRes = () => {
    const res = {};
    res.status = vitest_1.vi.fn().mockReturnValue(res);
    res.json = vitest_1.vi.fn().mockReturnValue(res);
    return res;
};
const mockItem = {
    cartItemId: "cart-1",
    productId: "prod-1",
    name: "Pizza",
    description: "Deliciosa",
    basePrice: 1000,
    image: "/pizza.jpg",
    selectedModifiers: [],
    modifierGroups: [],
    quantity: 2,
    subtotal: 2000,
};
const mockCart = { userId: "user-1", items: [mockItem] };
(0, vitest_1.describe)("Cart Domain - Unit Tests", () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.describe)("Repository Layer", () => {
        (0, vitest_1.it)("findByUserId: debe buscar con el userId correcto", async () => {
            const { findOne, lean } = getMocks();
            lean.mockResolvedValue(mockCart);
            const result = await cartRepository_1.cartRepository.findByUserId("user-1");
            (0, vitest_1.expect)(findOne).toHaveBeenCalledWith({ userId: "user-1" });
            (0, vitest_1.expect)(result).toEqual(mockCart);
        });
        (0, vitest_1.it)("save: debe llamar findOneAndUpdate con upsert", async () => {
            const { findOneAndUpdate, lean } = getMocks();
            lean.mockResolvedValue(mockCart);
            await cartRepository_1.cartRepository.save("user-1", [mockItem]);
            (0, vitest_1.expect)(findOneAndUpdate).toHaveBeenCalledWith({ userId: "user-1" }, { userId: "user-1", items: [mockItem] }, vitest_1.expect.objectContaining({ upsert: true }));
        });
        (0, vitest_1.it)("clear: debe vaciar los items del carrito", async () => {
            const { findOneAndUpdate, lean } = getMocks();
            lean.mockResolvedValue({ ...mockCart, items: [] });
            await cartRepository_1.cartRepository.clear("user-1");
            (0, vitest_1.expect)(findOneAndUpdate).toHaveBeenCalledWith({ userId: "user-1" }, { items: [] }, vitest_1.expect.anything());
        });
        (0, vitest_1.it)("removeItem: debe usar $pull con el cartItemId correcto", async () => {
            const { findOneAndUpdate, lean } = getMocks();
            lean.mockResolvedValue(mockCart);
            await cartRepository_1.cartRepository.removeItem("user-1", "cart-1");
            (0, vitest_1.expect)(findOneAndUpdate).toHaveBeenCalledWith({ userId: "user-1" }, { $pull: { items: { cartItemId: "cart-1" } } }, vitest_1.expect.anything());
        });
    });
    (0, vitest_1.describe)("Service Layer", () => {
        (0, vitest_1.it)("getCartByUserId: retorna el carrito del usuario", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValue(mockCart);
            const result = await cartService_1.cartService.getCartByUserId("user-1");
            (0, vitest_1.expect)(result).toEqual(mockCart);
        });
        (0, vitest_1.it)("addItemToCart: agrega item a carrito existente", async () => {
            const { findOne, findOneAndUpdate, lean } = getMocks();
            lean.mockResolvedValueOnce(mockCart);
            lean.mockResolvedValueOnce({
                ...mockCart,
                items: [...mockCart.items, mockItem],
            });
            const newItem = { ...mockItem, cartItemId: "cart-2" };
            const result = await cartService_1.cartService.addItemToCart("user-1", newItem, "corr-1");
            (0, vitest_1.expect)(findOne).toHaveBeenCalled();
            (0, vitest_1.expect)(findOneAndUpdate).toHaveBeenCalled();
            (0, vitest_1.expect)(result?.items).toHaveLength(2);
        });
        (0, vitest_1.it)("addItemToCart: crea carrito si no existía", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValueOnce(null);
            lean.mockResolvedValueOnce({ userId: "user-1", items: [mockItem] });
            const result = await cartService_1.cartService.addItemToCart("user-1", mockItem, "corr-1");
            (0, vitest_1.expect)(result?.items).toHaveLength(1);
        });
        (0, vitest_1.it)("updateCartItem: actualiza item existente", async () => {
            const { lean } = getMocks();
            const updatedItem = { ...mockItem, quantity: 5, subtotal: 5000 };
            lean.mockResolvedValueOnce(mockCart);
            lean.mockResolvedValueOnce({ ...mockCart, items: [updatedItem] });
            const result = await cartService_1.cartService.updateCartItem("user-1", updatedItem, "corr-1");
            (0, vitest_1.expect)(result?.items[0].quantity).toBe(5);
        });
        (0, vitest_1.it)("removeCartItem: elimina item y guarda evento", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValue({ ...mockCart, items: [] });
            const result = await cartService_1.cartService.removeCartItem("user-1", "cart-1", "corr-1");
            (0, vitest_1.expect)(result?.items).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)("Handler Layer", () => {
        (0, vitest_1.it)("getCart: responde 200 con el carrito", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValue(mockCart);
            const req = { params: { userId: "user-1" } };
            const res = createRes();
            await (0, cartHandler_1.getCart)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(mockCart);
        });
        (0, vitest_1.it)("getCart: responde 500 en error", async () => {
            const { lean } = getMocks();
            lean.mockRejectedValue(new Error("DB error"));
            const req = { params: { userId: "user-1" } };
            const res = createRes();
            await (0, cartHandler_1.getCart)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                message: "Error al obtener el carrito",
            });
        });
        (0, vitest_1.it)("addItem: responde 200 con carrito actualizado", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValueOnce(mockCart);
            lean.mockResolvedValueOnce(mockCart);
            const req = {
                body: { userId: "user-1", item: mockItem, correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, cartHandler_1.addItem)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
        });
        (0, vitest_1.it)("addItem: responde 400 si payload es muy grande", async () => {
            const { lean } = getMocks();
            lean.mockRejectedValue(new Error("PAYLOAD_TOO_LARGE"));
            const req = {
                body: { userId: "user-1", item: mockItem, correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, cartHandler_1.addItem)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                message: "El item excede los 16KB",
            });
        });
        (0, vitest_1.it)("updateItem: responde 200 con carrito actualizado", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValueOnce(mockCart);
            lean.mockResolvedValueOnce(mockCart);
            const req = {
                body: { userId: "user-1", item: mockItem, correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, cartHandler_1.updateItem)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
        });
        (0, vitest_1.it)("updateItem: responde 500 en error", async () => {
            const { lean } = getMocks();
            lean.mockRejectedValue(new Error("DB error"));
            const req = {
                body: { userId: "user-1", item: mockItem, correlationId: "corr-1" },
            };
            const res = createRes();
            await (0, cartHandler_1.updateItem)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
        });
        (0, vitest_1.it)("deleteItem: responde 200 al eliminar", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValue({ ...mockCart, items: [] });
            const req = {
                body: {
                    userId: "user-1",
                    cartItemId: "cart-1",
                    correlationId: "corr-1",
                },
            };
            const res = createRes();
            await (0, cartHandler_1.deleteItem)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(200);
        });
        (0, vitest_1.it)("deleteItem: responde 500 en error", async () => {
            const { lean } = getMocks();
            lean.mockRejectedValue(new Error("DB error"));
            const req = {
                body: {
                    userId: "user-1",
                    cartItemId: "cart-1",
                    correlationId: "corr-1",
                },
            };
            const res = createRes();
            await (0, cartHandler_1.deleteItem)(req, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
        });
    });
});
//# sourceMappingURL=cart.test.js.map