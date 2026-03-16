import type { APIRoute } from "astro"

export const GET: APIRoute = async({ url, redirect, locals }) => {
    const code = url.searchParams.get('code')

    if(code) {
        const { error } = await locals.supabase.auth.exchangeCodeForSession(code)
        if(!error) {
            return redirect('/login')
        }
    }

    return redirect('/login?error=invalid_link')
}