---
const email = Astro.locals.user?.email
const initials = email?.slice(0, 2).toUpperCase()
---

<aside id="sidebar" class="sidebar w-55 shrink-0 flex flex-col h-full">
  <!-- Logo -->
  <div class="sidebar-header flex justify-center items-center">
    <div class="flex items-center gap-3 mx-1 my-[19.5px]">
      <div
        class="h-auto w-6/12 rounded-[9px] overflow-hidden shrink-0 flex items-center justify-center bg-transparent ml-4"
      >
        <img
          src="/logo.png"
          alt="Veldra logo"
          class="w-full h-full object-contain"
          style="filter: brightness(0) invert(1) opacity(0.85);"
          loading="eager"
        />
      </div>
    </div>
  </div>

  <!-- Nav -->
  <nav class="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
    <p class="nav-section-label">Workspace</p>

    <a class="nav-item active" data-section="clients">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
      Clients
    </a>

    <a class="nav-item" data-section="projects">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
        <path d="M8 21h8m-4-4v4"></path>
      </svg>
      Projects
    </a>

    <a class="nav-item" data-section="meetings">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
        <path d="M16 2v4M8 2v4M3 10h18"></path>
      </svg>
      Meetings
    </a>

    <a class="nav-item" data-section="tasks">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        ></path>
      </svg>
      Tasks
    </a>

    <div class="nav-divider"></div>
    <p class="nav-section-label">Account</p>

    <a class="nav-item" data-section="settings">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3"></circle>
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        ></path>
      </svg>
      Settings
    </a>

  </nav>

  <!-- User footer -->
  <div class="user-footer">
    <div class="flex items-center gap-2.5">
      <div class="user-avatar shrink-0">
        <span class="text-[11px] font-semibold">{initials}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[11px] truncate" style="color: var(--text-muted);">
          {email}
        </p>
      </div>
      <button id="logout" class="logout-btn" title="Cerrar sesión">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    background-color: var(--bg-surface);
    border-right: 1px solid var(--border-subtle);
  }

  .sidebar-header {
    border-bottom: 1px solid var(--border-subtle);
  }

  .nav-section-label {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0 12px;
    margin-bottom: 6px;
  }

  .nav-divider {
    margin: 10px 0;
    border-top: 1px solid var(--border-subtle);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 400;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.18s ease;
    text-decoration: none;
  }
  .nav-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  .nav-item svg {
    stroke: var(--text-muted);
    transition: stroke 0.18s ease;
  }
  .nav-item:hover svg {
    stroke: var(--text-secondary);
  }
  .nav-item.active {
    background: var(--bg-overlay);
    color: var(--text-primary);
    font-weight: 500;
    box-shadow: inset 0 0 0 1px var(--border-default);
  }
  .nav-item.active svg {
    stroke: var(--accent);
  }

  .user-footer {
    padding: 16px;
    border-top: 1px solid var(--border-subtle);
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), #3d6b50);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.9);
  }

  .logout-btn {
    color: var(--text-muted);
    padding: 2px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    transition:
      color 0.15s,
      background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logout-btn:hover {
    color: var(--text-secondary);
    background: var(--bg-hover);
  }

  @media (max-width: 768px) {
    #sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      z-index: 50;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    #sidebar.open {
      transform: translateX(0);
    }
    .sidebar-overlay.open {
      display: block !important;
    }
  }
</style>
