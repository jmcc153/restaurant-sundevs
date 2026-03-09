"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const product_1 = require("../src/models/product");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant_db";
const MENU = [
    {
        id: "1",
        name: "Giga Burger",
        description: "Doble carne de res, queso cheddar y pan artesanal.",
        image: "https://loremflickr.com/400/400/burger",
        basePrice: 1250,
        modifierGroups: [
            {
                id: "prot",
                name: "Proteína",
                required: true,
                maxSelection: 1,
                options: [
                    { name: "Res", extraPrice: 0 },
                    { name: "Pollo Crispy", extraPrice: 100 },
                    { name: "Veggie Patty", extraPrice: 200 },
                ],
            },
            {
                id: "top",
                name: "Toppings",
                required: false,
                maxSelection: 2,
                options: [
                    { name: "Tocineta", extraPrice: 150 },
                    { name: "Huevo frito", extraPrice: 100 },
                    { name: "Pepinillos", extraPrice: 50 },
                ],
            },
            {
                id: "sauce",
                name: "Salsas",
                required: false,
                maxSelection: 3,
                options: [
                    { name: "Ketchup", extraPrice: 0 },
                    { name: "Mostaza", extraPrice: 50 },
                    { name: "Mayonesa", extraPrice: 50 },
                    { name: "Salsa BBQ", extraPrice: 50 },
                ],
            },
        ],
    },
    {
        id: "2",
        name: "Mega Burger",
        description: "Triple carne de res, queso cheddar, tocino y pan artesanal.",
        image: "https://loremflickr.com/400/400/burger",
        basePrice: 1000,
        modifierGroups: [
            {
                id: "prot",
                name: "Proteína",
                required: true,
                maxSelection: 1,
                options: [
                    { name: "Res", extraPrice: 0 },
                    { name: "Pollo Crispy", extraPrice: 100 },
                    { name: "Veggie Patty", extraPrice: 200 },
                ],
            },
            {
                id: "top",
                name: "Toppings",
                required: false,
                maxSelection: 2,
                options: [
                    { name: "Tocineta", extraPrice: 150 },
                    { name: "Huevo frito", extraPrice: 100 },
                    { name: "Pepinillos", extraPrice: 50 },
                ],
            },
            {
                id: "sauce",
                name: "Salsas",
                required: false,
                maxSelection: 3,
                options: [
                    { name: "Ketchup", extraPrice: 0 },
                    { name: "Mostaza", extraPrice: 50 },
                    { name: "Mayonesa", extraPrice: 50 },
                    { name: "Salsa BBQ", extraPrice: 50 },
                ],
            },
        ],
    },
    {
        id: "3",
        name: "Pizza Pepperoni",
        description: "Clásica con mozzarella.",
        image: "https://loremflickr.com/400/400/pizza",
        basePrice: 1500,
    },
    {
        id: "4",
        name: "Papas Fritas",
        description: "Crocantes con sal de mar.",
        image: "https://loremflickr.com/400/400/fries",
        basePrice: 450,
    },
    {
        id: "5",
        name: "Malteada Vainilla",
        description: "Hecha con helado real.",
        image: "https://loremflickr.com/400/400/milkshake",
        basePrice: 600,
    },
    {
        id: "6",
        name: "Ensalada Caesar",
        description: "Lechuga romana y croutons.",
        image: "https://loremflickr.com/400/400/salad",
        basePrice: 850,
    },
    {
        id: "7",
        name: "Tacos Al Pastor",
        description: "3 tacos con piña y cilantro.",
        image: "https://loremflickr.com/400/400/tacos",
        basePrice: 950,
    },
];
async function seed() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Conectado a MongoDB");
        await product_1.Product.deleteMany({});
        console.log("Colección limpiada");
        await product_1.Product.insertMany(MENU);
        console.log(`${MENU.length} productos insertados`);
    }
    catch (error) {
        console.error("Error al hacer seed:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Desconectado de MongoDB");
    }
}
seed();
//# sourceMappingURL=product.js.map