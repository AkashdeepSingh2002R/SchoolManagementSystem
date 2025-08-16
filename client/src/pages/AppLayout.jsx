import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import { Outlet } from 'react-router-dom'

export default function AppLayout(){
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Sidebar: fixed on desktop, drawer on mobile */}
      <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} />

      {/* Shift entire app to the right by 16rem on md+ so nothing is under the sidebar */}
      <div className="md:ml-64">
        <Header onOpenSidebar={()=>setSidebarOpen(true)} />
        <main className="max-w-6xl mx-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
