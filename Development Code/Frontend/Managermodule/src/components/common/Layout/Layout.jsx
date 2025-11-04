// components/common/Layout/Layout.js
import React from 'react'
import { useApp } from '../../../contexts/AppContext'
import Header from './Header'
import Sidebar from './Sidebar'
import './Layout.css'

const Layout = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useApp()

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout