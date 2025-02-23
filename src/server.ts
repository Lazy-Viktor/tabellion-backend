// backend/server.ts
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Підключення до бази даних
mongoose.connect(process.env.DB_CONNECT as string).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Інтерфейси
interface IUser {
    name: string;
    practice: string;
    address: string;
    phone: string;
}

interface IService {
    name: string;
    description: string;
    price: number;
}

interface IContract {
    client: string;
    services: string[];
    totalprice: number;
    fee: number;
    description: string;
}

// Моделі
const User = mongoose.model<IUser>('User', new mongoose.Schema({
    name: String,
    practice: String,
    address: String,
    phone: String
}));

const Service = mongoose.model<IService>('Service', new mongoose.Schema({
    name: String,
    description: String,
    price: Number
}));

const Contract = mongoose.model<IContract>('Contract', new mongoose.Schema({
    client: String,
    services: [String],
    totalprice: Number,
    fee: Number,
    description: String
}));

// Маршрути
app.post('/users', async (req: Request, res: Response) => {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
});

app.get('/users', async (_req: Request, res: Response) => {
    const users = await User.find();
    res.send(users);
});

app.get('/services', async (_req: Request, res: Response) => {
    const services = await Service.find();
    res.send(services);
});

app.post('/contracts', async (req: Request, res: Response) => {
    const contract = new Contract(req.body);
    await contract.save();
    res.status(201).send(contract);
});

app.get('/contracts', async (_req: Request, res: Response) => {
    const contracts = await Contract.find();
    res.send(contracts);
});

app.delete('/contracts/:id', async (req: Request, res: Response) => {
    await Contract.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
