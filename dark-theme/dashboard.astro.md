---
import Layout from '../../layouts/Layout.astro'
import Sidebar from '../../components/dashboard/Sidebar.astro'
import Main from '../../components/dashboard/Main.astro'
import Modal from '../../components/dashboard/Modal.astro'
---

<Layout title="Veldra — Dashboard">
  <section
    class="flex h-screen overflow-hidden"
    style="background-color: #0e0f11;"
  >
    <Sidebar />

    <!-- Mobile overlay -->
    <div
      class="sidebar-overlay hidden fixed inset-0 z-40"
      id="sidebarOverlay"
      style="background: rgba(0,0,0,0.65); backdrop-filter: blur(2px);"
    >
    </div>

    <Main />
    <Modal />

  </section>
</Layout>
