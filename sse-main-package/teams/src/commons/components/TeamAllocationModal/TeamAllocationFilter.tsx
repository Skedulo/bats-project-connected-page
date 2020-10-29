import React, { useState, useCallback, memo, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { CalendarControls, RangeType, SearchSelect, ISelectItem } from '@skedulo/sked-ui'
import { startOfWeek, add, isSameWeek } from 'date-fns'

import { State, Period } from '../../types'

interface TeamAllocationFilterProps {
  onPeriodChange: (data: Period) => void
  allocationPeriod: Period
}

const TeamAllocationFilter: React.FC<TeamAllocationFilterProps> = ({ allocationPeriod, onPeriodChange }) => {
  const selectedPeriod = useSelector<State, Period>(state => state.selectedPeriod)

  const [rangeType, setRangeType] = useState<RangeType>(isSameWeek(selectedPeriod.startDate, selectedPeriod.endDate) ? 'week' : '2-weeks')

  const dayGap = useMemo(() => rangeType === 'week' ? 6 : 13, [rangeType])

  const onRangeChange = useCallback((range: RangeType) => {
    setRangeType(range)
    onPeriodChange({ startDate: allocationPeriod.startDate, endDate: add(allocationPeriod.startDate, { days: rangeType === 'week' ? 6 : 13 }) })
  }, [allocationPeriod])

  const onSortItemChange = useCallback((item: ISelectItem) => {
    console.log('item: ', item)
  }, [])

  const onDateChange = useCallback((date: Date) => {
    onPeriodChange({ startDate: startOfWeek(date), endDate: add(startOfWeek(date), { days: dayGap }) })
  }, [dayGap])

  const onTodayClick = useCallback(() => {
    onPeriodChange({ startDate: startOfWeek(new Date()), endDate: add(startOfWeek(new Date()), { days: dayGap }) })
  }, [dayGap])

  return (
    <div className="cx-relative cx-p-4 cx-border-b cx-sticky cx-top-0 cx-left-0 cx-bg-white cx-z-10">
      <ul className="cx-flex cx-items-center cx-justify-between">
        <li>
          <SearchSelect
            items={[{ value: 'BestFit', label: 'Best Fit' }]}
            selectedItem={{ value: 'BestFit', label: 'Best Fit' }}
            onSelectedItemChange={onSortItemChange}
          />
        </li>
        <li>
          <CalendarControls
            rangeOptions={['week', '2-weeks']}
            selectedRange={rangeType}
            selected={allocationPeriod.startDate}
            selectWeek
            onRangeChange={onRangeChange}
            onDateSelect={onDateChange}
            onTodayClick={onTodayClick}
          />
        </li>
      </ul>
    </div>
  )
}

export default memo(TeamAllocationFilter)
