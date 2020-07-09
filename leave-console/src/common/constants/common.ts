import { ResourceSortType } from '../../Store/types/Resource'

export const DEFAULT_FILTER = {
  searchText: '',
  pageSize: 20,
  pageNumber: 1
}

export const CHART_COLORS = {
  tickY: '#d4d7de',
  tickX: '#6d7991',
  grid: '#e5e7ee',
  line: '#c0142a',
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
