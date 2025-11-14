// pages/Travel/EditRequestPage.js
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNavigation } from '../../hooks/useNavigation'
import TravelRequestForm from '../../components/travel/TravelRequestForm/TravelRequestForm'
import TravelPolicy from '../../components/travel/TravelPolicy/TravelPolicy'
import './NewRequestPage.css' // Reuse the same CSS

const EditRequestPage = () => {
  const { id } = useParams()
  const { goto } = useNavigation()
  const navigate = useNavigate()

  const handleSuccess = (updatedRequest) => {
    goto(`/request-detail/${updatedRequest.travelRequestId}`)
  }

  const handleCancel = () => {
    navigate(-1) // Go back to previous page
  }

  return (
    <div className="new-request-page">
      <TravelPolicy grade="L3" />
      <TravelRequestForm 
        editRequestId={id} // This enables edit mode
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default EditRequestPage