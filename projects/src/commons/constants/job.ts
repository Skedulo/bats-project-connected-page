import { LozengeColors } from '@skedulo/sked-ui'
import { JobStatusKey } from '../types'

export const JOB_STATUS_COLOR: Record<JobStatusKey, LozengeColors>  = {
  'Queued': 'neutral-light',
  'Pending Allocation': 'neutral',
  'Pending Dispatch': 'green',
  'Dispatched': 'cyan',
  'Ready': 'sapphire',
  'En Route': 'purple',
  'On Site': 'purple-darker',
  'In Progress': 'orange',
  'Complete': 'green',
  'Cancelled': 'red',
}

export const SCHEDULE_JOB_STATUS_COLOR: Record<JobStatusKey, string>  = {
  'Queued': '#ECEEF3',
  'Pending Allocation': '#8D95A5',
  'Pending Dispatch': '#9BD3A8',
  'Dispatched': '#29768D',
  'Ready': '#3E6682',
  'En Route': '#8F7DD9',
  'On Site': '#514192',
  'In Progress': '#9F5314',
  'Complete': '#50A463',
  'Cancelled': '#C0362B',
}
