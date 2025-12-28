import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path'; 
import swaggerUi from 'swagger-ui-express'; 
import swaggerSpec from './swagger';       


import authRoutes from './routes/authRoutes';
import wordRoutes from './routes/wordRoutes';
import dictationRoutes from './routes/dictationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import cookieParser from 'cookie-parser'; 
const app = express();
app.use(cookieParser());
app.use(morgan('dev')); 
app.use(cors());
app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 


app.use('/api/auth', authRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/dictations', dictationRoutes);
app.use('/api/upload', uploadRoutes); 

export default app;