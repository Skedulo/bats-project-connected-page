import { format } from 'date-fns'
import { Dispatch } from 'redux'

import { makeActionCreator } from '../../common/utils/redux-helpers'
import { getAvailabilities } from './availabilities'
import { State, IRegion } from '../types'
import { utcToZonedTime } from 'date-fns-tz'

const REGION_SET = 'REGION_SET'

export const setRegionSimp = makeActionCreator(REGION_SET, null, null)

export const setRegion = (region: IRegion) => (dispatch: Dispatch) => {
  dispatch(setRegionSimp(region))
}

export default {
  [REGION_SET]: (
    state: State,
    region: IRegion
  ) => ({
    ...state,
    region
  })
}
