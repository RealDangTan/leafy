import express from 'express';

import { getContentCards, getSearchValue, getPostForEdit, getPost } from '../controllers/apiController.js';

import { checkToken, verifyToken, verifyTokenNotRes } from '../middlewares/authMiddleware.js';

const apiRouter = express.Router();

apiRouter.post('/get-content-card', getContentCards);

apiRouter.get('/get-search-value', getSearchValue);

apiRouter.get('/fetch-post-for-edit', verifyToken, getPostForEdit);

apiRouter.get('/get-post', checkToken, getPost);


export default apiRouter;