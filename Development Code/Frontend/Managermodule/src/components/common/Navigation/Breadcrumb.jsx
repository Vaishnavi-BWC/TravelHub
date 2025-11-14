// components/common/Breadcrumb/Breadcrumb.js
import React from 'react'
import { useNavigation } from '../../../hooks/useNavigation'
import './Breadcrumb.css'

const Breadcrumb = ({ items }) => {
  const { goto } = useNavigation()

  return (
    <nav className="breadcrumb">
      {items.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          {item.path ? (
            <button
              onClick={() => goto(item.path)}
              className="breadcrumb-link"
            >
              {item.label}
            </button>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumb