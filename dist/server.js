"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/server.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Підключення до бази даних
mongoose_1.default.connect(process.env.DB_CONNECT).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
// Моделі
const User = mongoose_1.default.model('User', new mongoose_1.default.Schema({
    name: String,
    practice: String,
    address: String,
    phone: String
}));
const Service = mongoose_1.default.model('Service', new mongoose_1.default.Schema({
    name: String,
    description: String,
    price: Number
}));
const Contract = mongoose_1.default.model('Contract', new mongoose_1.default.Schema({
    client: String,
    services: [String],
    totalprice: Number,
    fee: Number,
    description: String
}));
// Маршрути
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new User(req.body);
    yield user.save();
    res.status(201).send(user);
}));
app.get('/users', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User.find();
    res.send(users);
}));
app.get('/services', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const services = yield Service.find();
    res.send(services);
}));
app.post('/contracts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contract = new Contract(req.body);
    yield contract.save();
    res.status(201).send(contract);
}));
app.get('/contracts', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contracts = yield Contract.find();
    res.send(contracts);
}));
app.delete('/contracts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Contract.findByIdAndDelete(req.params.id);
    res.status(204).send();
}));
// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
