import { fetchAPI } from '../../lib/fetchApi'

declare global {
  interface Window {
    showSection: (section: SectionType) => void
    renderClients: () => void
    toggleMobileSidebar: () => void
    closeMobileSidebar: () => void
    refreshClients: (b?: boolean) => Promise<void>
  }
}

document.getElementById('logout')?.addEventListener('click', async () => {
  const res = await fetchAPI('/api/auth/logout', 'POST')
  if (!res.ok) {
    const errorData = await res.json()
    console.error(errorData)
  }

  window.location.href = '/login'
  return
})

const sectionMeta = {
  clients: { title: 'Clients', sub: 'Manage your client relationships' },
  projects: { title: 'Projects', sub: 'Track your ongoing work' },
  meetings: { title: 'Meetings', sub: 'Stay on top of your schedule' },
  tasks: { title: 'Tasks', sub: 'Keep your to-dos organized' },
  settings: { title: 'Settings', sub: 'Configure your workspace' },
}

type SectionType = keyof typeof sectionMeta

function showSection(section: SectionType) {
  const pageTitle = document.getElementById('pageTitle')
  const pageSub = document.getElementById('pageSubtitle')
  const btnAdd = document.getElementById('btnAddClient')
  const emptyState = document.getElementById('emptyState')
  const clientsList = document.getElementById('clientsList')
  const comingSoon = document.getElementById('comingSoon')

  const meta = sectionMeta[section]
  if (pageTitle) pageTitle.textContent = meta.title
  if (pageSub) pageSub.textContent = meta.sub
  if (btnAdd) btnAdd.style.display = section === 'clients' ? 'flex' : 'none'

  emptyState?.classList.add('hidden')
  clientsList?.classList.add('hidden')
  comingSoon?.classList.add('hidden')
  comingSoon?.classList.remove('flex')

  const meetingsSection = document.getElementById('meetingsSection')
  const btnAddClient = document.getElementById('btnAddClient')
  const btnAddMeeting = document.getElementById('btnAddMeeting')

  if (btnAddClient) btnAddClient.style.display = 'none'
  if (btnAddMeeting) btnAddMeeting.style.display = 'none'

  if (section === 'clients') {
    meetingsSection?.classList.add('hidden')
    meetingsSection?.classList.remove('flex')
    if (btnAddClient) btnAddClient.style.display = 'flex'
    if (window.renderClients) window.renderClients()
    else if (window.refreshClients) window.refreshClients(true)
  } else if (section === 'meetings') {
    meetingsSection?.classList.remove('hidden')
    meetingsSection?.classList.add('flex')
    if (btnAddMeeting) btnAddMeeting.style.display = 'flex'
    ;(window as any).loadMeetings?.()
  } else {
    meetingsSection?.classList.add('hidden')
    meetingsSection?.classList.remove('flex')
    comingSoon?.classList.remove('hidden')
    comingSoon?.classList.add('flex')
  }
}

window.showSection = showSection

const navItems = document.querySelectorAll('.nav-item')
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    const section = (item as HTMLElement).dataset.section as SectionType
    if (!section) return

    if (section === 'settings') {
      window.location.href = '/app/settings'
      return
    }

    updateNavUI(section)
    showSection(section)

    const newUrl = `${window.location.pathname}?section=${section}`

    window.history.pushState({ section }, '', newUrl)
    closeMobileSidebar()
  })
})

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('sidebarOverlay')
  sidebar?.classList.toggle('open')
  overlay?.classList.toggle('open')
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('sidebarOverlay')
  sidebar?.classList.remove('open')
  overlay?.classList.remove('open')
}

window.toggleMobileSidebar = toggleMobileSidebar
window.closeMobileSidebar = closeMobileSidebar

showSection('clients')
const firstNav = document.querySelector('.nav-item[data-section="clients"]')
if (firstNav) firstNav.classList.add('active')

function getActiveSectionFromURL(): SectionType {
  const path = window.location.pathname

  if (path.includes('/app/settings')) return 'settings'

  const params = new URLSearchParams(window.location.search)
  const sectionParam = params.get('section') as SectionType

  if (sectionParam && sectionMeta[sectionParam]) {
    return sectionParam
  }

  return 'clients'
}

function updateNavUI(section: SectionType) {
  const navItems = document.querySelectorAll('.nav-item')
  navItems.forEach((item) => {
    const itemSection = (item as HTMLElement).dataset.section

    if (itemSection === section) {
      item.classList.add('active')
    } else {
      item.classList.remove('active')
    }
  })
}

const initialSection = getActiveSectionFromURL()
showSection(initialSection)
updateNavUI(initialSection)
