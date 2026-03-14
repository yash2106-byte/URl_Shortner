import jwt from 'jsonwebtoken';

export function signToken(payload) {
    return jwt.sign(payload, process.env.jwt_in, { expiresIn: "1h" });
}

export function validateToken(token) {
    try {
        return jwt.verify(token, process.env.jwt_in); // returns decoded payload
    } catch (err) {
        return null; // token invalid or expired
    }
}