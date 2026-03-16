import { fetchAPI } from '../lib/fetchApi'
import { showAlert } from "../lib/showAlert"

function setLoadingState(isLoading: boolean) {
    const btn = document.getElementById('btnSaveClient') as HTMLButtonElement
    const text = document.getElementById('btnSaveClientText')
    const icon = document.getElementById('btnSaveClientIcon')
    const loader = document.getElementById('btnSaveClientLoader')
    if (!btn) return
    
    btn.disabled = isLoading
    if (text) text.textContent = isLoading ? 'Saving...' : (btn.dataset.mode === 'UPDATE' ? 'Update changes' : 'Save client')
    if (icon) icon.style.display = isLoading ? 'none' : 'block'
    if (loader) loader.style.display = isLoading ? 'block' : 'none'
}

export const clientManager = {
    open: (mode: 'CREATE' | 'UPDATE', data: any = null) => {
        const modal = document.getElementById('modalAddClient')
        const titleEl = document.getElementById('modalTitle')
        const subtitleEl = document.getElementById('modalSubtitle')
        const btnSave = document.getElementById('btnSaveClient') as HTMLButtonElement

        if (!modal || !btnSave) return

        btnSave.dataset.mode = mode
        
        if (mode === 'UPDATE' && data) {
            btnSave.dataset.clientId = data.id
            if (titleEl) titleEl.textContent = 'Edit client'
            if (subtitleEl) subtitleEl.textContent = 'Edit the client details'
            clientManager.fillForm(data)
        } else {
            delete btnSave.dataset.clientId
            if (titleEl) titleEl.textContent = 'New client'
            if (subtitleEl) subtitleEl.textContent = 'Add a new client to your CRM'
            ;(document.getElementById('formAddClient') as HTMLFormElement)?.reset()
        }

        modal.classList.add('open')
        setTimeout(() => document.getElementById('clientFullName')?.focus(), 100)
    },

    close: () => {
        document.getElementById('modalAddClient')?.classList.remove('open')
    },

    fillForm: (data: any) => {
        (document.getElementById('clientFullName') as HTMLInputElement).value = data.full_name || '';
        (document.getElementById('clientEmail') as HTMLInputElement).value = data.email || '';
        (document.getElementById('clientPhone') as HTMLInputElement).value = data.phone || '';
        (document.getElementById('clientEnterprise') as HTMLInputElement).value = data.enterprise || '';
        (document.getElementById('clientCountry') as HTMLInputElement).value = data.country || '';
        (document.getElementById('clientEstimatedRevenue') as HTMLInputElement).value = data.estimated_revenue || '';
        (document.getElementById('clientStatus') as HTMLSelectElement).value = data.status || 'new_lead';
        (document.getElementById('clientNotes') as HTMLTextAreaElement).value = data.notes || '';
    },

    save: async () => {
        const btnSave = document.getElementById('btnSaveClient') as HTMLButtonElement
        const mode = btnSave.dataset.mode
        const clientId = btnSave.dataset.clientId

        const fullNameInput = document.getElementById('clientFullName') as HTMLInputElement
        const enterpriseInput = document.getElementById('clientEnterprise') as HTMLInputElement
        const fullName = fullNameInput.value.trim()
        const enterprise = enterpriseInput.value.trim()

        if (!fullName && !enterprise) {
            showAlert({
                message: 'Required field',
                description: 'Please enter the client\'s name or the company name',
                type: 'ERROR'
            })
            fullNameInput.classList.add('input-error')
            fullNameInput.focus()
            fullNameInput.addEventListener('input', () => {
                fullNameInput.classList.remove('input-error')
            }, { once: true })
            return
        }
        fullNameInput.classList.remove('input-error')

        const clientData = {
            full_name: fullName || undefined,
            email: (document.getElementById('clientEmail') as HTMLInputElement).value.trim() || undefined,
            phone: (document.getElementById('clientPhone') as HTMLInputElement).value.trim() || undefined,
            enterprise: enterprise || undefined,
            country: (document.getElementById('clientCountry') as HTMLInputElement).value.trim() || undefined,
            estimated_revenue: parseFloat((document.getElementById('clientEstimatedRevenue') as HTMLInputElement).value) || 0,
            status: (document.getElementById('clientStatus') as HTMLSelectElement).value || undefined,
            notes: (document.getElementById('clientNotes') as HTMLTextAreaElement).value.trim() || undefined
        }

        setLoadingState(true)
        const endpoint = mode === 'CREATE' ? '/api/clients/create' : `/api/clients/${clientId}`
        const method = mode === 'CREATE' ? 'POST' : 'PUT'

        try {
            const res = await fetchAPI(endpoint, method, clientData)
            if (!res.ok) {
                const errMsg = await res.json()
                console.error(errMsg)
                showAlert({
                    message: 'ERROR',
                    description: errMsg,
                    type: 'ERROR'
                })
                return
            }
            
            const description =
                mode === 'CREATE' 
                    ? 'Client saved successfully'
                    : 'Client updated successfully'
                
            clientManager.close()
            showAlert({ message: 'Success', description })
            
            if (mode === 'UPDATE') window.location.reload()
            else (window as any).refreshClients?.(true)
            
        } catch (error: any) {
            showAlert({ message: 'Error', description: error.error ?? 'Could not save client', type: 'ERROR' })
        } finally {
            setLoadingState(false)
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnCloseModal')?.addEventListener('click', clientManager.close)
    document.getElementById('btnCancelModal')?.addEventListener('click', clientManager.close)
    document.getElementById('btnSaveClient')?.addEventListener('click', clientManager.save)
    
    const modal = document.getElementById('modalAddClient')
    modal?.addEventListener('click', (e) => { if (e.target === modal) clientManager.close() })
})