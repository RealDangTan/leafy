import mongoose from 'mongoose';

const Connect = async (uri) => {
    try {
        await mongoose.connect(uri);
    } catch (error) {
        console.log(error);
    }
}

export default Connect