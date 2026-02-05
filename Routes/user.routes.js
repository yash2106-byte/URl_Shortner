import express from 'express';
import {} from '../db/index.js'
import { userTable } from '../Models/user.model.js';
import { eq } from 'drizzle-orm';
import { randomBytes,createHmac } from 'crypto';
const router = express.Router()

router.post('/signup',async(req,res)=>{
    const { firstname,lastname,email,password } = req.body
    if(!firstname) return res.status(400).json({error: 'firstname is required'})

    const [existingUser] = await db
        .select({
            id : userTable.id,
        })
        .from(userTable)
        .where(eq(userTable.email,email)); 

        const salt = randomBytes(256).toString('hex')
        const hashedpassword = createHmac('sha256', salt).update(Password).digest('hex')

        if (userTable)
            return res
                .status(400)
                .json({error: `user with the email @{email} already exits!`})
        const user = await db.insert(userTable).value({
            email,
            firstname,
            lastname,
            password:hashedpassword,
            salt
        }).returning({ id:userTable.id });
        return res.status(201).json({ data: {userId: user.id }})
})


export default router;