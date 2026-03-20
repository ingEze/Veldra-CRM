---
interface Props {
  icon?: 'clients' | 'meetings' | 'tasks' | 'inbox'
  title?: string
  description?: string
  buttonLabel?: string
  buttonId?: string
}

const {
  icon = 'clients',
  title = 'No hay nada por aquí',
  description = 'Comenzá agregando tu primer elemento.',
  buttonLabel = 'Agregar',
  buttonId = 'btnEmptyStateAdd',
} = Astro.props

const icons: Record<string, string> = {
  clients: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>`,
  meetings: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  tasks: `<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  inbox: `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>`,
}
---

<div
  class="empty-state flex flex-col items-center justify-center gap-5 select-none"
>
  <div class="relative flex items-center justify-center">
    <div class="empty-glow absolute w-24 h-24 rounded-full blur-2xl"></div>
    <div
      class="empty-icon-box relative w-16 h-16 rounded-2xl flex items-center justify-center"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="empty-icon"
      >
        <Fragment set:html={icons[icon]} />
      </svg>
    </div>
  </div>

  <div class="text-center space-y-1.5">
    <h3 class="empty-title text-[15px] font-semibold">{title}</h3>
    <p class="empty-desc text-[13px] max-w-55 leading-relaxed">{description}</p>
  </div>

<button
id={buttonId}
class="btn-empty flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-lg transition-all duration-200"

>

    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    {buttonLabel}

  </button>
</div>

<style>
  .empty-glow {
    background: radial-gradient(
      circle,
      rgba(107, 145, 119, 0.15) 0%,
      transparent 70%
    );
  }

  .empty-icon-box {
    background-color: var(--bg-elevated);
    border: 1px solid var(--border-default);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .empty-icon {
    color: var(--text-muted);
  }

  .empty-title {
    color: var(--text-secondary);
  }

  .empty-desc {
    color: var(--text-muted);
  }

  .btn-empty {
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    border: 1px solid var(--border-strong);
    cursor: pointer;
  }
  .btn-empty:hover {
    background-color: var(--bg-overlay);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  }
  .btn-empty:active {
    transform: translateY(0);
  }
</style>
