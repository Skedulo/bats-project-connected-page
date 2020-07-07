import React from 'react'
import { parseISO, format } from 'date-fns'

import { ConflictsCell } from './cell-formatters/ConflictsCell'
import { ResourceCell } from './cell-formatters/ResourceCell'
import { RegionCell } from './cell-formatters/RegionCell'
import { StatusCell } from './cell-formatters/StatusCell'
import DateRangeCell from './cell-formatters/DateRangeCell'
import ActionsCell from './cell-formatters/ActionsCell'
import { UnavailabilityTableItem } from '../../Store/types/UnavailabilityTableItem'
import { Resource } from '../../Store/types/Resource'
import { AvailabilityStatus } from './UnavailabilityTable'
import { Region } from '../../Store/types'

interface IGetColumns {
  onApprove: (id: string) => void,
  onRecall: (id: string) => void,
  onReject: (id: string) => void,
}

export const getColumns = ({ onApprove, onRecall, onReject }: IGetColumns) => [
  {
    Header: 'Resource',
    accessor: 'Resource',
    emptyPlaceholderText: '-',
    Cell: ({ cell }: { cell: { value: Resource } }) => {
      return <ResourceCell resource={cell.value} />
    }
  },
  {
    Header: 'Region',
    accessor: 'Resource.PrimaryRegion',
    emptyPlaceholderText: '-',
    Cell: ({ cell }: { cell: { value: Region } }) => {
      return <RegionCell regionName={ cell.value.Name } />
    }
  },
  {
    Header: 'Unavailability',
    accessor: 'Start',
    emptyPlaceholderText: '-',
    Cell: ({ cell, row }: { cell: { value: string }; row: { original: UnavailabilityTableItem } }) => {
      return <DateRangeCell startDate={cell.value} endDate={ row.original.Finish } />
    }
  },
  {
    Header: 'Created',
    accessor: 'CreatedDate',
    emptyPlaceholderText: '-',
    Cell: ({ cell }: { cell: { value: string } }) => {
      return <span>{ format(parseISO(cell.value), 'MMM d, y') }</span>
    }
  },
  {
    Header: 'Conflicts',
    accessor: 'conflicts',
    emptyPlaceholderText: '-',
    Cell: ({ cell }: { cell: { value: number } }) => {
      return <ConflictsCell conflictsCount={cell.value} />
    }
  },
  {
    Header: 'Status',
    accessor: 'Status',
    emptyPlaceholderText: '-',
    Cell: ({ cell }: { cell: { value: AvailabilityStatus } }) => {
      return <StatusCell type={cell.value} />
    }
  },
  {
    Header: '',
    accessor: 'UID',
    width: 240,
    Cell: ({ cell, row }: { cell: { value: string }, row: { original: UnavailabilityTableItem } }) => {
      return (
        <ActionsCell
          availabilityId={cell.value}
          availabilityStatus={row.original.Status}
          onRecall={onRecall}
        />
      )
    }
  }
]
