"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock("@/models/product", () => {
    const mockLean = vitest_1.vi.fn();
    const mockFind = vitest_1.vi.fn(() => ({ lean: mockLean }));
    const mockFindOne = vitest_1.vi.fn(() => ({ lean: mockLean }));
    return {
        Product: {
            find: mockFind,
            findOne: mockFindOne,
        },
    };
});
const product_1 = require("@/models/product");
const menuRepository_1 = require("@/repository/menuRepository");
const menuService_1 = require("@/services/menuService");
const menuHandler_1 = require("@/handlers/menuHandler");
(0, vitest_1.describe)("Menu Domain - Unit Tests", () => {
    const getMocks = () => {
        const find = product_1.Product.find;
        const findOne = product_1.Product.findOne;
        const lean = find().lean;
        return { find, findOne, lean };
    };
    const createMockResponse = () => {
        const res = {};
        res.status = vitest_1.vi.fn().mockReturnValue(res);
        res.json = vitest_1.vi.fn().mockReturnValue(res);
        return res;
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        const { find, findOne, lean } = getMocks();
        find.mockClear();
        findOne.mockClear();
        lean.mockClear();
    });
    (0, vitest_1.describe)("Repository Layer", () => {
        (0, vitest_1.it)("getAllProducts: debe llamar a find().lean()", async () => {
            const { lean, find } = getMocks();
            const mockData = [{ name: "Burger" }];
            lean.mockResolvedValue(mockData);
            const result = await menuRepository_1.productRepository.getAllProducts();
            (0, vitest_1.expect)(result).toEqual(mockData);
            (0, vitest_1.expect)(find).toHaveBeenCalled();
        });
        (0, vitest_1.it)("getProductById: debe buscar con el filtro correcto", async () => {
            const { lean, findOne } = getMocks();
            lean.mockResolvedValue({ id: "1" });
            await menuRepository_1.productRepository.getProductById("1");
            (0, vitest_1.expect)(findOne).toHaveBeenCalledWith({ id: "1" });
        });
    });
    (0, vitest_1.describe)("Service Layer", () => {
        (0, vitest_1.it)("getAvailableMenu: debe retornar lo que diga el repo", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValue([{ name: "Pizza" }]);
            const result = await menuService_1.menuService.getAvailableMenu();
            (0, vitest_1.expect)(result[0].name).toBe("Pizza");
        });
    });
    (0, vitest_1.describe)("Handler Layer", () => {
        (0, vitest_1.it)("getMenu: debe responder 200 y json", async () => {
            const { lean } = getMocks();
            lean.mockResolvedValue([]);
            const res = createMockResponse();
            await (0, menuHandler_1.getMenu)({}, res);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith([]);
        });
        (0, vitest_1.it)("getMenu: debe responder 500 en error", async () => {
            const { lean } = getMocks();
            lean.mockRejectedValue(new Error("Crash"));
            const res = createMockResponse();
            await (0, menuHandler_1.getMenu)({}, res);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                message: "Error al recuperar el menú",
            });
        });
    });
});
//# sourceMappingURL=menu.test.js.map