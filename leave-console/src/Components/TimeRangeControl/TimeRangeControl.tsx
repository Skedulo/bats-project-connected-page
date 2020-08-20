import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CalendarControls, RangeType } from '@skedulo/sked-ui'
import { State } from '../../Store/types'
import { setTimeRange } from '../../Store/reducers/timeRange'
import { startOfYesterday } from 'date-fns/esm'
import './TimeRangeControl.scss'

const rangeOptions: RangeType[] = [
  'day',
  '3-days',
  'week',
  // '2-weeks',
  // 'month'
]

const getRangeEndDate = (startDate: Date, range: string) => {
  const endDate = new Date(startDate)

  switch (range) {
    case 'day':
      endDate.setDate(endDate.getDate() + 0)
      break
    case 'week':
      endDate.setDate(endDate.getDate() + 6)
      break
    case '3-days':
      endDate.setDate(endDate.getDate() + 2)
      break
    case '2-weeks':
      endDate.setDate(endDate.getDate() + 13)
      break
    case 'month':
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(endDate.getDate() - 1)
      break
    default: {
      endDate.setDate(endDate.getDate() + 6)
    }
  }

  endDate.setUTCHours(23)
  endDate.setUTCMinutes(59)
  endDate.setUTCSeconds(59)

  return endDate
}

const TimeRangeControl: React.FC = () => {
  const dispatch = useDispatch()

  const selectedDateISO = useSelector((state: State) => state.timeRange.startDate)

  const selectedDate = new Date(selectedDateISO)

  const [selectedRange, setSelectedRange] = React.useState(rangeOptions[2])

  const onDateSelect = (date: Date) => {
    const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
    dispatch(setTimeRange(startDate, getRangeEndDate(startDate, selectedRange)))
  }

  const onTodayClick = () => {
    const date = new Date()
    const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
    dispatch(setTimeRange(startDate, getRangeEndDate(startDate, selectedRange)))
  }

  const onRangeSelect = (range: RangeType) => {
    setSelectedRange(range)
    dispatch(setTimeRange(selectedDate, getRangeEndDate(selectedDate, range)))
  }

  return (
    <div className="time-range-control__container">
      <CalendarControls
        selected={selectedDate}
        onDateSelect={onDateSelect}
        selectedRange={selectedRange}
        onRangeChange={onRangeSelect}
        rangeOptions={rangeOptions}
        onTodayClick={onTodayClick}
      />
    </div>
  )
}

export default TimeRangeControl
