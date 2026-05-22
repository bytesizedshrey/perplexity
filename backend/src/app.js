import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()

//middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

//health check routine
app.get('',(req,res)=>{
    res.json({message : 'API IS RUNNING...'})
})

export default app 