import { Request, Response } from "express";
import { menuService } from "../services/menuService";

export const getMenu = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.getAvailableMenu();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar el menú" });
  }
};
