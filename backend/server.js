import dotenv from "dotenv"
import app from './src/app.js'
import connectToDB from './src/config/database.js'
import { configDotenv } from 'dotenv';

dotenv.config();

connectToDB()

const PORT = process.env.PORT || 8000

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})