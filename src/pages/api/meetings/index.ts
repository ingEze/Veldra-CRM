import type { APIRoute } from 'astro'
import { validateMeeting } from '../../../lib/schemas/meetings/new'

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const clientId = url.searchParams.get('client_id')

    let query = locals.supabase
      .from('meetings')
      .select(
        `
        *,
        clients (
          full_name,
          enterprise
        )
      `
      )
      .order('created_at', { ascending: false })

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message ?? 'Unknown error',
          code: error.code,
        }),
        { status: 400 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        meetings: data,
      })
    )
  } catch (err) {
    const errMsg = err as Error
    console.error(errMsg.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: errMsg.message,
        code: 'INTERNAL_SERVER_ERROR',
      }),
      { status: 500 }
    )
  }
}

export const POST: APIRoute = async ({ locals, request }) => {
  const body = await request.json()
  const validation = validateMeeting(body)
  if (!validation.success) {
    console.error('Validation error', validation.error)
    return new Response(
      JSON.stringify({
        success: false,
        error: validation.error,
        code: 'VALIDATION_ERROR',
      }),
      { status: 422 }
    )
  }

  try {
    const { data, error } = await locals.supabase
      .from('meetings')
      .insert(validation.data)

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          code: error.code,
        }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Meeting created successfully',
        meetings: data,
      }),
      { status: 201 }
    )
  } catch (err) {
    const errMsg = err as Error
    console.error(errMsg.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: errMsg.message,
        code: 'INTERNAL_SERVER_ERROR',
      }),
      { status: 500 }
    )
  }
}
