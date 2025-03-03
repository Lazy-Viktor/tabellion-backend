import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import bodyParser from 'body-parser';

const app = express();
dotenv.config();

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type, Authorization']
}));
app.options('*', cors());

app.use(express.json());
app.use(bodyParser.json());
app.use('/auth', authRoutes);

mongoose.connect(process.env.DB_CONNECT as string).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

interface IClient {
    name: string;
    practice: string;
    address: string;
    phone: string;
    userID: string;
}

interface IService {
    name: string;
    description: string;
    price: number;
}

interface IContract {
    clientId: string;
    client: string;
    services: string[];
    totalprice: number;
    fee: number;
    description: string;
}

const Client = mongoose.model<IClient>('Client', new mongoose.Schema({
    name: String,
    practice: String,
    address: String,
    phone: String,
    userID: String
}));

const Service = mongoose.model<IService>('Service', new mongoose.Schema({
    name: String,
    description: String,
    price: Number
}));

const Contract = mongoose.model<IContract>('Contract', new mongoose.Schema({
    clientId: String,
    client: String,
    services: [String],
    totalprice: Number,
    fee: Number,
    description: String
}));

app.post('/clients', async (req: Request, res: Response) => {
    const client = new Client(req.body);
    await client.save();
    res.status(201).send(client);
});

app.get('/clients', async (_req: Request, res: Response) => {
    const clients = await Client.find();
    res.send(clients);
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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
