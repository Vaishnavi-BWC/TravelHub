// hooks/useNavigation.js
import { useNavigate, useLocation } from 'react-router-dom'

export const useNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const goto = (path, options = {}) => {
    if (options.replace) {
      navigate(path, { replace: true })
    } else {
      navigate(path)
    }
  }

  const goBack = () => {
    navigate(-1)
  }

  return {
    currentPath: location.pathname,
    goto,
    goBack
  }
}