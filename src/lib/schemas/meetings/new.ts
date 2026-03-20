import { z } from 'zod'

const MEETING_TYPE = [
  'phone_call',
  'video_call',
  'in_person',
  'chat',
  'other',
] as const

const MEETING_STATUS = [
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled',
] as const

export const meetingsSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string(),
  meeting_date: z.string().optional(),
  type: z.enum(MEETING_TYPE),
  status: z.enum(MEETING_STATUS),
  questions: z
    .array(z.string().min(1))
    .max(5, 'No puedes tener más de 5 preguntas')
    .default([])
    .optional(),
})

type Meeting = z.infer<typeof meetingsSchema>

export function validateMeeting(input: Meeting) {
  const result = meetingsSchema.safeParse(input)
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors,
    }
  }
  return {
    success: true,
    data: result.data,
  }
}
