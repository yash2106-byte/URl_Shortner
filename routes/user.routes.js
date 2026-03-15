import express from 'express'
import db from '../db/index.js'
import {usersTable} from '../models/index.js'
import { createHmac, randomBytes } from 'crypto';
import { signupPost,loginPost } from '../validation/request.validation.js';
import { eq } from "drizzle-orm";
import  jwt  from 'jsonwebtoken'
import { signToken, validateToken } from '../utils/jwt.js';

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

router.post('/login',async(req,res)=>{
    const loginresult = await loginPost.safeParseAsync(req.body);

    if (loginresult.error){
        return res.status(400).json({error: loginresult.error.message})
    }

    const { email,password } = loginresult.data
    const check = await db
        .select({
            id: usersTable.id,
            salt: usersTable.salt,
            password: usersTable.password
        })
        .from(usersTable)
        .where(eq(usersTable.email,email))
    if (check.length === 0){
        return res.status(404).json({error: `user with this email ${(email)} does not exist`})
    }

    const user = check[0]

    const hashedPassword = createHmac('sha256', user.salt)
        .update(password)
        .digest('hex');

    if (hashedPassword === user.password) {
    const token = signToken({ id: user.id }); 
    return res.status(200).json({
        message: "User login successful",
        token: token
    });
}
    else{
        res.status(400).json({error: `Password entered is invalid`})
    }
})
export default router