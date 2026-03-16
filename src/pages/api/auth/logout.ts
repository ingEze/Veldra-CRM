import type { APIRoute } from "astro"

export const POST: APIRoute = async({ locals }) => {
    const { error } = await locals.supabase.auth.signOut()

    if (error) {
        return new Response(
            JSON.stringify({
                success: false,
                message: error.message
            }),
            { status: 400 }
        )
    }

    return new Response(
        JSON.stringify({
            success: true
        }),
        { status: 200 }
    )
} 