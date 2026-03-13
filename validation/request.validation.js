import z from 'zod'

export const signupPost = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    password: z.string().min(3)
})

export const loginPost = z.object({
    email: z.string(),
    password: z.string().min(3)
})