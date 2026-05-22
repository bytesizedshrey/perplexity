import mongoose from 'mongoose'

const connectToDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)

        console.log(`MongoDB is Connected : ${connect.connection.host}`)
    } catch (error) {
        console.error(`DB connection error : `,error.message)
        process.exit(1) //exit if DB fails
    }

}

export default connectToDB