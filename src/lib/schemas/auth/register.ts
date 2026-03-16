import { z } from 'zod'

const registerSchema = z.object({
    email: z.string().email('Email invalid'),
    password: z.string().min(8, 'The password must be 8 characters or more'),
    terms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms"
    })
})

export function validateRegister (input: unknown) {
    const result = registerSchema.safeParse(input)
    if (!result.success) {
        return {
            success: false,
            errors: result.error.errors
        }
    }
    return {
        success: true,
        data: result.data
    }
}