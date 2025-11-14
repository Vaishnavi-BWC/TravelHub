// components/common/Form/Input.js
import React from 'react'
import './Form.css'

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-control ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default Input