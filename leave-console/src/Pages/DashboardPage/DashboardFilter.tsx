import React, { useState, useCallback, memo, ChangeEvent, useEffect } from 'react'
import { useDashboardFilter } from './useDashboardFilter'
import { format, add, isValid } from 'date-fns'
import { FilterBar } from '../../Components/filter-bar/FilterBar'
import { setupFilters, setFiltersValues } from '../../Store/reducers/filter'
import { useDispatch, useSelector } from 'react-redux'
import { State, IRegion } from '../../Store/types'
import { setRegion } from '../../Store/reducers/region';

const DashboardFilter: React.FC = () => {
  const dispatch = useDispatch()
  const {
    filterBar,
    setAppliedFilter,
  } = useDashboardFilter()
  const [forceUpdateFilterBar, setForceUpdateFilterBar] = useState<boolean>(false)

  // revoked once applying filter from filter bar
  const onFilter = useCallback((params: any) => {
    const selectedParams: any = {}
    filterBar.forEach((item: any) => {
      const matchedItem = params.find((paramItem: any) => paramItem.id === item.id)
      selectedParams[item.id] = matchedItem
        ? matchedItem.selectedItems.map((selected: any) => selected.id).join(',')
        : ''
    })
    setAppliedFilter(params)
    setForceUpdateFilterBar(false)
    dispatch(setRegion(params[0].selectedItems[0] as IRegion))
  }, [filterBar])

  return (
    <div className="cx-relative cx-p-4">
      <FilterBar filters={filterBar} onFilter={onFilter} forceUpdate={forceUpdateFilterBar} />
    </div>
  )
}

export default memo(DashboardFilter)
