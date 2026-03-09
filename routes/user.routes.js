import express from 'express'

const router = express.Router();

router.post('/signup',async(req,res)=>{
    const { firstname,lastname,email,password } = req.body;

    if (!firstname) return res.status(400).json({error: 'firstname is required' })
})

export default router