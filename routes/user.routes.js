import express from 'express'
import db from '../src/db/index.js'
import usersTable from '../models/index.js'
import { createHmac, randomBytes } from 'crypto';
const router = express.Router();

router.post('/signup',async(req,res)=>{
    const { firstname,lastname,email,password } = req.body;

    if (!firstname) return res.status(400).json({error: 'firstname is required' })
    
    if (!email)return res.status(400).json({error : 'email id is not there'})

    const [existing] = await db
        .select({ id:usersTable.id, })
        .from(usersTable)
        .where(eq(usersTable.email,email))
    
    if (existing) return res.status(400).json({error: 'user with the same email       already exists'})

    const salt = randomBytes(256).toString('hex')
    const hashedPassword = createHmac('sha256',salt).update(password).digest('hex')
    
    const [user] = await db.insert(usersTable).values({
        email,
        firstname,
        lastname,
        password:hashedPassword,
    }).returning({id:usersTable.id})

    return res.status(200).json({data: { userId: user.id }})

})

export default router