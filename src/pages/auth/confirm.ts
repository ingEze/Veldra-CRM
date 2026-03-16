import type { APIRoute } from "astro"

export const GET: APIRoute = async({ url, redirect, cookies, locals }) => {
    const code = url.searchParams.get('code')
    const errorParam = url.searchParams.get('error')
    const errorDesc = url.searchParams.get('error_description')

    if(errorParam) {
        return redirect(`/login?error=invalid_link&description=${encodeURIComponent(errorDesc ?? '')}`)
    }

    if (code) {
        const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code)

        if(error) {
            return redirect('/login?error=invalid_link')
        }

        cookies.set('sb-access-token', data.session.access_token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' })
        cookies.set('sb-refresh-token', data.session.refresh_token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' })

        return redirect('/app/dashboard')
    }

    return redirect('/login?error=invalid_link')
}