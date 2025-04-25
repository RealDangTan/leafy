import UserModel from '../models/userModel.js';
import PostModel from '../models/postModel.js';
import AuthTokenModel from '../models/authtokenModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { server } from '../config.js';

const __dirname = path.resolve('src');

async function userCreate(req, res) {
    try {
        const email_match = await UserModel.findOne({ email: req.body.email });
        if (email_match) {
            return res.status(400).json({ success: false, error: 'email-exist' });
            
        }

        const username_match = await UserModel.findOne({ username: req.body.username });
        if (username_match) {
            return res.status(400).json({ success: false, error: 'username-exist' });
            
        }

        const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
        let user = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            display_name: req.body.username,
        });
        await user.save();
        return res.json({ success: true, message: 'User created' });
    } catch (err) {
        console.error(err.message);
        return res.json({ success: false, error: err.message });
    }
}

async function userLogin(req, res) {
    let user = await UserModel.findOne({ username: req.body.username });
    if (!user) user = await UserModel.findOne({ email: req.body.username });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Username or password is not correct!' });
    }
    const isMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Username or password is not correct!' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    res.json({ success: true, message: 'Login successful'});
}

async function userLogout(req, res) {
    res.clearCookie('token');
    res.redirect('/login');
}

async function resetPasswordSubmit(req, res) {
    let user = await UserModel.findOne({ email: req.body.email });

    if (!user) return res.status(401).json({ success: false, error: 'email-not-found' });

    const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    await AuthTokenModel.findOneAndUpdate({ email: req.body.email }, {$set: { token: token }, email: req.body.email}, { new: true, upsert: true });

    const link = `${server}/change-password?token=${token}`;

    const html = await ejs.renderFile(`${__dirname}/views/reset_password_mail.ejs`, { resetLink: link })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        });
    if (!html) res.status(500).json({ success: false, error: 'Internal server error' });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: 'Noreply: Password change request',
        html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).json({ success: false, error: 'Internal server error' });
        else return res.json({ success: true, message: 'Email sent' });
    });
}

async function resetPassword(req, res) {
    const email = req.email;

    const new_password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    await UserModel.findOneAndUpdate({ email: email }, { $set: { password: new_password } });

    return res.json({ success: true, message: 'Password changed successfully' });
}

async function getUserInfo(req, res) {
    const user = await UserModel.findById(req.userId)
    let profile_picture_url = 'assets/images/imgDefaultProfilePicture.png';
    let background_picture_url = 'assets/images/profile-background.png';

    const profilePicturePath = path.join(__dirname, '..', 'public', 'users', user._id.toString())

    if (fs.existsSync(profilePicturePath)) {
        const files = fs.readdirSync(profilePicturePath);
        const profilePic = files.find(file => file.startsWith('profile-picture'));
        const backgroundPic = files.find(file => file.startsWith('background'));
        
        if (profilePic) profile_picture_url = path.join('users', user._id.toString(), profilePic);
        if (backgroundPic) background_picture_url = path.join('users', user._id.toString(), backgroundPic);
    }

    let data = {
        _id: user._id,
        username: user.username,
        display_name: user.display_name,
        profile_picture_url: profile_picture_url,
        background_picture_url: background_picture_url,
        owned_posts: user.owned_posts,
        viewed_posts: user.viewed_posts,
        email: user.email,
        followers: user.followers.length,
        total_views: user.total_views,
        phone_number: user.phone_number,
        organization: user.organization,
        organization_id: user.organization_id,
    }

    if (req.is_owner) data.is_owner = req.is_owner;
    if (req.is_login) data.is_login = true;
    else data.is_login = false;

    res.json({
        success: true,
        data: data
    });
}

async function FollowUser(req, res) {
    const user = await UserModel.findById(req.userId);
    const follow_user = await UserModel.findById(req.query.user_id);

    if (!user || !follow_user) return res.status(404).json({ success: false, error: 'User not found' });

    if (user.followed.includes(follow_user._id)) {
        user.followed = user.followed.filter(id => id.toString() !== follow_user._id.toString());
        follow_user.followers = follow_user.followers.filter(id => id.toString() !== user._id.toString());
    } else {
        user.followed.push(follow_user._id);
        follow_user.followers.push(user._id);
    }

    await user.save();
    await follow_user.save();

    return res.json({ success: true, message: 'Followed/Unfollowed successfully' });
}

async function CheckFollow(req, res) {
    const user = await UserModel.findById(req.userId);
    
    if (req.query.user_id == req.userId) {
        return res.status(400).json({ success: true, message: 'is_owner', is_followed: true });
    }
    
    const follow_user = await UserModel.findById(req.query.user_id);
    
    if (!user || !follow_user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const isFollowed = user.followed.some(id => id.toString() === follow_user._id.toString());
    
    return res.json({ 
        success: true, 
        message: isFollowed ? 'Followed' : 'Not followed', 
        is_followed: isFollowed 
    });
}

async function UploadResearch(req, res) {
    try {
        let new_post = await PostModel.findOne({ _id: req.query.post_id });
        if (!new_post) new_post = new PostModel({
            owned_user_id: req.userId,
            title: '',
            subtitle: '',
            tags: []
        });
        
        const post_id = new_post._id.toString();
        
        const postPath = path.join(__dirname, '..', 'public', 'researches', post_id);
        if (!fs.existsSync(postPath)) {
            fs.mkdirSync(postPath, { recursive: true });
        }
        
        const assetsPath = path.join(postPath, 'assets');
        if (!fs.existsSync(assetsPath)) {
            fs.mkdirSync(assetsPath, { recursive: true });
        }

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'cover_image') {
                    cb(null, postPath);
                } else if (file.fieldname === 'research_file') {
                    if (file.originalname === 'content.md') {
                        cb(null, postPath);
                    } else {
                        cb(null, assetsPath);
                    }
                } else {
                    cb(null, postPath);
                }
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        });

        const upload = multer({ storage }).fields([
            { name: 'cover_image', maxCount: 1 },
            { name: 'research_file', maxCount: 20 }
        ]);

        upload(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, error: 'File upload error' });
            }

            try {
                new_post.title = req.body.title;
                new_post.subtitle = req.body.subtitle;
                new_post.tags = JSON.parse(req.body.tags);
                
                await new_post.save();
                
                await UserModel.findByIdAndUpdate(
                    req.userId,
                    { $addToSet: { owned_posts: post_id } }
                );

                // EASTER EGG

                if (req.body.tags.includes('???')) {
                    let md_content = fs.readFileSync(path.join(postPath, 'content.md'), 'utf-8');
                    const newLines = Array(2000).fill('&nbsp;\n').join('');
                    md_content = md_content + newLines + 'QTMQ6-Q368Y-J0QDH';
                    fs.writeFileSync(path.join(postPath, 'content.md'), md_content);
                }

                // EASTER EGG

                return res.json({ 
                    status: "success", 
                    message: 'Files uploaded and post created successfully', 
                    post_id: new_post._id.toString()
                });

            } catch (saveErr) {
                console.error(saveErr);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Error saving post to database' 
                });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            error: 'Server error'
        });
    }
}

async function SubscribeEmail(req, res) {
    const email = req.body.email;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    UserModel.findByIdAndUpdate({_id: req.userId}, { $set: { notification_email: email }}, { new: true }).then(() => {
        return res.json({ success: true, message: 'Email subscribed successfully' });
    }).catch(err => {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    });
}

async function UpdateUserProfile(req, res) {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    try {
        const userDir = path.join(__dirname, '..', 'public', 'users', req.userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, userDir);
            },
            filename: (req, file, cb) => {
                const fileExt = path.extname(file.originalname);
                if (file.fieldname === 'profile_picture') {
                    cb(null, `profile-picture${fileExt}`);
                } else if (file.fieldname === 'background_picture') {
                    cb(null, `background${fileExt}`);
                }
            }
        });

        const upload = multer({ storage }).fields([
            { name: 'profile_picture', maxCount: 1 },
            { name: 'background_picture', maxCount: 1 }
        ]);

        upload(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, error: 'File upload error' });
            }

            const { display_name, email, phone_number, organization, organization_id } = req.body;

            user.display_name = display_name || user.display_name;
            if (email && email !== user.email) {
                const emailExists = await UserModel.findOne({ email });
                if (emailExists && !emailExists._id.equals(user._id)) {
                    return res.status(400).json({ success: false, error: 'Email already exists' });
                }
                user.email = email;
            }
            user.phone_number = phone_number || user.phone_number;
            user.organization = organization || user.organization;
            user.organization_id = organization_id || user.organization_id;

            await user.save();
            return res.json({ success: true, message: 'Profile updated successfully' });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
}

async function checkPostAuthor(req, res) {
    const post_id = req.query.post_id;
    const post = await PostModel.findById(post_id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    if (post.owned_user_id.toString() === req.userId.toString()) {
        return res.json({ success: true, is_author: true });
    } else {
        return res.json({ success: true, is_author: false });
    }
}

async function getFollowerPosts(req, res) {
    const user = await UserModel.findById(req.userId).populate('followed', 'owned_posts');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const posts = await PostModel.find({ owned_user_id: { $in: user.followed } });
    const post_ids = posts.map(post => post._id.toString());
    return res.json({ success: true, post_ids: post_ids });
}

async function deletePost(req, res) {
    const post_id = req.body.post_id;
    const post = await PostModel.findById(post_id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    if (post.owned_user_id.toString() !== req.userId.toString()) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await PostModel.deleteOne({ _id: post_id });
    const postPath = path.join(__dirname, '..', 'public', 'researches', post_id);
    if (fs.existsSync(postPath)) {
        try {
            fs.rmSync(postPath, { recursive: true, force: true });
        } catch (err) {
            console.error(`Error deleting folder for post ${post_id}:`, err);
            return res.status(500).json({ success: false, error: 'Error deleting post files' });
        }
    }

    await UserModel.findByIdAndUpdate(
        req.userId,
        { 
            $pull: { owned_posts: post_id,
                     viewed_posts: post_id,
                    }, 
            $inc: { total_views: -post.views },
        },
        { multi: true }
    );


    return res.json({ success: true, message: 'Post deleted successfully' });
}

export {
    userCreate,
    userLogin,
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
}
