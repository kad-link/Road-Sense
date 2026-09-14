import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
        console.log(`MongoDB connected ...`);
        console.log(`DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.warn(`⚠️ MongoDB connection error: `, error.message || error);
        console.warn("⚠️ Continuing server execution without MongoDB. Database operations will fail.");
    }
}

export default connectDB 