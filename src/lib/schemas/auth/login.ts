import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'The password must be 8 characters or more')
})

export function validateLogin (input: unknown) {
    const result = loginSchema.safeParse(input)
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