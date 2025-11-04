// pages/Travel/NewRequestPage.js - NO CHANGES NEEDED
import React from 'react'
import { useNavigation } from '../../hooks/useNavigation'
import TravelRequestForm from '../../components/travel/TravelRequestForm/TravelRequestForm'
import TravelPolicy from '../../components/travel/TravelPolicy/TravelPolicy'
import './NewRequestPage.css'

const NewRequestPage = () => {
  const { goto } = useNavigation()

  const handleSuccess = (newRequest) => {
    goto(`/request-detail/${newRequest.travelRequestId}`)
  }

  const handleCancel = () => {
    goto('/dashboard')
  }

  return (
    <div className="new-request-page">
      <TravelPolicy grade="L3" />
      {/* This will work exactly as before - no editRequestId or initialData passed */}
      <TravelRequestForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default NewRequestPage