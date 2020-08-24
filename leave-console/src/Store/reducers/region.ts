import { format } from 'date-fns'
import { Dispatch } from 'redux'

import { makeActionCreator } from '../../common/utils/redux-helpers'
import { getAvailabilities } from './availabilities'
import { State, IRegion } from '../types'
import { utcToZonedTime } from 'date-fns-tz'
import { setLocalStorage } from '../../common/utils/common'
import { STORAGE_KEYS } from '../../common/constants'

const REGION_SET = 'REGION_SET'

export const setRegionSimp = makeActionCreator(REGION_SET, null, null)

export const setRegion = (region: IRegion) => (dispatch: Dispatch) => {
  dispatch(setRegionSimp(region))
  setLocalStorage(STORAGE_KEYS.LATEST_REGION, region.id)
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
