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
