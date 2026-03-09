"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenu = void 0;
const menuService_1 = require("../services/menuService");
const getMenu = async (req, res) => {
    try {
        const menu = await menuService_1.menuService.getAvailableMenu();
        res.json(menu);
    }
    catch (error) {
        res.status(500).json({ message: "Error al recuperar el menú" });
    }
};
exports.getMenu = getMenu;
//# sourceMappingURL=menuHandler.js.map