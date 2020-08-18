import { MessageVariable } from '../../Store/types'

export const MESSAGE_VARIABLES: MessageVariable[] = [
  {
    label: 'Unavailability Type',
    value: '<Unavailability Type>',
    field: 'Type',
  },
  {
    label: 'Start Date',
    value: '<Start Date>',
    field: 'Start'
  },
  {
    label: 'Finish Date',
    value: '<Finish Date>',
    field: 'Finish',
  },
  {
    label: 'Request Status',
    value: '<Request Status>',
    field: 'Status'
  },
  {
    label: 'Total Days Remaining',
    value: '<Total Days Remaining>',
    field: 'Resource.AnnualLeaveRemaining'
  },
  {
    label: 'Total Allowance in Days',
    value: '<Total Allowance in Days>',
    field: 'Resource.AnnualLeaveAllowance',
  }
]

export const DEFAULT_PALETTE_COLORS = [
  '#e6194B',
  '#f58231',
  '#ffe119',
  '#bfef45',
  '#3cb44b',
  '#42d4f4',
  '#4363d8',
  '#911eb4',
  '#f032e6',
  '#000',
]
