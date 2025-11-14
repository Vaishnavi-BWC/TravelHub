// components/common/Form/TextArea.js
import React from 'react'
import './Form.css'

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 3,
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
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`form-control ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default TextArea