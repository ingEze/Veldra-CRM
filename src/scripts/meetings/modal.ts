import { fetchAPI } from '../../lib/fetchApi'
import { showAlert } from '../../lib/showAlert'
import type { Meeting } from '../../types/meetings'

function getModal() {
  return document.getElementById('meetingModal') as HTMLElement
}

function openMeetingModal() {
  const modal = getModal()
  if (!modal) return
  modal.classList.remove('hidden')
  modal.classList.add('flex', 'open')
  document.body.style.overflow = 'hidden'
  resetForm()
  loadClients()
}

function closeMeetingModal() {
  const modal = getModal()
  if (!modal) return
  modal.classList.add('hidden')
  modal.classList.remove('flex', 'open')
  document.body.style.overflow = ''
}

function resetForm() {
  const titleInput = document.getElementById('meetingTitle') as HTMLInputElement
  const dateInput = document.getElementById('meetingDate') as HTMLInputElement
  const typeSelect = document.getElementById('meetingType') as HTMLSelectElement
  const statusSelect = document.getElementById(
    'meetingStatus'
  ) as HTMLSelectElement
  const clientSelect = document.getElementById(
    'meetingClientId'
  ) as HTMLSelectElement

  if (titleInput) titleInput.value = ''
  if (dateInput) dateInput.value = ''
  if (typeSelect) typeSelect.value = ''
  if (statusSelect) statusSelect.value = 'scheduled'
  if (clientSelect) clientSelect.value = ''

  clearQuestions()
}

let questionCount = 0
const MAX_QUESTIONS = 5

function clearQuestions() {
  const list = document.getElementById('questionsList')
  if (list) list.innerHTML = ''
  questionCount = 0
  updateQuestionUI()
}

function updateQuestionUI() {
  const countEl = document.getElementById('questionsCount')
  const addBtn = document.getElementById('addQuestionBtn')
  const limitMsg = document.getElementById('questionsLimitNotice')

  if (countEl) countEl.textContent = `${questionCount} / ${MAX_QUESTIONS}`
  if (addBtn) addBtn.toggleAttribute('disabled', questionCount >= MAX_QUESTIONS)
  if (limitMsg) {
    if (questionCount >= MAX_QUESTIONS) {
      limitMsg.classList.remove('hidden')
      limitMsg.classList.add('flex')
    } else {
      limitMsg.classList.add('hidden')
      limitMsg.classList.remove('flex')
    }
  }
}

function addQuestion(value = '') {
  if (questionCount >= MAX_QUESTIONS) return

  questionCount++
  const index = questionCount
  const list = document.getElementById('questionsList')
  if (!list) return

  const row = document.createElement('div')
  row.className = 'question-row'
  row.dataset.qindex = String(index)

  row.innerHTML = `
      <span class="text-[11px] font-bold text-slate-300 w-4 shrink-0 text-right select-none">${index}</span>
      <input
        type="text"
        class="input-field flex-1"
        placeholder="e.g. What are their main pain points?"
        maxlength="200"
        value="${escapeAttr(value)}"
      />
      <button type="button" class="question-remove-btn" aria-label="Remove question">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `

  const removeBtn = row.querySelector(
    '.question-remove-btn'
  ) as HTMLButtonElement
  removeBtn.addEventListener('click', () => {
    row.remove()
    questionCount--
    reindexQuestions()
    updateQuestionUI()
  })

  list.appendChild(row)
  updateQuestionUI()

  const input = row.querySelector('input') as HTMLInputElement
  input?.focus()
}

function reindexQuestions() {
  const rows = document.querySelectorAll('#questionsList .question-row')
  rows.forEach((row, i) => {
    const numEl = row.querySelector('span') as HTMLSpanElement
    if (numEl) numEl.textContent = String(i + 1)
  })
}

function getQuestions(): string[] {
  const inputs = document.querySelectorAll(
    '#questionsList .question-row input'
  ) as NodeListOf<HTMLInputElement>
  return Array.from(inputs)
    .map((i) => i.value.trim())
    .filter(Boolean)
}

