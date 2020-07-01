import React from 'react'
import {
  JobNameCell,
  AccountCell,
  StatusCell,
  ScheduledCell,
  AvailableResourcesCell,
  RescheduleCell
} from './cell-formatters'

export const getConfig = ({ onSelect }: { onSelect: (key: string, selections: Set<string>) => void }) => ({
  options: {
    selectable: {
      selectBy: 'jobId',
      selectAll: true,
      onSelect
    }
  },
  columns: [
    {
      name: 'Name/Description',
      key: 'jobInfo',
      cellRenderer: (info: { name: string, description: string }) => <JobNameCell name={ info.name } description={ info.description } />
    }, {
      name: 'Account/Contact',
      key: 'subject',
      cellRenderer: (subject: {
        account: { Name: string }
        contact: { FullName: string }
      }) => <AccountCell account={ subject.account } contact={ subject.contact } />
    }, {
      name: 'Job Type',
      key: 'jobType'
    }, {
      name: 'Status',
      key: 'status',
      width: 122,
      cellRenderer: (status: string) => <StatusCell status={ status } />
    }, {
      name: 'Address',
      key: 'address',
    }, {
      name: 'Scheduled',
      key: 'scheduled',
      width: 250,
      cellRenderer: (schedule: { start: string, end: string }) => <ScheduledCell schedule={ schedule } />
    }, {
      name: 'Resources',
      key: 'jobAllocatedResources',
      width: 150,
      cellRenderer: (jobAllocatedResources: {

      }) => <AvailableResourcesCell resources ={ resources } />
    }, {
      name: ' ',
      key: 'jobId',
      width: 150,
      cellRenderer: (id: string) => <RescheduleCell jobId={ id } />
    }
  ]
})
