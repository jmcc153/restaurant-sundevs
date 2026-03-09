import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("@/models/product", () => {
  const mockLean = vi.fn();
  const mockFind = vi.fn(() => ({ lean: mockLean }));
  const mockFindOne = vi.fn(() => ({ lean: mockLean }));

  return {
    Product: {
      find: mockFind,
      findOne: mockFindOne,
    },
  };
});

import { Product } from "@/models/product";
import { productRepository } from "@/repository/menuRepository";
import { menuService } from "@/services/menuService";
import { getMenu } from "@/handlers/menuHandler";

describe("Menu Domain - Unit Tests", () => {
  const getMocks = () => {
    const find = Product.find as any;
    const findOne = Product.findOne as any;
    const lean = find().lean;
    return { find, findOne, lean };
  };

  const createMockResponse = () => {
    const res = {} as any;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { find, findOne, lean } = getMocks();
    find.mockClear();
    findOne.mockClear();
    lean.mockClear();
  });

  describe("Repository Layer", () => {
    it("getAllProducts: debe llamar a find().lean()", async () => {
      const { lean, find } = getMocks();
      const mockData = [{ name: "Burger" }];
      lean.mockResolvedValue(mockData);

      const result = await productRepository.getAllProducts();

      expect(result).toEqual(mockData);
      expect(find).toHaveBeenCalled();
    });

    it("getProductById: debe buscar con el filtro correcto", async () => {
      const { lean, findOne } = getMocks();
      lean.mockResolvedValue({ id: "1" });

      await productRepository.getProductById("1");

      expect(findOne).toHaveBeenCalledWith({ id: "1" });
    });
  });

  describe("Service Layer", () => {
    it("getAvailableMenu: debe retornar lo que diga el repo", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValue([{ name: "Pizza" }]);

      const result = await menuService.getAvailableMenu();

      expect(result[0].name).toBe("Pizza");
    });
  });

  describe("Handler Layer", () => {
    it("getMenu: debe responder 200 y json", async () => {
      const { lean } = getMocks();
      lean.mockResolvedValue([]);

      const res = createMockResponse();
      await getMenu({} as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("getMenu: debe responder 500 en error", async () => {
      const { lean } = getMocks();
      lean.mockRejectedValue(new Error("Crash"));

      const res = createMockResponse();
      await getMenu({} as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al recuperar el menú",
      });
    });
  });
});
