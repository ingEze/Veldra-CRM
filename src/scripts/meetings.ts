import { fetchAPI } from '../lib/fetchApi'
import { showAlert } from '../lib/showAlert'
import type { Meeting } from '../types/meetings'

// ── Config ────────────────────────────────────────────────────────────────────

const MAX_MEETINGS_PER_CLIENT = 3

const TYPE_ICONS: Record<Meeting['type'], string> = {
  phone_call: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.88 19.79 19.79 0 0 1 1.06 3.22 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  video_call: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  in_person: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  chat: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  other: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
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

const TRASH_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6M14 11v6"/>
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
</svg>`

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

function getClientInitials(name: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getAvatarGradient(name: string) {
  const gradients = [
    ['#6b9177', '#537860'],
    ['#6b8bb5', '#4a6a91'],
    ['#b5896b', '#916a4a'],
    ['#9177b5', '#705a91'],
    ['#b5736b', '#91514a'],
  ]
  const idx = name.charCodeAt(0) % gradients.length
  return gradients[idx]
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderMeetings(meetings: Meeting[]) {
  const list = document.getElementById('meetingsList')
  const empty = document.getElementById('meetingsEmpty')
  const section = document.getElementById('meetingsSection')
  const loading = document.getElementById('meetingsLoading')

  if (!list || !empty || !section) return

  // Hide loading
  if (loading) {
    loading.classList.remove('grid')
    loading.classList.add('hidden')
  }

  // Show section
  section.classList.remove('hidden')
  section.classList.add('flex')

  if (meetings.length === 0) {
    empty.classList.remove('hidden')
    empty.classList.add('flex')
    list.classList.remove('grid')
    list.classList.add('hidden')
    return
  }

  empty.classList.remove('flex')
  empty.classList.add('hidden')

  list.classList.remove('hidden')
  list.classList.add('grid')

  const clientCounts: Record<string, number> = {}
  meetings.forEach((m) => {
    if (m.client_id)
      clientCounts[m.client_id] = (clientCounts[m.client_id] || 0) + 1
  })

  list.innerHTML = meetings
    .map((m) => {
      const ss = STATUS_STYLES[m.status] || STATUS_STYLES.scheduled
      const clientName =
        m.clients?.full_name || m.clients?.enterprise || 'No client linked'
      const initials = getClientInitials(clientName)
      const [fromColor, toColor] = getAvatarGradient(clientName)
      const count = m.client_id ? clientCounts[m.client_id] : 0
      const atLimit = count >= MAX_MEETINGS_PER_CLIENT
      const qCount = Array.isArray(m.questions)
        ? m.questions.filter(Boolean).length
        : 0

      const dots = Array.from({ length: MAX_MEETINGS_PER_CLIENT })
        .map((_, i) => {
          const filled = i < count
          const color =
            filled && atLimit ? '#d97706' : filled ? '#6b9177' : '#e2e8f0'
          return `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color}"></span>`
        })
        .join('')

      return `
      <div class="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">

        <div class="px-3.5 py-3 border-b border-slate-100 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-medium"
               style="background: linear-gradient(135deg, ${fromColor}, ${toColor})">
            ${initials}
          </div>
          <p class="text-[13px] font-medium text-slate-700 truncate flex-1 min-w-0">${escapeHTML(clientName)}</p>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium shrink-0"
                style="background:${ss.bg}; color:${ss.text}">
            ${ss.label}
          </span>
        </div>

        <div class="px-3.5 py-3 flex flex-col gap-2 flex-1">
          <h3 class="text-[13.5px] font-medium text-slate-800 leading-snug line-clamp-2">${escapeHTML(m.title)}</h3>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span class="flex items-center gap-1 text-[12px] text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.6">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              ${formatDateShort(m.meeting_date)}
            </span>
            <span class="flex items-center gap-1 text-[12px] text-slate-400">
              ${TYPE_ICONS[m.type] || TYPE_ICONS.other}
              ${TYPE_LABELS[m.type]}
            </span>
          </div>
        </div>

        <div class="px-3.5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] text-slate-400">Meetings</span>
            <div class="flex items-center gap-1">${dots}</div>
            <span class="text-[11px] ${atLimit ? 'text-amber-600 font-medium' : 'text-slate-400'}">${count}/${MAX_MEETINGS_PER_CLIENT}</span>
          </div>
          <div class="flex items-center gap-2">
            ${
              qCount > 0
                ? `
              <span class="flex items-center gap-1 text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ${qCount} question${qCount !== 1 ? 's' : ''}
              </span>`
                : ''
            }
            <button
              class="delete-meeting-btn opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
              data-meeting-id="${m.id}"
              title="Delete meeting">
              ${TRASH_ICON}
            </button>
          </div>
        </div>
      </div>`
    })
    .join('')

  attachDeleteHandlers()
}

// ── Delete ────────────────────────────────────────────────────────────────────

function attachDeleteHandlers() {
  document.querySelectorAll('.delete-meeting-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const id = (btn as HTMLElement).dataset.meetingId
      if (!id) return
      ;(window as any).openDeleteMeetingModal?.(id)
    })
  })
}

// ── Load ──────────────────────────────────────────────────────────────────────

async function loadMeetings() {
  const loading = document.getElementById('meetingsLoading')
  const list = document.getElementById('meetingsList')
  const empty = document.getElementById('meetingsEmpty')

  empty?.classList.add('hidden')
  empty?.classList.remove('flex')
  list?.classList.remove('grid')
  list?.classList.add('hidden')

  if (loading) {
    loading.classList.remove('hidden')
    loading.classList.add('grid')
  }

  try {
    const res = await fetchAPI('/api/meetings', 'GET')
    if (!res.ok) {
      loading?.classList.remove('grid')
      loading?.classList.add('hidden')
      return
    }
    const data = await res.json()
    renderMeetings(data.meetings ?? data ?? [])
  } catch (err) {
    showAlert({ message: 'ERROR', description: 'Failed to load meetings' })
    console.error('Failed to load meetings:', err)
    loading?.classList.remove('grid')
    loading?.classList.add('hidden')
  }
}

document.addEventListener('meeting:save', async (e: Event) => {
  const payload = (e as CustomEvent).detail
  console.log('e', e)
  console.log(payload)
  const saveBtn = document.getElementById(
    'saveMeetingBtn'
  ) as HTMLButtonElement | null
  try {
    const res = await fetchAPI('/api/meetings', 'POST', payload)
    if (!res.ok) {
      const errMsg = await res.json()
      console.error(errMsg)
    }
    loadMeetings()
  } catch (err) {
    console.error('Save meeting failed:', err)
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false
      saveBtn.textContent = 'Save meeting'
    }
  }
})
;(window as any).loadMeetings = loadMeetings

document.getElementById('btnAddMeeting')?.addEventListener('click', () => {
  ;(window as any).openMeetingModal?.()
})
document.getElementById('btnEmptyAddMeeting')?.addEventListener('click', () => {
  ;(window as any).openMeetingModal?.()
})
