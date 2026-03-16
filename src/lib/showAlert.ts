interface AlertOptions {
  message: string
  description?: string
  duration?: number
  type?: 'ERROR' | 'SUCCESS'
}

function showAlert({ message, description, duration = 3500, type = 'SUCCESS' }: AlertOptions): void {
  const existing = document.getElementById('appAlert')
  if (existing) existing.remove()

  const isError = type === 'ERROR'

  const styles = isError ? {
    border:  'border-red-100',
    shadow:  'shadow-[0_4px_24px_rgba(248,113,113,0.15),0_0_0_1px_rgba(248,113,113,0.1)]',
    iconBg:  'bg-red-50 border-red-100',
    iconStroke: '#f87171',
    closeHover: 'hover:bg-red-50',
  } : {
    border:  'border-emerald-100',
    shadow:  'shadow-[0_4px_24px_rgba(52,211,153,0.15),0_0_0_1px_rgba(52,211,153,0.1)]',
    iconBg:  'bg-emerald-50 border-emerald-100',
    iconStroke: '#34d399',
    closeHover: 'hover:bg-emerald-50',
  }

  const icon = isError ? `
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  ` : `
    <polyline points="20 6 9 17 4 12"/>
  `

  const alertEl = document.createElement('div')
  alertEl.id        = 'appAlert'
  alertEl.className = 'fixed top-5 left-0 right-0 mx-auto z-50 w-[calc(100%-32px)] max-w-md'
  alertEl.style.animation = 'fadeDown 0.4s ease both'

  alertEl.innerHTML = description
    ? `
      <div class="flex items-start gap-3 bg-white border ${styles.border} rounded-2xl px-4 py-3.5 ${styles.shadow}">
        <div class="shrink-0 w-7 h-7 rounded-lg ${styles.iconBg} border flex items-center justify-center mt-0.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${styles.iconStroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            ${icon}
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[13.5px] font-medium text-slate-700 leading-snug">${message}</p>
          <p class="text-[12.5px] text-slate-400 mt-0.5 leading-relaxed">${description}</p>
        </div>
        <button id="btnCloseAppAlert" class="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-500 ${styles.closeHover} transition-all mt-0.5" aria-label="Cerrar">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `
    : `
      <div class="flex items-center justify-center bg-white border ${styles.border} rounded-2xl py-3.5 ${styles.shadow}">
        <p class="text-[13.5px] font-medium text-slate-700 text-center leading-snug">${message}</p>
      </div>
    `

  document.body.appendChild(alertEl)

  function closeAlert() {
    alertEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
    alertEl.style.opacity    = '0'
    alertEl.style.transform  = 'translateY(-10px)'
    setTimeout(() => alertEl.remove(), 300)
  }

  document.getElementById('btnCloseAppAlert')?.addEventListener('click', closeAlert)
  setTimeout(closeAlert, duration)
}

export { showAlert }