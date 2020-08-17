import { ResourceSortType } from '../../Store/types/Resource'
import { WeekdayOption, JobStatusKey, Option } from '../../Store/types'
import { LozengeColors } from '@skedulo/sked-ui'

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

export const MESSAGE_VARIABLES: Option[] = [
  {
    label: 'Job ID',
    value: '{{ UID }}'
  },
  {
    label: 'Job Name',
    value: '{{ Name }}'
  },
  {
    label: 'Job Start Time',
    value: '{{ Start }}'
  },
  {
    label: 'Job End Time',
    value: '{{ End }}'
  },
  {
    label: 'Job Type',
    value: '{{ Type }}'
  },
  {
    label: 'Job Duration',
    value: '{{ Duration }}'
  },
  {
    label: 'Job Status',
    value: '{{ JobStatus }}'
  },
  {
    label: 'Job Region',
    value: '{{ Region.Name }}'
  },
  {
    label: 'Account Name',
    value: '{{ Account.Name }}'
  },
  {
    label: 'Contact Full Name',
    value: '{{ Contact.FullName }}'
  }
]
