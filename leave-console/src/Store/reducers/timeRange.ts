import { format } from 'date-fns'
import { Dispatch } from 'redux'

import { makeActionCreator } from '../../common/utils/redux-helpers'
import { getAvailabilities } from './availabilities'
import { State } from '../types'

const TIME_RANGE_SET = 'TIME_RANGE_SET'
const UTC_FORMAT = `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`
export const getDefaultTimeRange = () => {
  const today = getMonday(new Date())
  const startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)).toISOString()
  const endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59)).toISOString()

  return {
    startDate,
    endDate
  }
}

export const setTimeRangeSimp = makeActionCreator(TIME_RANGE_SET, null, ['startDate', 'endDate'])

export const setTimeRange = (startDate: Date, endDate: Date) => (dispatch: Dispatch) => {
  dispatch(setTimeRangeSimp(startDate, endDate))
  // dispatch(getAvailabilities())
}

function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 :1)
  return new Date(d.setDate(diff))
}

export default {
  [TIME_RANGE_SET]: (
    state: State,
    { startDate, endDate }: { startDate: Date, endDate: Date }
  ) => ({
    ...state,
    timeRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  })
}
