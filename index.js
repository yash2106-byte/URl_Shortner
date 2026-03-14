import express from 'express'
import router from './Routes/user.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js'
const web = express()

const PORT  = process.env.PORT ?? 8000;
web.use(express.json())
web.use(authMiddleware);
web.get('/',(req,res)=>{
    return res.json({status : "Server is running"})
})
web.use('/user',router)
web.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})