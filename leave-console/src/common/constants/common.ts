import { ResourceSortType } from '../../Store/types/Resource'
import { WeekdayOption, JobStatusKey } from '../../Store/types'
import { LozengeColors } from '@skedulo/sked-ui';

export const DEFAULT_FILTER = {
  searchText: '',
  pageSize: 20,
  pageNumber: 1
}

export const CHART_COLORS = {
  tickY: '#d4d7de',
  tickX: '#6d7991',
  grid: '#e5e7ee',
  line: '#d55248',
  bar: '#008cff',
  warning: '#c0142a',
}

export const RESOURCE_SORT_OPTIONS = [
  { value: ResourceSortType.TravelDistanceFromHome, label: 'Travel Distance from home' },
  { value: ResourceSortType.TravelDurationFromHome, label: 'Travel Duration from home' },
  { value: ResourceSortType.BestFit, label: 'Best Fit' },
  { value: ResourceSortType.Name, label: 'Name' },
  { value: ResourceSortType.Rating, label: 'Highest Rating' },
  { value: ResourceSortType.Utilised, label: 'Least Utilised' }
]

export const WEEKDAYS: WeekdayOption[] = [
  { value: 'sunday', label: 'Su' },
  { value: 'monday', label: 'Mo' },
  { value: 'tuesday', label: 'Tu' },
  { value: 'wednesday', label: 'We' },
  { value: 'thursday', label: 'Th' },
  { value: 'friday', label: 'Fr' },
  { value: 'saturday', label: 'Sa' }
]

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

