// components/common/Card/Card.js
import React from 'react'
import './Card.css'

const Card = ({ children, className = '', title, subtitle, actions, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || actions) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}

export default Card