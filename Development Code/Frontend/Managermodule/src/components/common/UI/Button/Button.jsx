// components/common/Button/Button.js
import React from 'react'
import './Button.css'

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  icon,
  className = '',
  ...props
}) => {
  const baseClass = 'btn'
  const variantClass = `btn-${variant}`
  const sizeClass = `btn-${size}`
  const disabledClass = disabled ? 'btn-disabled' : ''
  const loadingClass = loading ? 'btn-loading' : ''

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${loadingClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <i className="fas fa-spinner fa-spin"></i>}
      {icon && !loading && <i className={icon}></i>}
      {children}
    </button>
  )
}

export default Button