import type { APIRoute } from "astro"
import { validateRegister } from "../../../lib/schemas/auth/register"

export const POST: APIRoute = async ({ request, locals }) => {
    const body = await request.json()
    const validation = validateRegister(body)

    if (!validation.success) {
        return new Response(
            JSON.stringify({ 
                success: false,
                code: 'VALIDATION_ERROR',
                error: 'Validation failed',
                fields: validation.errors
            }),
            { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
    
    const { email, password } = validation.data!
    const { data, error } = await locals.supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${import.meta.env.SITE}/auth/confirm`
        }
    })

    if (error) {
        console.log(error)
        
        const message = error.message.toLowerCase()

        // Usuario ya existe
        if (message.includes('user already registered') || message.includes('already registered')) {
            return new Response(
                JSON.stringify({
                    success: false,
                    code: 'USER_ALREADY_EXISTS',
                    error: 'This email already has an account.'
                }),
                { 
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // Rate limit de emails
        if (message.includes('email rate limit')) {
            return new Response(
                JSON.stringify({
                    success: false,
                    code: 'OVER_EMAIL_SEND_RATE_LIMIT',
                    error: 'Too many emails sent. Please try again later.'
                }),
                { 
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // Registro deshabilitado
        if (message.includes('signups not allowed')) {
            return new Response(
                JSON.stringify({
                    success: false,
                    code: 'SIGNUP_DISABLED',
                    error: 'Signups are currently disabled.'
                }),
                { 
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // Error genérico de Supabase
        return new Response(
            JSON.stringify({ 
                success: false,
                code: error.code || 'AUTH_PROVIDER_ERROR',
                error: 'Unexpected error during registration.'
            }),
            { 
                status: error.status || 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }

    if (!data.user) {
        return new Response(
            JSON.stringify({
                success: false,
                code: 'USER_NOT_CREATED',
                error: 'User could not be created.'
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }

    return new Response(
        JSON.stringify({ 
            success: true,
            message: 'User created successfully. Check your email to confirm.',
            user: data.user
        }),
        { 
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}