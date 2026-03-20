import { fetchAPI } from '../../lib/fetchApi'
import { showAlert } from '../../lib/showAlert'

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuestionItem {
  question: string
  answer?: string
}

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; icon: string }
> = {
  phone_call: {
    label: 'Phone call',
    bg: '#f0fdf4',
    color: '#16a34a',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.88 19.79 19.79 0 0 1 1.06 3.22 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  },
  video_call: {
    label: 'Video call',
    bg: '#eff6ff',
    color: '#2563eb',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  },
  in_person: {
    label: 'In person',
    bg: '#fff7ed',
    color: '#c2410c',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  chat: {
    label: 'Chat',
    bg: '#faf5ff',
    color: '#7c3aed',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
  other: {
    label: 'Other',
    bg: '#f8fafc',
    color: '#64748b',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  },
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  scheduled: {
    label: 'Scheduled',
    bg: '#eff6ff',
    text: '#2563eb',
    border: '#bfdbfe',
  },
  completed: {
    label: 'Completed',
    bg: '#dcfce7',
    text: '#15803d',
    border: '#bbf7d0',
  },
  cancelled: {
    label: 'Cancelled',
    bg: '#fef2f2',
    text: '#dc2626',
    border: '#fecaca',
  },
  rescheduled: {
    label: 'Rescheduled',
    bg: '#fefce8',
    text: '#b45309',
    border: '#fef08a',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHTML(str: string) {
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

function formatDateFull(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelative(dateString: string) {
  if (!dateString) return '—'
  const diffDays = Math.round(
    (new Date(dateString).getTime() - Date.now()) / 86400000
  )
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    diffDays,
    'day'
  )
}

function getCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const isPast = diff < 0
  const abs = Math.abs(diff)
  const days = Math.floor(abs / 86400000)
  const hours = Math.floor(abs / 3600000)
  const mins = Math.floor(abs / 60000)
  const value =
    days > 0
      ? `${days}d`
      : hours > 0
        ? `${hours}h`
        : mins > 0
          ? `${mins}m`
          : 'Now'
  return { label: isPast ? 'Elapsed' : 'In', value, isPast }
}

function normaliseQuestions(raw: any[]): QuestionItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((q) =>
    typeof q === 'string'
      ? { question: q, answer: '' }
      : { question: q.question, answer: q.answer ?? '' }
  )
}

// ── State ─────────────────────────────────────────────────────────────────────

let currentMeeting: any = null
let questions: QuestionItem[] = []
let answersChanged = false
let notesChanged = false

// ── Render ────────────────────────────────────────────────────────────────────

function renderQuestions() {
  const list = document.getElementById('questionsList')!
  const empty = document.getElementById('questionsEmpty')!
  const count = document.getElementById('questionsCount')!

  count.textContent = `${questions.length} question${questions.length !== 1 ? 's' : ''}`

  if (questions.length === 0) {
    list.innerHTML = ''
    empty.classList.remove('hidden')
    empty.classList.add('flex')
    return
  }

  empty.classList.add('hidden')
  empty.classList.remove('flex')

  list.innerHTML = questions
    .map(
      (q, i) => `
    <div class="rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all">
      <div class="flex items-start gap-3 mb-3">
        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold shrink-0 mt-0.5">
          ${i + 1}
        </span>
        <p class="text-[13.5px] font-medium text-slate-800 leading-snug flex-1">${escapeHTML(q.question)}</p>
      </div>
      <div class="pl-8">
        <textarea
          class="answer-textarea w-full text-[13px] text-slate-700 leading-relaxed placeholder:text-slate-300 resize-none outline-none border border-slate-200 rounded-lg bg-white px-3 py-2.5 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all min-h-18"
          data-index="${i}"
          placeholder="Write your answer here…"
          rows="3"
        >${escapeHTML(q.answer ?? '')}</textarea>
      </div>
    </div>
  `
    )
    .join('')

  list.querySelectorAll('.answer-textarea').forEach((el) => {
    el.addEventListener('input', (e) => {
      const idx = parseInt((e.target as HTMLTextAreaElement).dataset.index!)
      questions[idx].answer = (e.target as HTMLTextAreaElement).value
      setAnswersChanged(true)
    })
  })
}

function renderStatusButtons() {
  const container = document.getElementById('statusButtons')!
  container.innerHTML = Object.entries(STATUS_CONFIG)
    .map(([key, cfg]) => {
      const isCurrent = currentMeeting?.status === key
      return `
      <button
        class="status-btn px-2 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider border transition-all ${
          isCurrent
            ? 'pointer-events-none opacity-60'
            : 'hover:shadow-sm hover:-translate-y-px active:translate-y-0'
        }"
        style="background:${cfg.bg}; color:${cfg.text}; border-color:${cfg.border};"
        data-status="${key}" ${isCurrent ? 'disabled' : ''}>
        ${isCurrent ? '✓ ' : ''}${cfg.label}
      </button>`
    })
    .join('')

  container.querySelectorAll('.status-btn').forEach((btn) => {
    btn.addEventListener('click', () =>
      updateStatus((btn as HTMLElement).dataset.status!)
    )
  })
}

function setAnswersChanged(val: boolean) {
  answersChanged = val
  const bar = document.getElementById('saveAnswersBar')!
  val ? bar.classList.remove('hidden') : bar.classList.add('hidden')
}

function setNotesChanged(val: boolean) {
  notesChanged = val
  const btn = document.getElementById('btnSaveNotes')!
  const status = document.getElementById('notesStatus')!
  if (val) {
    btn.classList.remove('opacity-50', 'pointer-events-none')
    status.textContent = 'Unsaved changes'
  } else {
    btn.classList.add('opacity-50', 'pointer-events-none')
    status.textContent = ''
  }
}

function updateStatusBadge(status: string) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled
  const badge = document.getElementById('statusBadge')!
  badge.textContent = cfg.label
  badge.style.backgroundColor = cfg.bg
  badge.style.color = cfg.text
  badge.style.borderColor = cfg.border
}

function populateUI() {
  if (!currentMeeting) return
  const m = currentMeeting

  const typeCfg = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.other
  const bubble = document.getElementById('meetingTypeBubble')!
  bubble.style.background = typeCfg.bg
  bubble.style.color = typeCfg.color
  bubble.innerHTML = typeCfg.icon

  document.getElementById('meetingTitle')!.textContent = m.title

  const clientName = m.clients?.full_name || m.clients?.enterprise || null
  const clientLink = document.getElementById(
    'meetingClientLink'
  ) as HTMLAnchorElement
  if (clientName && m.client_id) {
    document.getElementById('meetingClientName')!.textContent = clientName
    clientLink.href = `/app/clients/${m.client_id}`
  } else {
    clientLink.style.display = 'none'
  }

  updateStatusBadge(m.status)

  document.getElementById('statDate')!.textContent = formatDateFull(
    m.meeting_date
  )
  document.getElementById('statTime')!.textContent = formatTime(m.meeting_date)
  document.getElementById('statType')!.textContent = typeCfg.label

  const { label, value, isPast } = getCountdown(m.meeting_date)
  document.getElementById('statCountdownLabel')!.textContent = label
  const countdownVal = document.getElementById('statCountdown')!
  countdownVal.textContent = value
  countdownVal.className = `text-[14px] font-bold ${isPast ? 'text-slate-500' : 'text-emerald-600'}`
  const countdownCard = document.getElementById('statCountdownCard')!
  countdownCard.style.background = isPast ? '#f8fafc' : '#f0fdf4'
  countdownCard.style.borderColor = isPast ? '#e2e8f0' : '#bbf7d0'
  ;(document.getElementById('meetingNotes') as HTMLTextAreaElement).value =
    m.notes ?? ''

  document.getElementById('actCreatedAt')!.textContent = formatRelative(
    m.created_at
  )
  document.getElementById('actUpdatedAt')!.textContent = formatRelative(
    m.updated_at
  )

  renderQuestions()
  renderStatusButtons()
}

// ── API ───────────────────────────────────────────────────────────────────────

async function loadMeeting(id: string) {
  try {
    // GET /api/meetings/:id  →  { success, meeting }
    // The [id].ts endpoint must include: .select('*, clients(full_name, enterprise)')
    const res = await fetchAPI(`/api/meetings/${id}`, 'GET')
    if (!res.ok) throw new Error('Not found')
    const data = await res.json()
    currentMeeting = data.meeting
    questions = normaliseQuestions(currentMeeting.questions)
    populateUI()
    document.getElementById('loadingState')!.classList.add('hidden')
    document.getElementById('mainContent')!.classList.remove('hidden')
  } catch (err) {
    console.error(err)
    showAlert({ message: 'ERROR', description: 'Could not load meeting' })
    history.back()
  }
}

async function saveAnswers() {
  if (!currentMeeting) return
  const btn = document.getElementById('btnSaveAnswers') as HTMLButtonElement
  btn.disabled = true
  btn.textContent = 'Saving…'
  try {
    // PATCH /api/meetings/:id  →  body: { questions: QuestionItem[] }
    const res = await fetchAPI(`/api/meetings/${currentMeeting.id}`, 'PATCH', {
      questions,
    })
    if (!res.ok) throw new Error()
    setAnswersChanged(false)
  } catch {
    showAlert({ message: 'ERROR', description: 'Could not save answers' })
  } finally {
    btn.disabled = false
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Save answers`
  }
}

async function saveNotes() {
  if (!currentMeeting) return
  const textarea = document.getElementById(
    'meetingNotes'
  ) as HTMLTextAreaElement
  const btn = document.getElementById('btnSaveNotes') as HTMLButtonElement
  btn.disabled = true
  btn.textContent = 'Saving…'
  try {
    // PATCH /api/meetings/:id  →  body: { notes: string }
    // Add column to Supabase: ALTER TABLE meetings ADD COLUMN notes text;
    const res = await fetchAPI(`/api/meetings/${currentMeeting.id}`, 'PATCH', {
      notes: textarea.value,
    })
    if (!res.ok) throw new Error()
    setNotesChanged(false)
    document.getElementById('notesStatus')!.textContent = 'Saved'
  } catch {
    showAlert({ message: 'ERROR', description: 'Could not save notes' })
  } finally {
    btn.disabled = false
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Save notes`
  }
}

async function updateStatus(newStatus: string) {
  if (!currentMeeting) return
  try {
    // PATCH /api/meetings/:id  →  body: { status: string }
    const res = await fetchAPI(`/api/meetings/${currentMeeting.id}`, 'PATCH', {
      status: newStatus,
    })
    if (!res.ok) throw new Error()
    currentMeeting.status = newStatus
    updateStatusBadge(newStatus)
    renderStatusButtons()
  } catch {
    showAlert({ message: 'ERROR', description: 'Could not update status' })
  }
}

async function deleteMeeting(id: string) {
  try {
    // DELETE /api/meetings/:id
    const res = await fetchAPI(`/api/meetings/${id}`, 'DELETE')
    if (!res.ok) throw new Error()
    history.back()
  } catch {
    showAlert({ message: 'ERROR', description: 'Could not delete meeting' })
  }
}

// ── Delete modal ──────────────────────────────────────────────────────────────

function openDeleteModal() {
  const overlay = document.getElementById('deleteMeetingOverlay')!
  const modal = document.getElementById('deleteMeetingModal')!
  overlay.classList.remove('hidden')
  overlay.classList.add('flex')
  requestAnimationFrame(() => {
    modal.style.transform = 'scale(1)'
    modal.style.opacity = '1'
  })
}

function closeDeleteModal() {
  const overlay = document.getElementById('deleteMeetingOverlay')!
  const modal = document.getElementById('deleteMeetingModal')!
  modal.style.transform = 'scale(0.95)'
  modal.style.opacity = '0'
  setTimeout(() => {
    overlay.classList.remove('flex')
    overlay.classList.add('hidden')
  }, 170)
}

// ── Init ──────────────────────────────────────────────────────────────────────

const meetingId = window.location.pathname.split('/').at(-1)!

loadMeeting(meetingId)

document
  .getElementById('btnBack')
  ?.addEventListener('click', () => history.back())
document
  .getElementById('btnDeleteMeeting')
  ?.addEventListener('click', openDeleteModal)
document
  .getElementById('deleteMeetingCancel')
  ?.addEventListener('click', closeDeleteModal)
document
  .getElementById('deleteMeetingConfirm')
  ?.addEventListener('click', () => {
    closeDeleteModal()
    deleteMeeting(meetingId)
  })
document
  .getElementById('deleteMeetingOverlay')
  ?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('deleteMeetingOverlay'))
      closeDeleteModal()
  })
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDeleteModal()
})
document
  .getElementById('btnSaveAnswers')
  ?.addEventListener('click', saveAnswers)
document
  .getElementById('meetingNotes')
  ?.addEventListener('input', () => setNotesChanged(true))
document.getElementById('btnSaveNotes')?.addEventListener('click', saveNotes)
