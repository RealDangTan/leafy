import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import userRouter from './routes/userRoutes.js';
import pageRouter from './routes/pageRouter.js';
import apiRouter from './routes/apiRouter.js';
import { verifyPasswordChangeLink, verifyTokenNotRes } from './middlewares/authMiddleware.js'; 

const app = new express();

const server = 'http://localhost:7777';

const __root = path.resolve('public');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: `${server}/*`,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.static(path.join('public')));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect(`${server}/public/`);
})

app.use('/', pageRouter);

app.use('/user', userRouter);

app.use('/api/v1', apiRouter);

app.get('/public/forgot-password', verifyPasswordChangeLink, (req, res) => {
    res.render('forgot-password', { server });
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__root, '0-page-not-found.html'));
});

export default app;