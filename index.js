import express from 'express';
import userRoute from './routes/v1/userRoute.js'
import communityRoute from './routes/v1/communityRoute.js'
import memberRoute from './routes/v1/memberRoute.js'
import roleRoute from './routes/v1/roleRoute.js'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'

const app = express()
dotenv.config();
//Middleware
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser());
//Routes
app.use('/v1/auth',userRoute);
app.use('/v1/community',communityRoute);
app.use('/v1/member',memberRoute);
app.use('/v1/role',roleRoute);

//Error handler middleware
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send("Server Error");
})

const PORT = process.env.PORT || 5001
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})