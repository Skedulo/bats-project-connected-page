import React from 'react'
import {
  JobNameCell,
  AccountCell,
} from './cell-formatters'
import { JobAllocation, Job, Resource } from '../../Store/types'

export const getColumns = () => ([
  {
    Header: 'Description',
    accessor: 'Job',
    emptyPlaceholderText: '-',
    Cell: ({ cell, row }: { cell: { value: Job }, row: { original: JobAllocation } }) => {
      return <JobNameCell id={cell.value.UID} name={cell.value.Name} description={cell.value.Description} />
    }
  },
  {
    Header: 'Type',
    accessor: 'UID',
    emptyPlaceholderText: '-',
    Cell: ({ cell, row }: { cell: { value: string }, row: { original: JobAllocation } }) => {
      return <AccountCell account={row.original.Job.Account} contact={row.original.Job.Contact} />
    }
  }
])
