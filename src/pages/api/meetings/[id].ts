import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals, params }) => {
  const meetingId = params.id
  if (!meetingId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Meeting id is required' }),
      { status: 400 }
    )
  }

  try {
    const { data, error } = await locals.supabase
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
      .eq('id', meetingId)
      .single()

    if (error) {
      console.error(error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          code: error.code,
        }),
        { status: 500 }
      )
    }

    return new Response(JSON.stringify({ success: true, meeting: data }), {
      status: 200,
    })
  } catch (err) {
    const errMsg = err as Error
    console.error(errMsg)
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

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const meetingId = params.id
  if (!meetingId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Meeting id is required' }),
      { status: 400 }
    )
  }

  try {
    const body = await request.json()

    // Only allow updating safe fields — never let the client overwrite id, user_id, client_id
    const allowed = [
      'questions',
      'notes',
      'links',
      'status',
      'title',
      'meeting_date',
      'type',
    ]
    const updates: Record<string, any> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid fields to update' }),
        { status: 400 }
      )
    }

    const { data, error } = await locals.supabase
      .from('meetings')
      .update(updates)
      .eq('id', meetingId)
      .select()
      .single()

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

    return new Response(JSON.stringify({ success: true, meeting: data }), {
      status: 200,
    })
  } catch (err) {
    const errMsg = err as Error
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

export const DELETE: APIRoute = async ({ locals, params }) => {
  const meetingId = params.id
  if (!meetingId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Meeting id is required' }),
      { status: 400 }
    )
  }

  try {
    const { data, error } = await locals.supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId)
      .select()
      .single()

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
        message: 'Meeting deleted successfully',
        meeting: data,
      }),
      { status: 200 }
    )
  } catch (err) {
    const errMsg = err as Error
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
