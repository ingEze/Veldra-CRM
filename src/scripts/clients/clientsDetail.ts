import { fetchAPI } from '../../lib/fetchApi'
import { showAlert } from '../../lib/showAlert'
import { clientManager } from '../../scripts/clientModal'
import { loadClientMeetings } from './meetingsInClient'

const pathParts = window.location.pathname.split('/')
const id = pathParts[pathParts.length - 1]

let currentClient: any = null

function getInitials(name: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatRevenue(amount: any): string {
  const value = parseFloat(amount)
  if (isNaN(value) || value === 0) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string) {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const diffDays = Math.round(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    diffDays,
    'day'
  )
}

async function loadClient() {
  const loadingState = document.getElementById('loadingState')
  const mainContent = document.getElementById('mainContent')

  try {
    const res = await fetchAPI(`/api/clients/${id}`, 'GET')
    if (!res.ok) throw new Error('Client not found')

    const data = await res.json()
    currentClient = data.client

    const fullNameOrEnterprise =
      currentClient.full_name || currentClient.enterprise || 'Unknown'

    document.getElementById('clientName')!.textContent = fullNameOrEnterprise
    document.getElementById('clientCompany')!.textContent =
      currentClient.enterprise || 'Individual Client'
    document.getElementById('clientInitials')!.textContent =
      getInitials(fullNameOrEnterprise)
    document.getElementById('statEmail')!.textContent =
      currentClient.email || '—'
    document.getElementById('statPhone')!.textContent =
      currentClient.phone || '—'
    document.getElementById('statCountry')!.textContent =
      currentClient.country || '—'
    document.getElementById('statRevenue')!.textContent = formatRevenue(
      currentClient.estimated_revenue
    )
    document.getElementById('notesContent')!.textContent =
      currentClient.notes || 'No notes yet'
    document.getElementById('createdAt')!.textContent = formatDate(
      currentClient.created_at
    )
    document.getElementById('updatedAt')!.textContent = formatDate(
      currentClient.updated_at
    )

    const email = currentClient.email
    const phone = currentClient.phone

    const btnEmail = document.getElementById(
      'btnSendEmail'
    ) as HTMLAnchorElement
    const btnCall = document.getElementById('btnCall') as HTMLAnchorElement
    const btnWA = document.getElementById('btnWhatsapp') as HTMLAnchorElement

    if (email) {
      btnEmail.href = `mailto:${email}`
    } else {
      btnEmail.classList.add('opacity-40', 'pointer-events-none')
    }

    if (phone) {
      const cleanPhone = phone.replace(/\s/g, '')
      btnCall.href = `tel:${cleanPhone}`
      btnWA.href = `https://wa.me/${cleanPhone.replace('+', '')}`
    } else {
      btnCall.classList.add('opacity-40', 'pointer-events-none')
      btnWA.classList.add('opacity-40', 'pointer-events-none')
    }

    const btnAddProject = document.getElementById(
      'btnAddProject'
    ) as HTMLAnchorElement
    if (btnAddProject) btnAddProject.href = `/app/projects/new?client=${id}` // ------- esto no existe, crear modal

    const btnAddMeeting = document.getElementById(
      'btnAddMeeting'
    ) as HTMLButtonElement

    if (btnAddMeeting) {
      btnAddMeeting.addEventListener('click', () => {
        ;(window as any).openMeetingModal?.()

        let attempts = 0
        const tryPreselect = async () => {
          const select = document.getElementById(
            'meetingClientId'
          ) as HTMLSelectElement

          if (!select) return

          if (select.querySelector(`option[value="${id}"]`)) {
            select.value = id
          } else if (attempts < 10) {
            attempts++
            setTimeout(tryPreselect, 150)
          }
        }
        setTimeout(tryPreselect, 100)
      })
    }

    const statusBadge = document.getElementById('statusBadge')!
    const statusMap: any = {
      new_lead: {
        label: 'New Lead',
        bg: '#eff6ff',
        text: '#2563eb',
        border: '#bfdbfe',
      },
      proposal_sent: {
        label: 'Proposal Sent',
        bg: '#faf5ff',
        text: '#7c3aed',
        border: '#e9d5ff',
      },
      approved: {
        label: 'Approved',
        bg: '#f0fdf4',
        text: '#166534',
        border: '#bbf7d0',
      },
      in_progress: {
        label: 'In Progress',
        bg: '#fffbeb',
        text: '#92400e',
        border: '#fef3c7',
      },
      delivered: {
        label: 'Delivered',
        bg: '#f0fdfa',
        text: '#065f46',
        border: '#99f6e4',
      },
      awaiting_payment: {
        label: 'Awaiting Payment',
        bg: '#fff7ed',
        text: '#c2410c',
        border: '#fed7aa',
      },
      paid: {
        label: 'Paid',
        bg: '#dcfce7',
        text: '#15803d',
        border: '#bbf7d0',
      },
      rejected: {
        label: 'Rejected',
        bg: '#fef2f2',
        text: '#b91c1c',
        border: '#fecaca',
      },
      on_hold: {
        label: 'On Hold',
        bg: '#f8fafc',
        text: '#475569',
        border: '#e2e8f0',
      },
    }

    const config = statusMap[currentClient.status] || statusMap['new_lead']
    statusBadge.textContent = config.label
    statusBadge.style.backgroundColor = config.bg
    statusBadge.style.color = config.text
    statusBadge.style.borderColor = config.border

    loadingState?.classList.add('hidden')
    mainContent?.classList.remove('hidden')

    loadClientMeetings(id)

    document.addEventListener('meeting:save', async (e: Event) => {
      const payload = (e as CustomEvent).detail
      try {
        const res = await fetchAPI('/api/meetings', 'POST', payload)
        if (!res.ok) {
          const errMsg = await res.json()
          console.error(errMsg)
          return
        }
        setTimeout(() => loadClientMeetings(id), 400)
      } catch (err) {
        console.error('Save meeting failed', (err as Error).message)
      }
    })
  } catch (error) {
    console.error(error)
    showAlert({
      message: 'ERROR',
      description: 'Could not load client',
      type: 'ERROR',
    })
    window.location.href = '/app/dashboard'
  }
}

async function deleteClient() {
  try {
    const res = await fetchAPI(`/api/clients/${id}`, 'DELETE')
    if (!res.ok) {
      const errMsg = await res.json()
      console.error(errMsg)
      return
    }
    window.location.href = '/app/dashboard?client_deleted=true'
  } catch (err) {
    console.error('err', err)
    console.error('err msg', (err as Error).message)
  }
}

async function updateClient() {
  if (currentClient) return clientManager.open('UPDATE', currentClient)
}

document
  .getElementById('btnBack')
  ?.addEventListener('click', () => (window.location.href = '/app/dashboard'))
document
  .getElementById('btnEditClient')
  ?.addEventListener('click', async () => updateClient())
document
  .getElementById('btnDeleteClient')
  ?.addEventListener('click', async () => deleteClient())

loadClient()
