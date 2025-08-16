import Sidebar from '../components/Sidebar.jsx'
import Header from '../components/Header.jsx'
import { Outlet } from 'react-router-dom'

export default function AppLayout(){
  return (
    <div className="min-h-screen flex bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="max-w-6xl mx-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
