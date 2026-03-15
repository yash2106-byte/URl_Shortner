import express from 'express'
import { shortenPost } from '../validation/request.validation.js'
import  db  from '../db/index.js'
import { urlTable } from '../models/index.js'
import { nanoid } from 'nanoid'
import { id } from 'zod/locales'
import { eq } from 'drizzle-orm'
import { error } from 'console'
import { url } from 'inspector'

const urlrouter = express.Router()




urlrouter.post('/shorten', async function(req,res){
    const userId = req.user.id ?? id

    if (!userId){
        return res.status(401).json({error:`user id is not authenticated`})
    }
    const validationResult = await shortenPost.safeParseAsync(req.body)

    if (!validationResult.success){
        return res.status(400).json({ error: validationResult.error })
    }

    const { url,code } = validationResult.data
    const shortCode = code ?? nanoid(8)
    const [result] = await db.insert(urlTable).values({
        shortCode,
        targetUrl: url,
        userId: req.user.id
    }).returning({id:urlTable.id,shortCode:urlTable.shortCode,targetUrl:urlTable.targetUrl})

    return res.status(201).json({ id: result.id,shortCode:result.shortCode})
})




urlrouter.get('/myCodes', async function (req,res){
    const your_codes = await db
        .select()
        .from(urlTable)
        .where(eq(urlTable.userId , req.user.id))
    return res.json({ your_codes })
})

urlrouter.get('/:code',async function (req,res) {
    const shortcode = req.params.code
    const [result]= await db.select()
        .from(urlTable)
        .where(eq(urlTable.shortCode, shortcode))
        .execute()

    if (!result){
        return res.status(404).json({error:`${shortcode} is invalid`})
    }

    return res.redirect(result.targetUrl)
    })

export default urlrouter