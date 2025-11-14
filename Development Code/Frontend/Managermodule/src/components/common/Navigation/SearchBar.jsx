// components/common/SearchBar/SearchBar.js
import React from 'react'
import './SearchBar.css'

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = '',
  onSearch,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(value)
  }

  return (
    <form onSubmit={handleSubmit} className={`search-bar ${className}`}>
      <div className="search-box">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
          {...props}
        />
      </div>
    </form>
  )
}

export default SearchBar