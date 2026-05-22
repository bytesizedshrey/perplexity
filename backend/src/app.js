import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.routes.js';

const app = express()

//middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

//health check routine
app.get('',(req,res)=>{
    res.json({message : 'API IS RUNNING...'})
})

/**
 * /api/auth
 */
app.use("/api/auth",authRouter)

export default app 