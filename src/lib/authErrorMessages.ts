export const authErrorMessages: Record<string, string> = {
  USER_ALREADY_EXISTS: 'Este correo ya tiene una cuenta.',
  EMAIL_EXISTS: 'Este correo ya tiene una cuenta.',
  EMAIL_NOT_CONFIRMED: 'Confirmá tu email antes de ingresar.',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos.',
  OVER_EMAIL_SEND_RATE_LIMIT: 'Demasiados correos enviados. Intentá luego.',
  TOO_MANY_ATTEMPTS: 'Demasiados intentos. Esperá unos minutos.',
  SIGNUP_DISABLED: 'El registro está deshabilitado.',
  VALIDATION_ERROR: 'Datos inválidos.',
  USER_NOT_CREATED: 'No se pudo crear el usuario.',
  AUTH_PROVIDER_ERROR: 'Error inesperado al iniciar sesión.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado. Intentá de nuevo.'
}

export function parseAuthError(code?: string) {
  if (!code) return authErrorMessages.UNKNOWN_ERROR
  return authErrorMessages[code] ?? authErrorMessages.UNKNOWN_ERROR
}