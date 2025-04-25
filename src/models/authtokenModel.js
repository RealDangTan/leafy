import mongoose from "mongoose";

const authTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiration: {
        type: Date,
        required: true,
        default: Date.now() + 15 * 60 * 1000,
    }
});

const AuthTokenModel = mongoose.model('AuthToken', authTokenSchema);

export default AuthTokenModel;