import express from 'express'
import router from './Routes/user.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js'
import urlrouter from './routes/url.router.js'

const web = express()
const PORT = process.env.PORT ?? 8000;

web.use(express.json())

web.get('/', (req, res) => {
    return res.json({ status: "Server is running" })
})

// Public routes — no auth needed
web.use('/user', router)

// Protected routes — auth applied only here
web.use(authMiddleware, urlrouter)

web.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})