import express from 'express'
import router from './Routes/user.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js'
import urlrouter, { publicUrlRouter } from './routes/url.router.js'
import cors from 'cors'

const web = express()
const PORT = process.env.PORT ?? 8000;
web.use(cors({ origin: 'http://localhost:5173' }))
web.use(express.json())

web.get('/', (req, res) => {
    return res.json({ status: "Server is running" })
})

// Public routes — no auth needed
web.use('/user', router)

// Public redirect route — no auth needed (browsers visiting short URLs don't send tokens)
web.use(publicUrlRouter)

// Protected URL routes — auth required
web.use(authMiddleware, urlrouter)

web.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})