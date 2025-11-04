export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0
}

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return start <= end
}

export const validateTravelRequest = (requestData) => {
  const errors = {}

  if (!validateRequired(requestData.destination)) {
    errors.destination = 'Destination is required'
  }

  if (!validateRequired(requestData.from)) {
    errors.from = 'Departure location is required'
  }

  if (!validateRequired(requestData.startDate)) {
    errors.startDate = 'Start date is required'
  }

  if (!validateRequired(requestData.endDate)) {
    errors.endDate = 'End date is required'
  }

  if (requestData.startDate && requestData.endDate && !validateDateRange(requestData.startDate, requestData.endDate)) {
    errors.endDate = 'End date must be after start date'
  }

  if (!validateRequired(requestData.purpose)) {
    errors.purpose = 'Purpose is required'
  }

  if (!requestData.modesOfTravel || requestData.modesOfTravel.length === 0) {
    errors.modesOfTravel = 'At least one travel mode is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}