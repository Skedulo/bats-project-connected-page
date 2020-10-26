import React, { useState, useCallback, memo } from 'react'
import { useSelector } from 'react-redux'
import { CalendarControls, RangeType, SearchSelect, ISelectItem } from '@skedulo/sked-ui'
import { startOfWeek, add, isSameWeek } from 'date-fns'

import { State } from '../../types'

interface TeamAllocationFilterProps {
  onFilterChange: (data: any) => void
}

const TeamAllocationFilter: React.FC<TeamAllocationFilterProps> = ({ onFilterChange }) => {
  const dateRange = useSelector<State, Date[]>(state => state.dateRange)

  const [rangeType, setRangeType] = useState<RangeType>(isSameWeek(dateRange[0], dateRange[dateRange.length - 1]) ? 'week' : '2-weeks')

  const onRangeChange = useCallback((range: RangeType) => {
    setRangeType(range)
  }, [])

  const onSortItemChange = useCallback((item: ISelectItem) => {
    console.log('item: ', item)
  }, [])

  const onDateChange = useCallback((date: Date) => {
    onFilterChange({ startDate: startOfWeek(date), endDate: add(startOfWeek(date), { days: 6 }) })
  }, [])

  return (
    <div className="cx-relative cx-p-4 cx-border-b cx-sticky cx-top-0 cx-left-0 cx-bg-white cx-z-1">
      <ul className="cx-flex cx-items-center cx-justify-between">
        <li className="cx-ml-4">
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
            selected={startOfWeek(dateRange[0])}
            selectWeek
            onRangeChange={onRangeChange}
            onDateSelect={onDateChange}
          />
        </li>
      </ul>
    </div>
  )
}

export default memo(TeamAllocationFilter)
