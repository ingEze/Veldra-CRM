---
interface Props {
  title?: string
  description?: string
}
---

<div
  class="modal-backdrop hidden fixed inset-0 items-center justify-center z-50"
  id="modalAddClient"
  style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
>
  <div class="modal-card w-full max-w-120 mx-4">
    <!-- Header -->
    <div class="modal-header flex items-center justify-between px-6 pt-6 pb-4">
      <div>
        <h3 id="modalTitle" class="font-serif modal-title"></h3>
        <p id="modalSubtitle" class="modal-subtitle mt-0.5"></p>
      </div>
      <button id="btnCloseModal" class="modal-close-btn">
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
          <line x1="18" y1="6" x2="6" y2="18"></line><line
            x1="6"
            y1="6"
            x2="18"
            y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Form -->
    <form
      id="formAddClient"
      class="px-6 py-5 flex flex-col gap-4 max-h-[65vh] overflow-y-auto"
    >
      <div>
        <label for="clientFullName" class="form-label">Full name</label>
        <input
          id="clientFullName"
          name="full_name"
          type="text"
          placeholder="Ej: Ana García"
          class="input-field text-[13.5px]"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="clientEmail" class="form-label">Email</label>
          <input
            id="clientEmail"
            name="email"
            type="email"
            placeholder="cliente@correo.com"
            class="input-field text-[13.5px]"
          />
        </div>
        <div>
          <label for="clientPhone" class="form-label">Phone</label>
          <input
            id="clientPhone"
            name="phone"
            type="tel"
            placeholder="Ej: +54 11 1234-5678"
            class="input-field text-[13.5px]"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="clientEnterprise" class="form-label">Company</label>
          <input
            id="clientEnterprise"
            name="enterprise"
            type="text"
            placeholder="Ej: Acme Inc."
            class="input-field text-[13.5px]"
          />
        </div>
        <div>
          <label for="clientCountry" class="form-label">Country</label>
          <input
            id="clientCountry"
            name="country"
            type="text"
            placeholder="Ej: Argentina"
            class="input-field text-[13.5px]"
          />
        </div>
      </div>

      <div>
        <label for="clientEstimatedRevenue" class="form-label"
          >Estimated revenue</label
        >
        <div class="relative">
          <span class="currency-prefix">$</span>
          <input
            id="clientEstimatedRevenue"
            name="estimated_revenue"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="input-field text-[13.5px] pl-5!"
          />
        </div>
      </div>

      <div>
        <label for="clientStatus" class="form-label">Status</label>
        <select
          id="clientStatus"
          name="status"
          class="input-field text-[13.5px]"
        >
          <option value="new_lead">New Lead</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="approved">Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="delivered">Delivered</option>
          <option value="awaiting_payment">Awaiting Payment</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      <div>
        <label for="clientNotes" class="form-label">Notes</label>
        <textarea
          id="clientNotes"
          name="notes"
          placeholder="How did it get to you?..."
          class="input-field text-[13.5px] resize-none"
          rows="3"></textarea>
      </div>
    </form>

    <!-- Footer -->
    <div class="modal-footer px-6 pb-6 flex items-center justify-between">
      <button
        id="btnCancelModal"
        class="btn-cancel text-[13px] font-medium transition-colors"
        >Cancelar</button
      >
      <button
        id="btnSaveClient"
        class="btn-save flex items-center gap-2 text-[13.5px] font-medium px-5 py-2.5 rounded-xl transition-all"
      >
        <span id="btnSaveClientText">Save</span>
        <svg
          id="btnSaveClientIcon"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line><polyline
            points="12 5 19 12 12 19"></polyline>
        </svg>
        <svg
          id="btnSaveClientLoader"
          class="hidden animate-spin"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" opacity="0.25"></circle><path
            d="M12 2a10 10 0 0 1 10 10"
            opacity="0.75"></path>
        </svg>
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop.open {
    display: flex !important;
  }

  .modal-card {
    background-color: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: 18px;
    box-shadow:
      0 32px 80px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.03);
    transform: scale(0.96);
    opacity: 0;
    transition: all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  }
  .modal-backdrop.open .modal-card {
    transform: scale(1);
    opacity: 1;
  }

  .modal-header {
    border-bottom: 1px solid var(--border-subtle);
  }

  .modal-title {
    font-size: 20px;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .modal-subtitle {
    font-size: 12.5px;
    color: var(--text-muted);
  }

  .modal-close-btn {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--bg-overlay);
    border: 1px solid var(--border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .modal-close-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .form-label {
    display: block;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .currency-prefix {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13.5px;
    color: var(--text-muted);
    pointer-events: none;
  }

  /* Scrollbar dark */
  form::-webkit-scrollbar {
    width: 4px;
  }
  form::-webkit-scrollbar-track {
    background: transparent;
  }
  form::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border-radius: 4px;
  }

  .modal-footer {
    border-top: 1px solid var(--border-subtle);
  }

  .btn-cancel {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px 0;
  }
  .btn-cancel:hover {
    color: var(--text-secondary);
  }

  .btn-save {
    background-color: var(--bg-overlay);
    color: var(--text-primary);
    border: 1px solid var(--border-strong);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .btn-save:hover {
    background-color: var(--bg-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
</style>

<script>
  import '../../scripts/clientModal'
</script>
