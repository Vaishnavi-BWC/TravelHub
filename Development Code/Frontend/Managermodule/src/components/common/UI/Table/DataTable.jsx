// components/common/DataTable/DataTable.js
import React from 'react'
import './DataTable.css'

const DataTable = ({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data available",
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className="data-table-loading">
        <i className="fas fa-spinner fa-spin"></i> Loading...
      </div>
    )
  }

  return (
    <div className={`data-table-container ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={onRowClick ? 'clickable-row' : ''}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {row[column.key] || row[column.toLowerCase()] || '-'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="empty-cell">
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable