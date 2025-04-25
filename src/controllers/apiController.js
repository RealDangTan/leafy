import PostModel from '../models/postModel.js';
import UserModel from '../models/userModel.js';
import TagModel from '../models/tagModel.js';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve('src');

async function getContentCards(req, res) {

    const post_id = req.body.post_id;
    const owned_user_id = req.body.owned_user_id || null;
    const limit = req.body.limit || 10;
    const tags = req.body.tags ;

    let query = [];
    if (req.body.mode === 'strict') {
        if (post_id != null) query.push({_id: post_id});
        if (owned_user_id) query.push({owned_user_id: owned_user_id});
        if (tags != null) query.push({tags: { $all: tags }});

    } else {
        if (post_id != null) query.push({_id: {$in: post_id}});
        if (typeof(owned_user_id) === 'Array') query.push({owned_user_id: {$in: owned_user_id}});
        else if (owned_user_id) query.push({owned_user_id: owned_user_id});
        if (tags != null) query.push({tags: { $in: tags }});
    }
    try {
        const posts = await PostModel.find({$and: query}).limit(limit);
        if (!posts) return res.status(400).json({ success: false, error: 'post-not-exist' });

        let content_cards = [];
        for (let post of posts) {
            const author = await UserModel.findById(post.owned_user_id);
            const thumbnail_directory = path.resolve('public', 'researches', post._id.toString());
            const thumbnail_files = fs.readdirSync(thumbnail_directory);
            const thumbnail_file = thumbnail_files.find(file => /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(file));
            let thumbnail_path;
            if (thumbnail_file) thumbnail_path = path.join('researches', post._id.toString(), thumbnail_file);
            else thumbnail_path = path.join('assets', 'images', 'imgDefaultPostBackground.png');
            const template = await ejs.renderFile(__dirname + '/views/content-card.ejs', {
                tags: post.tags,
                title: post.title,
                subtitle: post.subtitle,
                author: author.display_name,
                date: post.date_created.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                views: post.views,
                imageUrl: `${thumbnail_path}`,
            });
            content_cards.push({template: template, _id: post._id, date_created: post.date_created, views: post.views});
        }
        return res.json({ success: true, content_cards });
    } catch (err) {
        console.error(err.message);
        return res.json({ success: false, error: err.message });
    }
}

async function getSearchValue(req, res) {
    const regex = (req.query.value || '')
    
    const limit = parseInt(req.query.limit) || 10;
    let searchResponse = {
        tags: [],
        posts: [],
        users: [],
    }
    try {
        const searchPromises = [
            TagModel.find({ name: { $regex: regex, $options: 'iu' } }).limit(limit),
            PostModel.find({
            $or: [
                { title: { $regex: regex, $options: 'iu' } },
                { subtitle: { $regex: regex, $options: 'iu' } },
            ],
            }).limit(limit),
            UserModel.find({
            $or: [
                { username: { $regex: regex, $options: 'i' } },
                { display_name: { $regex: regex, $options: 'iu' } },
            ],
            }).limit(limit),
        ];

        const [tags, posts, users] = await Promise.all(searchPromises);

        searchResponse.tags = tags.map(tag => ({
            _id: tag._id,
            name: tag.name,
            group: tag.group,
        }));

        const postAuthors = await UserModel.find({
            _id: { $in: posts.map(post => post.owned_user_id) },
        }).lean();

        const authorMap = postAuthors.reduce((map, author) => {
            map[author._id] = author.display_name;
            return map;
        }, {});

        searchResponse.posts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            author_name: authorMap[post.owned_user_id] || 'Unknown',
            date_created: post.date_created.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                }),
            view: post.views,
        }));

        const userProfilePaths = users.map(user => ({
            user,
            profilePicturePath: path.join(__dirname, '..', 'public', 'users', user._id.toString()),
        }));

        for (let { user, profilePicturePath } of userProfilePaths) {
            if (!fs.existsSync(profilePicturePath)) {
                user.profile_image = 'assets/images/imgDefaultProfilePicture.png';
            } else {
                const files = fs.readdirSync(profilePicturePath);
                const profilePictureFile = files.find(file => /^profile-picture\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(file));
                user.profile_image = path.join('users', user._id.toString(), profilePictureFile || files[0]);
            }
        }

        searchResponse.users = users.map(user => ({
            _id: user._id,
            username: user.username,
            display_name: user.display_name,
            profile_picture_url: user.profile_image,
        }));

        return res.json({ success: true, data: searchResponse });
    } catch (err) {
        console.error(err.message);
        return res.json({ success: false, error: err.message });
    }
}

async function getPostForEdit(req, res) {
    const post_id = req.query.post_id;
    if (!post_id) return res.status(400).json({ success: false, error: 'post-not-exist' });
    try {
        const post = await PostModel.findById(post_id);
        if (!post) return res.status(400).json({ success: false, error: 'post-not-exist' });

        if (post.owned_user_id != req.userId) {
           return res.status(403).json({ success: false, error: 'Unauthorized' });
        }
        return res.json({
            success: true,
            data: {
                title: post.title,
                subtitle: post.subtitle,
                tags: post.tags,
            },
        });
    } catch (err) {
        console.error(err.message);
        return res.json({ success: false, error: err.message });
    }
}

async function getPost(req, res) {
    const post_id = req.query.post_id;
    if (!post_id) return res.status(400).json({ success: false, error: 'post-not-exist' });

    try {
        const post = await PostModel.findById(post_id);
        if (!post) return res.status(400).json({ success: false, error: 'post-not-exist' });

        post.views += 1;
        await post.save();

        const author = await UserModel.findById(post.owned_user_id);
        author.total_views += 1;
        await author.save();

        if (req.userId) {
            const user = await UserModel.findById(req.userId);
            if (user && !user.viewed_posts.includes(post._id)) {
                user.viewed_posts.push(post._id.toString());
                await user.save();
            }
        }

        const post_directory = path.resolve('public', 'researches', post._id.toString());
        const thumbnail_files = fs.readdirSync(post_directory);
        const thumbnail_file = thumbnail_files.find(file => /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(file));
        let thumbnail_path;
        if (!thumbnail_file) thumbnail_path = path.join('assets', 'images', 'imgDefaultPostBackground.png');
        else thumbnail_path = path.join('researches', post._id.toString(), thumbnail_file);

        const md_content = fs.readFileSync(path.join(post_directory, 'content.md'), 'utf-8');

        return res.json({
            success: true,
            data: {
                title: post.title,
                subtitle: post.subtitle,
                tags: post.tags,
                md_content: md_content,
                author_name: author.display_name,
                date_created: post.date_created.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                view: post.views,
                image_url: `${thumbnail_path}`,
            },
        });
    } catch (err) {
        console.error(err.message);
        return res.json({ success: false, error: err.message });
    }
}


export { getContentCards, getSearchValue, getPostForEdit, getPost };