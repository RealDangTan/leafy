import mongose from 'mongoose';

const Schema = mongose.Schema({
    name: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        required: true,
    },
})

const TagModel = mongose.model('tag', Schema);

export default TagModel;