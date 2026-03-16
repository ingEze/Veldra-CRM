import { z } from 'zod'

const CLIENT_STATUS = [
    'new_lead',
    'proposal_sent',
    'approved',
    'in_progress',
    'delivered',
    'awaiting_payment',
    'paid',
    'rejected',
    'on_hold'
] as const

export const clientSchema = z.object({
    email: z.string().email({ message: 'Gmail invalid' }).optional(),
    full_name: z.string().optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    estimated_revenue: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    enterprise: z.string().optional(),
    status: z.enum(CLIENT_STATUS)
}).superRefine((data, ctx) => {
    if(!data.full_name?.trim() && !data.enterprise?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter a client name or company name.",
            path: ['full_name']
        })
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter a client name or company name.",
            path: ['enterprise']
        })
    }
})

export function validateClient(input: unknown) {
    const result = clientSchema.safeParse(input)
    if(!result.success) {
        return {
            success: false,
            errors: result.error.errors
        }
    }
    return {
        success: true,
        data: result.data
    }
}