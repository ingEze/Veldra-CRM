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

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig: Record<
string,
{ dot: string; text: string; bg: string; border: string }

> = {
> new_lead: {

    dot: '#7da3f5',
    text: '#7da3f5',
    bg: 'rgba(59,100,246,0.10)',
    border: 'rgba(59,100,246,0.20)',

},
proposal_sent: {
dot: '#a78bfa',
text: '#a78bfa',
bg: 'rgba(139,92,246,0.10)',
border: 'rgba(139,92,246,0.20)',
},
approved: {
dot: '#72c994',
text: '#72c994',
bg: 'rgba(74,183,120,0.10)',
border: 'rgba(74,183,120,0.20)',
},
in_progress: {
dot: '#f59e6a',
text: '#f59e6a',
bg: 'rgba(245,158,66,0.10)',
border: 'rgba(245,158,66,0.20)',
},
delivered: {
dot: '#6ee7b7',
text: '#6ee7b7',
bg: 'rgba(52,211,153,0.10)',
border: 'rgba(52,211,153,0.20)',
},
awaiting_payment: {
dot: '#fbbf24',
text: '#fbbf24',
bg: 'rgba(251,191,36,0.10)',
border: 'rgba(251,191,36,0.20)',
},
paid: {
dot: '#6b9177',
text: '#6b9177',
bg: 'rgba(107,145,119,0.12)',
border: 'rgba(107,145,119,0.25)',
},
rejected: {
dot: '#f87171',
text: '#f87171',
bg: 'rgba(248,113,113,0.10)',
border: 'rgba(248,113,113,0.20)',
},
on_hold: {
dot: '#94a3b8',
text: '#7a8494',
bg: 'rgba(120,130,145,0.10)',
border: 'rgba(120,130,145,0.18)',
},
// legacy keys (backward compat)
Lead: {
dot: '#7da3f5',
text: '#7da3f5',
bg: 'rgba(59,100,246,0.10)',
border: 'rgba(59,100,246,0.20)',
},
Active: {
dot: '#72c994',
text: '#72c994',
bg: 'rgba(74,183,120,0.10)',
border: 'rgba(74,183,120,0.20)',
},
Inactive: {
dot: '#7a8494',
text: '#7a8494',
bg: 'rgba(120,130,145,0.10)',
border: 'rgba(120,130,145,0.18)',
},
}

// ── Avatar palettes — dark, desaturated ───────────────────────────────────────
const avatarPalettes = [
{ bg: '#1e3328', text: '#6b9177' }, // sage
{ bg: '#1a2b42', text: '#5b8db8' }, // slate blue
{ bg: '#2d2218', text: '#a07840' }, // warm amber
{ bg: '#2a1f35', text: '#8b68b0' }, // muted violet
{ bg: '#31191f', text: '#a05060' }, // burdeos
]

