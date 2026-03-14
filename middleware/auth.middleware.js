/**
 * 
 * @param {import ("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */


import { validateToken } from '../utils/jwt.js';

export function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]; 
    const decoded = validateToken(token);

    if (!decoded) return res.status(401).json({ error: "Unauthorized" });

    req.user = decoded; 
    next();
}