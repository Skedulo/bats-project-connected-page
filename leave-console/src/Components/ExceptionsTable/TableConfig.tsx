import React from 'react'

export const getColumns = () => ([
  {
    Header: 'Description',
    accessor: 'description',
    emptyPlaceholderText: '-',
  },
  {
    Header: 'Type',
    accessor: 'exceptionType',
    emptyPlaceholderText: '-',
    Cell: ({ cell, row }: { cell: { value: string }, row: { original: any } }) => {
      return (
        <div>
          <div className="cx-text-primary">{cell.value}</div>
          <div className="cx-text-neutral-600">{'-'}</div>
        </div>
      )
    }
  }
])