function getAvatarPalette(name: string) {
return avatarPalettes[name.charCodeAt(0) % avatarPalettes.length]
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

function formatStatusLabel(key: string) {
return key.replace(/\_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function escapeHTML(str: string) {
const div = document.createElement('div')
div.textContent = str
return div.innerHTML
}

function truncateText(text: string, maxLength = 90): string {
if (!text || text.length <= maxLength) return text
return text.slice(0, maxLength).trim() + '\u2026'
}

function formatRevenue(amount: number | null | undefined): string {
if (!amount) return '\u2014'
return new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
minimumFractionDigits: 0,
maximumFractionDigits: 0,
}).format(amount)
}

// ── Inject styles once ────────────────────────────────────────────────────────
function injectCardStyles() {
if (document.getElementById('veldra-card-styles')) return
const s = document.createElement('style')
s.id = 'veldra-card-styles'
s.textContent = `
.vc {
position: relative;
background: #141618;
border: 1px solid #22262c;
border-radius: 16px;
overflow: hidden;
display: flex;
flex-direction: column;
height: 100%;
cursor: pointer;
transition: border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
}
.vc::before {
content: '';
position: absolute;
inset: 0;
background: linear-gradient(145deg, rgba(255,255,255,0.025) 0%, transparent 55%);
pointer-events: none;
border-radius: inherit;
z-index: 0;
}
.vc > \* { position: relative; z-index: 1; }
.vc:hover {
border-color: #353c46;
transform: translateY(-3px);
box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset;
}
.vc:active { transform: translateY(-1px); transition-duration: 0.08s; }

    .vc-accent { height: 2px; width: 100%; flex-shrink: 0; }

    .vc-head {
      padding: 18px 20px 14px;
      display: flex;
      align-items: flex-start;
      gap: 13px;
    }
    .vc-av {
      width: 40px;
      height: 40px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      border: 1px solid rgba(255,255,255,0.06);
      font-family: 'DM Sans', sans-serif;
    }
    .vc-info { flex: 1; min-width: 0; padding-top: 1px; }
    .vc-name {
      font-size: 14px;
      font-weight: 600;
      color: #dedad4;
      letter-spacing: -0.01em;
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
      font-family: 'DM Sans', sans-serif;
    }
    .vc-company {
      font-size: 11.5px;
      color: #40464f;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'DM Sans', sans-serif;
    }
    .vc-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px 3px 7px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      white-space: nowrap;
      flex-shrink: 0;
      text-transform: uppercase;
      margin-top: 1px;
      font-family: 'DM Sans', sans-serif;
    }
    .vc-badge-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .vc-div { height: 1px; margin: 0 20px; background: #1c1f24; }
    .vc-body {
      padding: 13px 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .vc-row { display: flex; align-items: center; gap: 9px; }
    .vc-ico { width: 14px; height: 14px; flex-shrink: 0; color: #2d333c; }
    .vc-val {
      font-size: 12px;
      color: #525a65;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      font-family: 'DM Sans', sans-serif;
    }
    .vc-notes {
      font-size: 11.5px;
      color: #3b414a;
      line-height: 1.65;
      padding-top: 9px;
      margin-top: 2px;
      border-top: 1px solid #1c1f24;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-family: 'DM Sans', sans-serif;
    }
    .vc-foot {
      padding: 12px 20px;
      background: #0f1012;
      border-top: 1px solid #1c1f24;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      margin-top: auto;
    }
    .vc-rev-lbl {
      font-size: 9px;
      color: #282d34;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      margin-bottom: 5px;
      font-family: 'DM Sans', sans-serif;
    }
    .vc-rev-val {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 19px;
      color: #bab7af;
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .vc-cta {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 500;
      color: #282d34;
      transition: color 0.2s ease;
      font-family: 'DM Sans', sans-serif;
    }
    .vc:hover .vc-cta { color: #525a65; }
    .vc-cta svg { transition: transform 0.2s ease; }
    .vc:hover .vc-cta svg { transform: translateX(2px); }

`
document.head.appendChild(s)
}

// ── Render ────────────────────────────────────────────────────────────────────
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

injectCardStyles()

grid.innerHTML = clients
.map((c) => {
const name = escapeHTML(c.full_name || c.enterprise || 'Unknown')
const email = escapeHTML(c.email || '')
const phone = escapeHTML(c.phone || '')
const country = escapeHTML(c.country || '')
const notes = c.notes ? escapeHTML(truncateText(c.notes)) : ''
const revenue = formatRevenue(c.estimated_revenue)
const statusKey = c.status || 'Inactive'
const sc = statusConfig[statusKey] || statusConfig['Inactive']
const label = formatStatusLabel(statusKey)
const av = getAvatarPalette(name)
const initials = getInitials(name)

      return `

<div class="vc" data-client-id="${c.id}">
  <div class="vc-accent" style="background:${sc.dot}; opacity:0.65;"></div>

  <div class="vc-head">
    <div class="vc-av" style="background:${av.bg}; color:${av.text};">${initials}</div>
    <div class="vc-info">
      <div class="vc-name">${name}</div>
      <div class="vc-company">${c.enterprise && c.full_name ? escapeHTML(c.enterprise) : '&nbsp;'}</div>
    </div>
    <div class="vc-badge" style="background:${sc.bg}; color:${sc.text}; border:1px solid ${sc.border};">
      <span class="vc-badge-dot" style="background:${sc.dot};"></span>${label}
    </div>
  </div>

  <div class="vc-div"></div>

  <div class="vc-body">
    ${
      email
        ? `<div class="vc-row">
      <svg class="vc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      <span class="vc-val">${email}</span>
    </div>`
        : ''
    }
    ${
      phone
        ? `<div class="vc-row">
      <svg class="vc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
      <span class="vc-val">${phone}</span>
    </div>`
        : ''
    }
    ${
      country
        ? `<div class="vc-row">
      <svg class="vc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <span class="vc-val">${country}</span>
    </div>`
        : ''
    }
    ${notes ? `<p class="vc-notes">${notes}</p>` : ''}
  </div>

  <div class="vc-foot">
    <div>
      <div class="vc-rev-lbl">Est. Revenue</div>
      <div class="vc-rev-val">${revenue}</div>
    </div>
    <div class="vc-cta">
      <span>View</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  </div>
</div>`
    })
    .join('')

attachCardClickHandlers()
}

function attachCardClickHandlers() {
document.querySelectorAll('[data-client-id]').forEach((card) => {
card.addEventListener('click', () => {
const id = card.getAttribute('data-client-id')
if (id) window.location.href = `/app/clients/${id}`
})
})
}

// ── State & fetching ──────────────────────────────────────────────────────────
let state: State = {
clients: [],
pagination: null,
currentPage: 1,
loading: false,
}

async function loadClients(page = 1) {
if (state.loading) return
state.loading = true
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
await loadClients(resetToFirstPage ? 1 : state.currentPage)
}

function renderPagination() {
const container = document.getElementById('pagination')
if (!container || !state.pagination || state.pagination.totalPages <= 1) {
if (container) container.innerHTML = ''
return
}
const { page, hasPrev, hasNext } = state.pagination
container.innerHTML = `     <div class="flex flex-col items-center gap-6">
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

document
.getElementById('btnAddClient')
?.addEventListener('click', () => clientManager.open('CREATE'))
document
.getElementById('menuBtn')
?.addEventListener('click', () => window.toggleMobileSidebar?.())
