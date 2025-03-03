import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'whyTypeScriptissoafraidofthispropertybeingundefined';

interface AuthRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

router.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

const authenticateToken = (req: AuthRequest, res: Response, next: Function):any => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Доступ заборонено' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Невірний або прострочений токен' });
    
    if (typeof decoded === 'object' && 'id' in decoded && 'isAdmin' in decoded) {
      req.user = { id: decoded.id as string, isAdmin: decoded.isAdmin as boolean };
      next();
    } else {
      res.status(403).json({ message: 'Недійсний токен' });
    }
  });
};


router.post('/register', async (req: AuthRequest, res: Response):Promise<any> => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Будь ласка, заповніть всі поля' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Користувач з такою поштою вже існує' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, isAdmin: false });

    await newUser.save();
    res.status(201).json({ message: 'Користувач успішно зареєстрований' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});


router.post('/login', async (req: AuthRequest, res: Response):Promise<any> => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  

  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Невірний email або пароль' });

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Невірний email або пароль' });

    
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, SECRET_KEY, { expiresIn: '8h' });

    console.log('Знайдений користувач:', user);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, hasCompany: user.hasCompany } });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});


router.get('/users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});


router.get('/users/:id', authenticateToken, async (req: Request, res: Response):Promise<any> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Користувач не знайдений' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});


router.patch('/users/:id', authenticateToken, async (req: AuthRequest, res: Response):Promise<any> => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const { id } = req.params;
    const { hasCompany } = req.body;

    if (!req.user || req.user.id !== id) {
      return res.status(403).json({ message: 'У вас немає прав для редагування цього користувача' });
    }

    
    const updatedUser = await User.findByIdAndUpdate(id, { hasCompany }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }

    res.json({ message: 'Статус компанії оновлено', user: updatedUser });
  } catch (error) {
    console.error('Помилка оновлення користувача:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});


router.delete('/users/:id', authenticateToken, async (req: Request, res: Response):Promise<any> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Користувач не знайдений' });

    res.json({ message: 'Користувач успішно видалений' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});


router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<any> => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Неавторизований доступ' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }

    console.log('Дані профілю:', user);

    res.json({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, hasCompany: user.hasCompany });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

export default router;
