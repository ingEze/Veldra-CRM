import { createServerClient, parseCookieHeader } from '@supabase/ssr'


export function createSupabaseServerClient(context: { headers: Headers, cookies: any }) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get('Cookie') ?? '').filter(
            (cookie): cookie is { name: string; value: string } => cookie.value !== undefined
          )
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          )
        }
      }
    }
  )
}