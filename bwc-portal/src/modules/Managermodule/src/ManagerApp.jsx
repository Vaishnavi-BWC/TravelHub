// ManagerApp.js
import React from 'react'
import { Routes, Route } from 'react-router-dom' // Remove BrowserRouter import
import { AppProvider } from './contexts/AppContext'
import { TravelProvider } from './contexts/TravelContext'
import Layout from './components/common/Layout/Layout'
import DashboardPage from './pages/Dashboard/DashboardPage'
import MyRequestsPage from './pages/Travel/MyRequestsPage'
import TeamRequestsPage from './pages/Travel/TeamRequestsPage'
import NewRequestPage from './pages/Travel/NewRequestPage'
import RequestDetailPage from './pages/Travel/RequestDetailPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AuditTrailPage from './pages/Audit/AuditTrailPage'
import ApprovalDetailPage from './pages/Travel/ApprovalDetailPage'
import EditRequestPage from './pages/Travel/EditRequestPage'
import './managerdash.css'

function ManagerApp() {
  return (
    // REMOVE Router wrapper - you're already inside parent Router
    <AppProvider>
      <TravelProvider>
        <Layout>
          <Routes>
            {/* Use relative paths since this is under /manager/* */}
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="my-requests" element={<MyRequestsPage />} />
            <Route path="team-requests" element={<TeamRequestsPage />} />
            <Route path="new-request" element={<NewRequestPage />} />
            <Route path="request-detail/:id" element={<RequestDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="audit-trail" element={<AuditTrailPage />} />
            <Route path="approval-detail/:requestId" element={<ApprovalDetailPage />} />
            <Route path="edit-request/:id" element={<EditRequestPage />} />
          </Routes>
        </Layout>
      </TravelProvider>
    </AppProvider>
  )
}

export default ManagerApp