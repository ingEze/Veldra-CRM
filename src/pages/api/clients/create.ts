import type { APIRoute } from "astro"
import { validateClient } from "../../../lib/schemas/clients/new"

export const POST: APIRoute = async({ locals, request }) => {
    try {
        const body = await request.json()

        const validation = validateClient(body)
        if (!validation.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: validation.errors
                }),
                { status: 422 }
            )
        }

        const { data, error } = await locals.supabase
            .from('clients')
            .insert(validation.data)
            .select()
            .single()

        if (error) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: error.message,
                    code: error.code
                }),
                { status: 500 }
            )
        }

        return new Response(
            JSON.stringify({ 
                success: true,
                client: data
            }),
            { status: 201 }
        )
    } catch(err) {
        console.error(err)
        throw err
    }
}