import express from 'express';
import path from 'path';
import {verifyPasswordChangeLink} from '../middlewares/authMiddleware.js';

const root = path.resolve('public');

const pageRouter = express.Router();

pageRouter.get('/login', (req, res) => {
    res.sendFile(path.join(root, '1-log-in.html'));
});

pageRouter.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(root, '2-forgot-password.html'));
});

pageRouter.get('/change-password', verifyPasswordChangeLink, (req, res) => {
    res.sendFile(path.join(root, '2-3-change-password.html'));
});

pageRouter.get('/signup', (req, res) => {
    res.sendFile(path.join(root, '3-sign-up.html'));
});

pageRouter.get('/profile', (req, res) => {
    res.sendFile(path.join(root, '4-profile.html'));
});

pageRouter.get('/edit-profile', (req, res) => {
    res.sendFile(path.join(root, '4-1-edit-profile.html'));
});

pageRouter.get('/archive', (req, res) => {
    res.sendFile(path.join(root, '5-archive.html'));
})

pageRouter.get('/category', (req, res) => {
    res.sendFile(path.join(root, '6-category.html'));
})



pageRouter.get('/post', (req, res) => {
    res.sendFile(path.join(root, '7-post.html'));
});

pageRouter.get('/edit-post', (req, res) => {
    res.sendFile(path.join(root, '7-2-edit-post.html'));
});


export default pageRouter;