import type { APIRoute } from "astro"
import { validateClient } from "../../../../lib/schemas/clients/new"

const clientIdError = JSON.stringify({
    success: false,
    error: "Client ID is required",
    code: 'CLIENT_ID_NOT_FOUND'
})

export const GET: APIRoute = async({ locals, params }) => {
    const clientId = params.id

    if (!clientId) {
        return new Response(
            clientIdError,
            { status: 400 }
        )
    }

    try {
        const { data, error } = await locals.supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single()

        if (error) {
            return new Response(
                JSON.stringify({
                    success: true,
                    error: error.message,
                    code: error.code?.toUpperCase()
                }),
                { status: 500 }
            )
        }

        return new Response(
            JSON.stringify({
                success: true,
                client: data
            }), 
            { status: 200 }
        )
    } catch (err) {
        const errMsg = (err as Error).message
        console.error('error', errMsg)
        return new Response(
            JSON.stringify({
                success: false,
                error: errMsg,
                code: 'INTERNAL_SERVER_ERROR'
            }),
            { status: 500 }
        )
    }
}

export const DELETE: APIRoute = async({ locals, params }) => {
    const clientId = params.id
    if(!clientId) return new Response( clientIdError, { status: 400 } )

    try {
        const { data, error } = await locals.supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .select()

    if (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                code: error.code?.toUpperCase()
            }),
            { status: 400 }
        )
    }

    if (!data || data.length === 0) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "Client not found",
                code: "CLIENT_NOT_FOUND"
            }),
            { status: 404 }
        )
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (err) {
        return new Response(
            JSON.stringify({
                success: false,
                error: (err as Error).message,
                code: 'INTERNAL_SERVER_ERROR'
            }),
            { status: 500 }
        )
    }
}

export const PUT: APIRoute = async({ locals, params, request }) => {
    const clientId = params.id
    if (!clientId) return new Response(clientIdError, { status: 400 })

    const body = await request.json()

    const validation = validateClient(body)
    if (!validation.success) {
        return new Response(
            JSON.stringify({
                success: false,
                error: validation.errors,
                code: 'VALIDATION_ERRORS'
            }),
            { status: 422 }
        )
    }

    const clientData = validation.data!

   try {
        const { data, error } = await locals.supabase
            .from('clients')
            .update({
                ...clientData,
                updated_at: new Date().toISOString()
            })
            .select()
            .eq('id', clientId)
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
                message: 'Client updated',
                client: data
            }),
            { status: 200 }
        )
   } catch(err) {
    console.error((err as Error).message)
    return new Response(
        JSON.stringify({
            success: false,
            error: (err as Error).message,
            code: 'INTERNAL_SERVER_ERROR'
        }),
        { status: 500 }
    )
   }
}