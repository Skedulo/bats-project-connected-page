import { format } from 'date-fns'
import { Dispatch } from 'redux'

import { makeActionCreator } from '../../common/utils/redux-helpers'
import { getAvailabilities } from './availabilities'
import { State } from '../types'

const TIME_RANGE_SET = 'TIME_RANGE_SET'

export const getDefaultTimeRange = () => {
  const today = getMonday(new Date())
  const startDate = format(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  const endDate = format(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 6, 23, 59, 59)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  return {
    startDate,
    endDate
  }
}

export const setTimeRangeSimp = makeActionCreator(TIME_RANGE_SET, null, ['startDate', 'endDate'])

export const setTimeRange = (startDate: Date, endDate: Date) => (dispatch: Dispatch) => {
  dispatch(setTimeRangeSimp(startDate, endDate))
  dispatch(getAvailabilities())
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
      startDate: format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      endDate: format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    }
  })
}
