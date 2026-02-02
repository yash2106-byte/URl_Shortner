import express from "express";
const web = express()
const PORT = process.env.PORT ?? 5000

web.get('/',(req,res)=>{
    return res.json({status: 'server is up and running'})
})
web.listen(PORT, ()=>{console.log(`your server is up and running at ${PORT}`)})

// docker run urlshortener drizzle-postgres -e POSTGRES_USER=yashraj POSTGRES_PASSWORD=yash2106 -d -p 5432:5432 postgres
