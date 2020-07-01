import React from 'react'
import { parseISO, format } from 'date-fns'

import { IDynamicTable } from '@skedulo/sked-ui'
import { ConflictsCell } from './cell-formatters/ConflictsCell'
import { ResourceCell } from './cell-formatters/ResourceCell'
import { RegionCell } from './cell-formatters/RegionCell'
import { StatusCell } from './cell-formatters/StatusCell'
import { DateRangeCell } from './cell-formatters/DateRangeCell'
import { ActionsCell } from './cell-formatters/ActionsCell'
import { UnavailabilityTableItem } from '../../Store/types/UnavailabilityTableItem';

interface IGetColumns {
  onApprove: (id: string) => void,
  onRecall: (id: string) => void,
  onReject: (id: string) => void,
}

export const getColumns = ({ onApprove, onRecall, onReject }: IGetColumns) => [
  {
    key: 'Resource',
    name: 'Resource name',
    emptyPlaceholderText: '-',
    cellRenderer: (resource, row) => <ResourceCell resource={ row.Resource } />
  },
  {
    key: 'Resource',
    name: 'Region',
    emptyPlaceholderText: '-',
    cellRenderer: (region, row) => <RegionCell regionName={ row.Resource.PrimaryRegion.Name }/>
  },
  {
    key : 'Start',
    name: 'Leave',
    emptyPlaceholderText: '-',
    cellRenderer: (startDate, row) => (
      <DateRangeCell startDate={ startDate } endDate={ row.Finish } />
    )
  },
  {
    key : 'CreatedDate',
    name: 'Created',
    emptyPlaceholderText: '-',
    cellRenderer: (createdDate) => (
      <span>{ format(parseISO(createdDate), 'MMM d, y') }</span>
    )
  },
  {
    key: 'conflicts',
    name: 'Conflicts',
    emptyPlaceholderText: '-',
    cellRenderer: (conflicts) => (
      <ConflictsCell conflictsCount={ conflicts } />
    )
  },
  {
    key: 'Status',
    name: 'Status',
    width: 120,
    emptyPlaceholderText: '-',
    cellRenderer: status => (
      <StatusCell type={ status } />
    )
  },
  {
    key: 'UID',
    name: 'Action',
    width: 240,
    emptyPlaceholderText: '-',
    cellRenderer: (id, row) => (
      <ActionsCell
        availabilityId={ id }
        availabilityStatus={ row.Status }
        onApprove={ onApprove }
        onReject={ onReject }
        onRecall={ onRecall }
      />
    )
  }
] as IDynamicTable<UnavailabilityTableItem>[]
