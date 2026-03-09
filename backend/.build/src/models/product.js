"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const ModifierOptionsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    extraPrice: { type: Number, required: true },
});
const ModifierGroupSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    required: { type: Boolean, required: true },
    maxSelection: { type: Number, required: true },
    options: { type: [ModifierOptionsSchema], required: true },
});
const ProductSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    image: { type: String, required: true },
    modifierGroups: { type: [ModifierGroupSchema], required: false },
});
exports.Product = (0, mongoose_1.model)("Product", ProductSchema);
//# sourceMappingURL=product.js.map