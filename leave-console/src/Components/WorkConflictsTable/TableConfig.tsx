import React from 'react'
import {
  JobNameCell,
  AccountCell,
  StatusCell,
  ScheduledCell,
  AvailableResourcesCell,
  ReallocateCell
} from './cell-formatters'
import { JobAllocation, Job, Resource } from '../../Store/types'
import { getDefaultAvatar } from '../../common/utils/avatars'

interface IGetColumns {
  onRecall: (id: string) => void,
}

export const getColumns = () => ([
  {
    Header: 'Name/Description',
    accessor: 'Job.Name',
    emptyPlaceholderText: '-',
    Cell: ({ cell, row }: { cell: { value: string }, row: { original: JobAllocation } }) => {
      return <JobNameCell id={row.original.Job.UID} name={cell.value} description={row.original.Job.Description} />
    }
  },
  {
    Header: 'Account/Contact',
    accessor: 'UID',
    emptyPlaceholderText: '-',
    Cell: ({ cell, row }: { cell: { value: string }, row: { original: JobAllocation } }) => {
      return <AccountCell account={row.original.Job.Account} contact={row.original.Job.Contact} />
    }
  },
  {
    Header: 'Job Type',
    accessor: 'Job.JobType',
    emptyPlaceholderText: '-'
  },
  {
    Header: 'Status',
    accessor: 'Job.Status',
    emptyPlaceholderText: '-',
    Cell: ({ cell }: { cell: { value: string } }) => {
      return <StatusCell status={cell.value} />
    }
  },
  {
    Header: 'Address',
    accessor: 'Job.Address',
    emptyPlaceholderText: '-'
  },
  {
    Header: 'Scheduled',
    accessor: 'Job.Start',
    emptyPlaceholderText: '-',
    Cell: ({ cell, row }: { cell: { value: string }, row: { original: JobAllocation } }) => {
      return <ScheduledCell schedule={{ start: cell.value, end: row.original.Job.End }} />
    }
  },
  {
    Header: 'Resources',
    accessor: 'Job.JobAllocations',
    emptyPlaceholderText: '-',
    Cell: ({ cell }: { cell: { value: { Resource: Resource }[] } }) => {
      const resources = cell.value?.map(item => ({
        name: item.Resource.Name,
        avatarUrl: item.Resource.User.SmallPhotoUrl || getDefaultAvatar()
      }))
      return <AvailableResourcesCell resources={resources} />
    }
  },
  {
    Header: '',
    accessor: 'Job',
    width: 240,
    Cell: ({ cell }: { cell: { value: Job } }) => {
      return <ReallocateCell job={cell.value} />
    }
  }
])
