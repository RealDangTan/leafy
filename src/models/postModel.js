import moongoose from 'mongoose';

const Schema = moongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    owned_user_id: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    views: {
        type: Number,
        default: 0,
        required: true,
    },
    date_created: {
        type: Date,
        default: Date.now,
        required: true,
    },
})

const PostModel = moongoose.model('post', Schema);

export default PostModel;