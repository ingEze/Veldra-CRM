import type { APIRoute } from "astro"

export const GET: APIRoute = async({ locals, url }) => {
    try {
        const urlParams = new URL(url)
        const page = parseInt(urlParams.searchParams.get('page') || '1')
        const limit = parseInt(urlParams.searchParams.get('limit') || '1')

        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, error, count } = await locals.supabase
            .from('clients')
            .select('*', { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false })

        if(error) {
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
                clients: data,
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                    hasNext: to < ( count || 0 ) - 1,
                    hasPrev: page > 1
                }
            }),
            { status: 200 }
        )
    } catch (err) {
        console.error((err as Error).message)
        throw err
    }
}