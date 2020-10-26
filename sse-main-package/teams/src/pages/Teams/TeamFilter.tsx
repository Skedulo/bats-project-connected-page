import React, { useState, useCallback, memo, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CalendarControls, RangeType, Button } from '@skedulo/sked-ui'
import { startOfWeek, add } from 'date-fns'

import { State, TeamFilterParams, Config } from '../../commons/types'
import { IFilter } from '../../commons/components/FilterBar/interfaces'
import { toggleResourceSidebar } from '../../Store/action'

import FilterBar from '../../commons/components/FilterBar'
import SwimlaneSetting from '../../commons/components/SwimlaneSetting'

interface ITeamFilterProps {
  onFilterChange: (data: any) => void
  filterParams: TeamFilterParams
}

const TeamFilter: React.FC<ITeamFilterProps> = ({ onFilterChange, filterParams }) => {
  const dispatch = useDispatch()
  const { showResourceSidebar, config } = useSelector<State>(state => ({
    config: state.config,
    showResourceSidebar: state.showResourceSidebar
  })) as {
    showResourceSidebar: boolean
    config: Config
  }

  const [rangeType, setRangeType] = useState<RangeType>('week')

  const dayGap = useMemo(() => rangeType === 'week' ? 6 : 13, [rangeType])

  const [forceUpdateFilterBar, setForceUpdateFilterBar] = useState<boolean>(false)

  const filterBar = useMemo(() => ([
    {
      id: 'regionIds',
      name: 'Region',
      inputType: 'radio',
      items: config?.regions || [],
      selectedIds: [filterParams.regionIds]
    }
  ]) as Array<IFilter<{
    id: string
    name: string
  }>>
  , [config])

  // revoked once applying filter from filter bar
  const onFilter = useCallback((params: any) => {
    const selectedParams: any = {}
    filterBar.forEach((item: any) => {
      const matchedItem = params.find((paramItem: any) => paramItem.id === item.id)
      selectedParams[item.id] = matchedItem
        ? matchedItem.selectedItems.map((selected: any) => selected.id).join(', ')
        : []
    })
    setForceUpdateFilterBar(false)
    onFilterChange({ ...selectedParams })
  }, [filterBar])

  const onRangeChange = useCallback((range: RangeType) => {
    setRangeType(range)
    onFilterChange({ endDate: add(filterParams.startDate, { days: range === 'week' ? 6 : 13 }) })
  }, [filterParams])

  const onDateChange = useCallback((date: Date) => {
    onFilterChange({ startDate: startOfWeek(date), endDate: add(startOfWeek(date), { days: dayGap }) })
  }, [dayGap])

  const onTodayClick = useCallback(() => {
    onFilterChange({ startDate: startOfWeek(new Date()), endDate: add(startOfWeek(new Date()), { days: dayGap }) })
  }, [dayGap])

  const onToggleResources = useCallback(() => {
    dispatch(toggleResourceSidebar())
  }, [])

  return (
    <div className="cx-relative cx-p-4 cx-border-t cx-border-b ">
      <div className="cx-flex cx-items-center cx-justify-between">
        <ul className="cx-flex cx-items-center">
          <li>
            <CalendarControls
              rangeOptions={['week', '2-weeks']}
              selectedRange={rangeType}
              selected={filterParams.startDate}
              selectWeek
              onRangeChange={onRangeChange}
              onDateSelect={onDateChange}
              onTodayClick={onTodayClick}
            />
          </li>
          <li className="cx-ml-4">
            <Button
              buttonType="secondary"
              icon={showResourceSidebar ? 'resourceRemove' : 'resource'}
              onClick={onToggleResources}
            >
              {showResourceSidebar ? 'Hide Resources' : 'Show Resources'}
            </Button>
          </li>
          <li className="cx-ml-4">
            <FilterBar filters={filterBar} onFilter={onFilter} forceUpdate={forceUpdateFilterBar} />
          </li>
        </ul>
        <SwimlaneSetting />
      </div>
    </div>
  )
}

export default memo(TeamFilter)
