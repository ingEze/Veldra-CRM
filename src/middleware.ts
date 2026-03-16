import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from './lib/supabase'

export const onRequest = defineMiddleware(async (context, next): Promise<Response> => {
  const { pathname } = context.url

  const supabase = createSupabaseServerClient({
    headers: context.request.headers,
    cookies: context.cookies
  })

  context.locals.supabase = supabase

  const { data, error } = await context.locals.supabase.auth.getUser()
  const user = data?.user ?? null

  context.locals.user = user || undefined

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (user) {
      return context.redirect('/app/dashboard')
    }
  }

  if (pathname.startsWith('/app/')) {
    if (!user) {
      return context.redirect('/login')
    }
  }

  return next()
})