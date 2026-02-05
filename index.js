import express from "express";
import { json } from "stream/consumers";
const web = express()
const PORT = process.env.PORT ?? 5432

web.express(json)
web.get('/',(req,res)=>{
    return res.json({status: 'server is up and running'})
})
web.listen(PORT, ()=>{console.log(`your server is up and running at ${PORT}`)})


