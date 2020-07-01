import {
  makeReducer,
  DEF_RES_STATE
} from '../../common/utils/redux-helpers'

import { State } from '../types'

import subscriptionReducers from './subscription'
import fetchReducers from './fetch'
import filterReducers from './filter'
import timeRangeReducers, { getDefaultTimeRange } from './timeRange'
import availabilityReducers from './availabilities'
import conflictingJobAllocations, { getDefaultConflictingJobAllocations } from './conflictingJobAllocations'

const DEF_STATE: State = {
  ...DEF_RES_STATE,
  filters: [],
  timeRange: getDefaultTimeRange(),
  expandedUID: null,
  conflictingJobAllocations: getDefaultConflictingJobAllocations()
}

const reducer = makeReducer(
  {
    ...subscriptionReducers,
    ...fetchReducers,
    ...filterReducers,
    ...timeRangeReducers,
    ...availabilityReducers,
    ...conflictingJobAllocations
  },
  DEF_STATE
)

export default reducer
