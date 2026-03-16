import type { APIRoute } from "astro"
import { validateLogin } from "../../../lib/schemas/auth/login"

export const POST: APIRoute = async({ request, locals }) => {
    const body = await request.json()

    const validation = validateLogin(body)
    if(!validation.success) {
        return new Response(
            JSON.stringify({ 
                success: false,
                error: validation.errors,
                code: 'VALIDATION_ERROR'
            }),
            { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }

    const { email, password } = validation.data!
    const { data, error } = await locals.supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        const message = error.message.toLowerCase()

        if (message.includes('email not confirmed')) {
            return new Response(
                JSON.stringify({
                    success: false,
                    code: 'EMAIL_NOT_CONFIRMED',
                    error: 'You must confirm your email before signing in.'
                }),
                { 
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        if (message.includes('invalid login credentials')) {
            return new Response(
                JSON.stringify({
                    success: false,
                    code: 'INVALID_CREDENTIALS',
                    error: 'Invalid email or password.'
                }),
                { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        if (message.includes('rate limit')) {
            return new Response(
                JSON.stringify({
                    success: false,
                    code: 'TOO_MANY_ATTEMPTS',
                    error: 'Too many attempts. Please try again later.'
                }),
                { 
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        return new Response(
            JSON.stringify({
                success: false,
                code: 'AUTH_PROVIDER_ERROR',
                error: 'Unexpected error while signing in.'
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
            user: data.user
        }), 
        { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}