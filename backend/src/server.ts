import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectToMongoDB from './config/db';
import login from './routes/login';
import signup from './routes/signup';
import addProduct from './routes/addProduct';

const app = express();
const PORT = process.env.PORT || 5002;

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// Provide io instance to routes
app.set('io', io);

app.use('/api/sellerDashboard', addProduct);
app.use('/api/auth', login);
app.use('/api/auth', signup);


app.get('/health', (req, res) => {
  res.send('Hello World from TypeScript Express!');
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function startServer() {
  await connectToMongoDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
