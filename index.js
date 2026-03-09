import express from 'express'

const web = express()

const PORT  = process.env.PORT ?? 8000;

web.get('/',(req,res)=>{
    return res.json({status : "Server is running"})
})

web.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})