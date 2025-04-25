import express from 'express';
import { userLogin,
         userCreate, 
         userLogout, 
         resetPasswordSubmit, 
         resetPassword,
         getUserInfo, 
         FollowUser,
         CheckFollow,
         UploadResearch,
         SubscribeEmail,
         UpdateUserProfile,
         checkPostAuthor,
         getFollowerPosts,
         deletePost,
        } from '../controllers/userController.js';
import { verifyToken, verifyTokenNotRes, verifyPasswordChangeLink } from '../middlewares/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', userCreate);

userRouter.post('/login', userLogin);

userRouter.post('/reset-password-submit', resetPasswordSubmit);

userRouter.post('/reset-password', verifyPasswordChangeLink, resetPassword);

userRouter.get('/logout', verifyToken, userLogout);

userRouter.get('/get-user-info', verifyToken, getUserInfo);

userRouter.get('/get-profile', verifyTokenNotRes, getUserInfo);

userRouter.get('/follow', verifyToken, FollowUser);

userRouter.get('/is-followed', verifyToken, CheckFollow);

userRouter.post('/upload-research', verifyToken, UploadResearch);

userRouter.post('/subscribe', verifyToken, SubscribeEmail);

userRouter.post('/update-profile', verifyToken, UpdateUserProfile);

userRouter.get('/check-post-author', verifyToken, checkPostAuthor);

userRouter.get('/get-follower-posts', verifyToken, getFollowerPosts);

userRouter.delete('/delete-post', verifyToken, deletePost);

export default userRouter;