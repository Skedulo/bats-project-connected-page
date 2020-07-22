import React from 'react'
import { Icon } from '@skedulo/sked-ui';

export const getColumns = () => ([
  {
    Header: 'Description',
    accessor: 'description',
    emptyPlaceholderText: '-',
    // Cell: ({ cell }: { cell: { value: string } }) => {
    //   return (
    //     <div className="cx-whitespace-pre-line">
    //       <Icon name="" />
    //     </div>
    //   )
    // }
  },
  {
    Header: 'Type',
    accessor: 'exceptionType',
    emptyPlaceholderText: '-',
    Cell: ({ cell }: { cell: { value: string } }) => {
      return (
        <div className="cx-whitespace-pre-line">{cell.value}</div>
      )
    }
  }
])
