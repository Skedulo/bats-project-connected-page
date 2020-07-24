import { LozengeColors } from '@skedulo/sked-ui'
import { JobStatusKey, ResourceSortType } from '../types'

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

export const RESOURCE_SORT_OPTIONS = [
  { value: ResourceSortType.TravelDistanceFromHome, label: 'Travel Distance from home' },
  { value: ResourceSortType.TravelDurationFromHome, label: 'Travel Duration from home' },
  { value: ResourceSortType.BestFit, label: 'Best Fit' },
  { value: ResourceSortType.Name, label: 'Name' },
  { value: ResourceSortType.Rating, label: 'Highest Rating' },
  { value: ResourceSortType.Utilised, label: 'Least Utilised' }
]

export const ALLOWED_DEALLOCATE_STATUS = ['Dispatched', 'Pending Dispatch']

export const ALLOWED_DISPATCH_STATUS = ['Pending Dispatch']

export const ALLOWED_UNSCHEDULE_STATUS = ['Dispatched', 'Pending Dispatch', 'Pending Allocation']
