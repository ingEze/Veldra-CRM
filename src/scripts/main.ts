declare global {
  interface Window {
    toggleMobileSidebar: () => void
  }
}

import { fetchAPI } from '../lib/fetchApi'
import { showAlert } from '../lib/showAlert'
import { clientManager } from './clientModal'
import type { ClientView, StatusColorKey, State } from '../types/clients'

const params = new URLSearchParams(window.location.search)

if (params.get('client_deleted') === 'true') {
  showAlert({
    message: 'Client deleted',
    description: 'The client has been successfully deleted',
  })

  params.delete('client_deleted')
  const cleanUrl = [window.location.pathname, params.toString()]
    .filter(Boolean)
    .join('?')
  window.history.replaceState({}, '', cleanUrl)
}

const statusColors: Record<
  StatusColorKey,
  { bg: string; text: string; border: string }
> = {
  Lead: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  Active: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  Inactive: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
}

function getInitials(name: string) {
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
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
  ]
  return gradients[name.charCodeAt(0) % gradients.length]
}

function escapeHTML(str: string) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

function formatRevenue(amount: number | null | undefined): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function renderClients(clients: ClientView[]) {
  const emptyState = document.getElementById('emptyState') as HTMLElement
  const clientsList = document.getElementById('clientsList') as HTMLElement
  const loadingState = document.getElementById('loadingState') as HTMLElement

  loadingState?.classList.add('hidden')

  if (clients.length === 0) {
    emptyState?.classList.remove('hidden')
    clientsList?.classList.add('hidden')
    return
  }

  emptyState?.classList.add('hidden')
  clientsList?.classList.remove('hidden')

  const grid = document.getElementById('clientsGrid') as HTMLElement
  if (!grid) return

  grid.innerHTML = clients
    .map((c) => {
      const name = escapeHTML(c.full_name || c.enterprise || 'Unknown')
      const email = escapeHTML(c.email || '')
      const phone = escapeHTML(c.phone || '')
      const country = escapeHTML(c.country || '')
      const notes = c.notes ? escapeHTML(truncateText(c.notes, 100)) : ''
      const sc = statusColors[c.status] || statusColors['Lead']
      const revenue = formatRevenue(c.estimated_revenue)
      const gradient = getAvatarGradient(name)

      return `
    <div
        class="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
        data-client-id="${c.id}"
    >
        <div class="p-4 sm:p-5 border-b border-slate-100 shrink-0">
        <div class="flex items-start justify-between gap-3 mb-3 sm:mb-4">
            <div class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center shrink-0 shadow-inner">
                <span class="text-white font-medium text-sm sm:text-base tracking-wide">
                ${getInitials(name)}
                </span>
            </div>

            <div class="flex-1 min-w-0">
                <h3 class="text-slate-900 font-semibold text-[14px] sm:text-[15px] leading-tight mb-1 truncate">
                ${name}
                </h3>
                ${
                  c.enterprise && c.full_name
                    ? `
                <p class="text-slate-500 text-[12px] sm:text-[13px] truncate font-medium">
                    ${escapeHTML(c.enterprise)}
                </p>
                `
                    : ''
                }
            </div>
            </div>

            <span class="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-sm" style="background:${sc.bg};color:${sc.text};border:1px solid ${sc.border};">
            ${c.status}
            </span>
        </div>
        </div>

        <div class="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-start bg-slate-50/30">
        ${
          email
            ? `
            <div class="flex items-center gap-2.5">
            <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
                </svg>
            </div>
            <span class="text-slate-600 text-[13px] truncate flex-1">
                ${email}
            </span>
            </div>
        `
            : ''
        }

        ${
          phone
            ? `
            <div class="flex items-center gap-2.5">
            <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
            </div>
            <span class="text-slate-600 text-[13px] truncate flex-1">
                ${phone}
            </span>
            </div>
        `
            : ''
        }

        ${
          country
            ? `
            <div class="flex items-center gap-2.5">
            <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
            </div>
            <span class="text-slate-600 text-[13px] truncate flex-1">
                ${country}
            </span>
            </div>
        `
            : ''
        }

        ${
          notes
            ? `
            <div class="pt-3 mt-2 border-t border-slate-100">
            <p class="text-slate-500 text-[13px] leading-relaxed line-clamp-2">
                ${notes}
            </p>
            </div>
        `
            : ''
        }
        </div>

        <div class="px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 mt-auto">
        <div class="flex flex-col">
            <span class="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
            Est. Revenue
            </span>
            <span class="text-slate-800 font-bold text-sm sm:text-base">
            ${revenue}
            </span>
        </div>

        <div class="flex items-center gap-1.5 text-slate-500 text-[13px] font-semibold group-hover:text-slate-900 transition-colors">
            <span class="hidden sm:inline">View details</span>
            <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6"/>
            </svg>
        </div>
        </div>
    </div>
    `
    })
    .join('')

  attachCardClickHandlers()
}

function attachCardClickHandlers() {
  const cards = document.querySelectorAll('[data-client-id]')
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const clientId = card.getAttribute('data-client-id')
      if (clientId) {
        window.location.href = `/app/clients/${clientId}`
      }
    })
  })
}

let state: State = {
  clients: [],
  pagination: null,
  currentPage: 1,
  loading: false,
}

async function loadClients(page = 1) {
  if (state.loading) return
  state.loading = true
  const emptyState = document.getElementById('emptyState') as HTMLElement
  const clientsList = document.getElementById('clientsList') as HTMLElement
  const loadingState = document.getElementById('loadingState') as HTMLElement

  document
    .getElementById('btnEmptyAddClient')
    ?.addEventListener('click', () => {
      clientManager.open('CREATE')
    })

  try {
    const res = await fetchAPI(`/api/clients?page=${page}&limit=20`, 'GET')
    if (!res.ok) {
      loadingState?.classList.add('hidden')
      return
    }
    const data = await res.json()
    state.clients = data.clients
    state.pagination = data.pagination
    state.currentPage = page
    renderClients(state.clients)
    renderPagination()
  } catch (err) {
    console.error('Failed to load clients:', err)
    loadingState?.classList.add('hidden')
  } finally {
    state.loading = false
  }
}

async function refreshClients(resetToFirstPage = false) {
  const targetPage = resetToFirstPage ? 1 : state.currentPage
  await loadClients(targetPage)
}

function renderPagination() {
  const container = document.getElementById('pagination')
  if (!container || !state.pagination || state.pagination.totalPages <= 1) {
    if (container) container.innerHTML = ''
    return
  }
  const { page, totalPages, hasPrev, hasNext, total } = state.pagination

  container.innerHTML = `
    <div class="flex flex-col items-center gap-6">
    <div class="flex items-center gap-2 flex-wrap justify-center">
        <button ${!hasPrev ? 'disabled' : ''} class="..." data-page="${page - 1}">Previous</button>
        <button ${!hasNext ? 'disabled' : ''} class="..." data-page="${page + 1}">Next</button>
    </div>
    </div>
`
}

;(window as any).refreshClients = refreshClients
;(window as any).renderClients = () => renderClients(state.clients)

loadClients(1)

document.getElementById('btnAddClient')?.addEventListener('click', () => {
  clientManager.open('CREATE')
})

document.getElementById('menuBtn')?.addEventListener('click', () => {
  window.toggleMobileSidebar?.()
})
