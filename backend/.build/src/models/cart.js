"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = require("mongoose");
const SelectedModifierSchema = new mongoose_1.Schema({
    groupName: { type: String, required: true },
    option: {
        name: { type: String, required: true },
        extraPrice: { type: Number, required: true },
    },
}, { _id: false });
const CartItemSchema = new mongoose_1.Schema({
    cartItemId: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    modifierGroups: [
        {
            id: { type: String, required: true },
            name: { type: String, required: true },
            required: { type: Boolean, required: true },
            maxSelection: { type: Number, required: true },
            options: [
                {
                    name: { type: String, required: true },
                    extraPrice: { type: Number, required: true },
                },
            ],
        },
    ],
    basePrice: { type: Number, required: true },
    image: { type: String, required: true },
    selectedModifiers: { type: [SelectedModifierSchema], default: [] },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
}, { _id: false });
const CartSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
}, { timestamps: true });
exports.Cart = (0, mongoose_1.model)("Cart", CartSchema);
//# sourceMappingURL=cart.js.map