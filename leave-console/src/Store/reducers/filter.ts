import { Dispatch } from 'redux'

import { getAvailabilities } from './availabilities'
import { Availability, State } from '../types'
import { makeActionCreator } from '../../common/utils/redux-helpers'

const FILTERS_BUILD = 'FILTERS_BUILD'
const FILTERS_VALUES_SET = 'FILTERS_VALUES_SET'

const PRESET_FILTERS = [
  {
    name: 'Primary Region',
    value: (options: string[]) => [[...options].sort()[0]]
  }
]

const filtesrMap: {
  [index: string]: {
    label: string
    selector: string
  }
} = {
  PrimaryRegion: {
    label: 'Primary Region',
    selector: 'Availability.Resource.PrimaryRegion.Name'
  }
}

const createFilter = (name: string, availabilities: Availability[]) => {
  const options = createSimpleTypeFilterOptions(name, availabilities)

  options.sort()

  const defFilter = PRESET_FILTERS.find(({ name: presetFilterName }) => presetFilterName === name)

  return defFilter
    ? { name, options, selector: filtesrMap[name].selector ,value: defFilter.value(options), preselected: defFilter.value(options), description: filtesrMap[name].label }
    : { name, options, selector: filtesrMap[name].selector ,value: null, description: filtesrMap[name].label }
}

function createSimpleTypeFilterOptions(name: string, availabilities: Availability[]) {
  const allOptions = new Set(availabilities
    .map(availability => (availability as any)[name])
    .filter(value => value !== null)
  )

  return [...allOptions]
}

const statusFilter = {
  description: 'Status',
  name: 'Status',
  selector: 'Status',
  options: [
    'Pending',
    'Approved',
    'Declined'
  ],
  value: null
}

const buildFilters = (availabilities: Availability[]) => {
  const filterNames = ['Status', 'Resource']

  const filters = filterNames
    .filter(name => !!filtesrMap[name])
    .map(name => createFilter(name, availabilities))

  return [statusFilter,...filters]
}

export const setupFiltersSimp = makeActionCreator(FILTERS_BUILD)
export const setupFilters = () => (dispatch: Dispatch) => {
  dispatch(setupFiltersSimp())
  dispatch(getAvailabilities())
}

export const setFiltersValuesSimp = makeActionCreator(FILTERS_VALUES_SET, null, 'values')
export const setFiltersValues = (values: { name: string, value: any[] }[]) => (dispatch: Dispatch) => {
  dispatch(setFiltersValuesSimp(values))
  dispatch(getAvailabilities())
}

export default {
  [FILTERS_BUILD]: (state: State) => ({
    ...state,
    filters: buildFilters(state.availabilities!)
  }),
  [FILTERS_VALUES_SET]: (
    state: State,
    { values }: { values: { name: string, value: any[] }[]}
  ) => ({
    ...state,
    filters: state.filters!.map(filter => ({
      ...filter,
      value: (values.find(value => value.name === filter.name) || {} as any).value || null
    }))
  })
}
