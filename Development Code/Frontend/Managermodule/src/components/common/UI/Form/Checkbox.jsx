import React from 'react'
import './Form.css'

const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label className={`checkbox-label ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-input"
        {...props}
      />
      <span className="checkbox-text">{label}</span>
    </label>
  )
}

export default Checkbox