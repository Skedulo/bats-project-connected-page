import React, { useState, useCallback, memo, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CalendarControls, RangeType, Button } from '@skedulo/sked-ui'
import { startOfWeek } from 'date-fns'

import { State } from '../../commons/types'
import { fetchGenericOptions } from '../../Services/DataServices'
import { toggleResourceSidebar } from '../../Store/action'

import FilterBar from '../../commons/components/FilterBar'
import SwimlaneSetting from '../../commons/components/SwimlaneSetting'
import { IFilter } from '../../commons/components/FilterBar/interfaces'

interface ITeamFilterProps {
  onFilterChange: (data: any) => void
}

const TeamFilter: React.FC<ITeamFilterProps> = ({ onFilterChange }) => {
  const dispatch = useDispatch()
  const [rangeType, setRangeType] = useState<RangeType>('week')
  const { showResourceSidebar } = useSelector<State>(state => ({
    config: state.config,
    showResourceSidebar: state.showResourceSidebar
  })) as {
    showResourceSidebar: boolean
  }

  const [forceUpdateFilterBar, setForceUpdateFilterBar] = useState<boolean>(false)

  const filterBar = useMemo(() => ([
    {
      id: 'regionIds',
      name: 'Region',
      items: [],
      selectedIds: [],
      inputType: 'checkbox',
      useFetch: async (searchTerm: string) => {
        const res = await fetchGenericOptions({ name: searchTerm, sObjectType: 'sked__Region__c' })
        return res.map(item => ({ id: item.value, name: item.label }))
      }
    }
  ]) as Array<IFilter<{
    id: string
    name: string
  }>>
  , [])

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
  }, [])

  const onToggleResources = useCallback(() => {
    dispatch(toggleResourceSidebar())
  }, [])

  return (
    <div className="cx-relative cx-p-4 cx-border-t cx-border-b cx-border-neutral-400">
      <div className="cx-flex cx-items-center cx-justify-between">
        <ul className="cx-flex cx-items-center">
          <li>
            <CalendarControls
              rangeOptions={['week', '2-weeks']}
              selectedRange={rangeType}
              selected={startOfWeek(new Date())}
              selectWeek
              onRangeChange={onRangeChange}
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
          <li>
            <FilterBar filters={filterBar} onFilter={onFilter} forceUpdate={forceUpdateFilterBar} />
          </li>
        </ul>
        <SwimlaneSetting />
      </div>
    </div>
  )
}

export default memo(TeamFilter)