function escapeAttr(str: string) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

async function loadClients() {
  const select = document.getElementById('meetingClientId') as HTMLSelectElement
  if (!select) return
  try {
    const res = await fetchAPI('/api/clients?limit=100', 'GET')
    if (!res.ok) return
    const data = await res.json()
    const clients: Array<{
      id: string
      full_name?: string
      enterprise?: string
    }> = data.clients || []
    select.innerHTML =
      '<option value="" disabled selected>No client linked</option>'
    clients.forEach((c) => {
      const label = c.full_name || c.enterprise || 'Unknown'
      const opt = document.createElement('option')
      opt.value = c.id
      opt.textContent = label
      select.appendChild(opt)
    })
  } catch {
    // silently fail
  }
}

function collectFormData() {
  const title = (
    document.getElementById('meetingTitle') as HTMLInputElement
  )?.value.trim()
  const date = (document.getElementById('meetingDate') as HTMLInputElement)
    ?.value
  const type = (document.getElementById('meetingType') as HTMLSelectElement)
    ?.value
  const status = (document.getElementById('meetingStatus') as HTMLSelectElement)
    ?.value
  const clientId = (
    document.getElementById('meetingClientId') as HTMLSelectElement
  )?.value

  return {
    title,
    meeting_date: date ? new Date(date).toISOString() : '',
    type,
    status,
    client_id: clientId || null,
    questions: getQuestions(),
  }
}

function markError(fieldId: string) {
  const el = document.getElementById(fieldId)
  el?.classList.add('input-error')
  el?.addEventListener('input', () => el.classList.remove('input-error'), {
    once: true,
  })
}

const MAX_MEETINGS_PER_CLIENT = 3

function checkClientLimit(
  meetings: Meeting[],
  clientId: string | null
): boolean {
  if (!clientId) return true
  const count = meetings.filter((m) => m.client_id === clientId).length
  return count < MAX_MEETINGS_PER_CLIENT
}

async function handleSave(e: Event) {
  e.preventDefault()

  const saveBtn = document.getElementById('saveMeetingBtn') as HTMLButtonElement
  const data = collectFormData()
  if (!data.title) markError('meetingTitle')
  if (!data.type) markError('meetingType')
  if (!data.title || !data.type) return

  if (!data.client_id) {
    showAlert({
      message: 'Client Required',
      description: 'Please select a valid client to continue',
      type: 'ERROR',
    })
    return
  }

  console.log('pasó')

  try {
    const res = await fetchAPI('/api/meetings', 'GET')
    const allMeetings = await res.json()
    const meetingsArray = allMeetings.meetings ?? allMeetings ?? []

    const count = meetingsArray.filter(
      (m: any) => m.client_id === data.client_id
    ).length

    if (count >= MAX_MEETINGS_PER_CLIENT) {
      showAlert({
        message: 'Limit Reached',
        description:
          'This client already has 3 scheduled meetings. Please complete or delete one to add more.',
        type: 'ERROR',
      })
      return
    }
  } catch (err) {
    console.error('Error checking limits:', (err as Error).message)
  }

  saveBtn.disabled = true
  saveBtn.textContent = 'Saving…'

  const event = new CustomEvent('meeting:save', {
    detail: data,
    bubbles: true,
  })
  document.dispatchEvent(event)
  closeMeetingModal()
}

document.getElementById('meetingForm')?.addEventListener('submit', handleSave)
document
  .getElementById('addQuestionBtn')
  ?.addEventListener('click', () => addQuestion())
document
  .getElementById('closeMeetingModal')
  ?.addEventListener('click', closeMeetingModal)
document
  .getElementById('cancelMeetingModal')
  ?.addEventListener('click', closeMeetingModal)
document
  .getElementById('meetingModalBackdrop')
  ?.addEventListener('click', closeMeetingModal)
;(window as any).openMeetingModal = openMeetingModal
;(window as any).closeMeetingModal = closeMeetingModal
