import { fetchAPI } from '../../lib/fetchApi'
import { showAlert } from '../../lib/showAlert'

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  phone_call: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.88 19.79 19.79 0 0 1 1.06 3.22 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  video_call: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  in_person: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
  chat: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  other: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
}

const TYPE_LABELS: Record<string, string> = {
  phone_call: 'Phone call',
  video_call: 'Video call',
  in_person: 'In person',
  chat: 'Chat',
  other: 'Other',
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  scheduled: { bg: '#eff6ff', text: '#2563eb', label: 'Scheduled' },
  completed: { bg: '#dcfce7', text: '#15803d', label: 'Completed' },
  cancelled: { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled' },
  rescheduled: { bg: '#fefce8', text: '#b45309', label: 'Rescheduled' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHTML(str: string) {
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function formatDateShort(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const isToday = d.toDateString() === today.toDateString()
  const isTomorrow = d.toDateString() === tomorrow.toDateString()
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isToday) return `Today · ${time}`
  if (isTomorrow) return `Tomorrow · ${time}`
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ` · ${time}`
  )
}

// ── Render ────────────────────────────────────────────────────────────────────

export function renderClientMeetings(meetings: any[]) {
  const list = document.getElementById('meetingsList')!
  const empty = document.getElementById('meetingsEmpty')!

  if (meetings.length === 0) {
    empty.classList.remove('hidden')
    return
  }

  empty.classList.add('hidden')

  // Inject cards before the empty div (keep it in DOM for toggle)
  const cards = meetings
    .map((m) => {
      const ss = STATUS_STYLES[m.status] ?? STATUS_STYLES.scheduled
      const qCount = Array.isArray(m.questions)
        ? m.questions.filter(Boolean).length
        : 0
      const answeredCount = Array.isArray(m.questions)
        ? m.questions.filter((q: any) =>
            typeof q === 'object' ? q.answer : false
          ).length
        : 0

      return `
    <div
      class="meeting-card group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
      data-meeting-id="${m.id}"
      role="button"
      tabindex="0"
    >
      <div class="px-3.5 py-3 flex flex-col gap-1.5 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-[13px] font-medium text-slate-800 leading-snug line-clamp-2 flex-1">
            ${escapeHTML(m.title)}
          </h3>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 mt-0.5"
                style="background:${ss.bg}; color:${ss.text}">
            ${ss.label}
          </span>
        </div>

        <div class="flex items-center gap-x-3 gap-y-0.5 flex-wrap mt-1">
          <span class="flex items-center gap-1 text-[11.5px] text-slate-400">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${formatDateShort(m.meeting_date)}
          </span>
          <span class="flex items-center gap-1 text-[11.5px] text-slate-400">
            ${TYPE_ICONS[m.type] ?? TYPE_ICONS.other}
            ${TYPE_LABELS[m.type] ?? 'Other'}
          </span>
        </div>
      </div>

      <div class="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        ${
          qCount > 0
            ? `
          <span class="flex items-center gap-1 text-[11px] ${answeredCount === qCount ? 'text-emerald-600' : 'text-slate-400'}">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            ${answeredCount}/${qCount} answered
          </span>
        `
            : '<span class="text-[11px] text-slate-300">No questions</span>'
        }

        <span class="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors">
          View details
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
      </div>
    </div>`
    })
    .join('')

  empty.insertAdjacentHTML('beforebegin', cards)

  document.querySelectorAll('.meeting-card').forEach((card) => {
    const handler = () => {
      const id = (card as HTMLElement).dataset.meetingId
      if (id) window.location.href = `/app/meetings/${id}`
    }
    card.addEventListener('click', handler)
    card.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') handler()
    })
  })
}

export async function loadClientMeetings(clientId: string) {
  try {
    const res = await fetchAPI(`/api/meetings?client_id=${clientId}`, 'GET')
    if (!res.ok) return

    const data = await res.json()
    renderClientMeetings(data.meetings ?? data ?? [])
  } catch (err) {
    console.error('Failed to load client meetings:', err)
    showAlert({ message: 'ERROR', description: 'Could not load meetings' })
  }
}
