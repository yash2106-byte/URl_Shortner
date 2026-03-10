import express from 'express'
import db from '../src/db/index.js'
import usersTable from '../models/index.js'
import { createHmac, randomBytes } from 'crypto';
import { signupPost } from '../validation/request.validation.js';
import { eq } from "drizzle-orm";

const router = express.Router();

router.post('/signup',async(req,res)=>{
    const validationResult = await signupPost.safeParseAsync(req.body);

    if (validationResult.error){
        return res.status(400).json({error:validationResult.error.message})
    }
    const {firstname,lastname,password,email} = validationResult.data

    const [existing] = await db
        .select({ id:usersTable.id, })
        .from(usersTable)
        .where(eq(usersTable.email,email))
    
    if (existing) return res.status(400).json({error: 'user with the same email already exists'})

    const salt = randomBytes(256).toString('hex')
    const hashedPassword = createHmac('sha256',salt).update(password).digest('hex')
    
    const [user] = await db.insert(usersTable).values({
        email,
        firstname,
        lastname,
        password:hashedPassword,
        salt: salt,
        updatedAt: new Date()
    }).returning({id:usersTable.id})

    return res.status(200).json({data: { userId: user.id }})

})

export default router