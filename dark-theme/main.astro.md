---
import Modal from '../../components/dashboard/Modal.astro'
import EmptyState from '../../components/dashboard/EmptyState.astro'
import MeetingsSection from '../../components/dashboard/meetings/Section.astro'
import MeetingModal from '../../components/dashboard/meetings/Modal.astro'
---

<main class="main-content flex-1 flex flex-col min-w-0 overflow-hidden">
  <header
    class="main-header shrink-0 flex items-center justify-between px-6 py-4"
  >
    <div class="flex items-center gap-3">
      <button id="menuBtn" class="menu-btn md:hidden mr-1">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div>
        <h1 id="pageTitle" class="font-serif page-title">Clients</h1>
        <p id="pageSubtitle" class="page-subtitle">
          Manage your client relationships
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button
        id="btnAddClient"
        class="btn-primary flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all duration-200"
      >
        <svg
          width="13"
          height="13"
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
        <span class="cursor-pointer">Add client</span>
      </button>

      <button
        id="btnAddMeeting"
        class="btn-primary hidden items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all duration-200"
      >
        <svg
          width="13"
          height="13"
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
        <span>Schedule meeting</span>
      </button>
    </div>

  </header>

  <div
    class="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col"
    style="background-color: var(--bg-base);"
  >
    <MeetingsSection />

    <div
      id="emptyState"
      class="flex-1 flex items-center justify-center min-h-full"
    >
      <EmptyState
        icon="clients"
        title="You don't have any clients yet"
        description="Start by adding your first client to manage them here."
        buttonLabel="Add client"
        buttonId="btnEmptyAddClient"
      />
    </div>
    <div id="loadingState" class="hidden"></div>
    <div id="clientsList" class="hidden">
      <div
        id="clientsGrid"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
      >
      </div>
      <div id="pagination" class="mt-10"></div>
    </div>

  </div>

  <Modal />
  <MeetingModal />
</main>

<style>
  .main-content {
    background-color: var(--bg-base);
  }

  .main-header {
    background-color: var(--bg-surface);
    border-bottom: 1px solid var(--border-subtle);
  }

  .page-title {
    font-size: 22px;
    color: var(--text-primary);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 400;
    margin-top: 1px;
  }

  .menu-btn {
    color: var(--text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition:
      color 0.15s,
      background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .menu-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .btn-primary {
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    border: 1px solid var(--border-strong);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-primary:hover {
    background-color: var(--bg-overlay);
    border-color: var(--border-strong);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  .btn-primary:active {
    transform: translateY(0);
  }
</style>

<script>
  import '../../scripts/meetings'
  import '../../scripts/main'
</script>
