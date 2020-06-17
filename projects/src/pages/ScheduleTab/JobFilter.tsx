import React, { useState, useCallback, memo, ChangeEvent } from 'react'
import { cloneDeep, isEqual } from 'lodash'
import useJobFilter from './useJobFilter'
import { ISavedFilterSet } from '../../commons/types'
import { FilterBar } from '../../commons/components/filter-bar/FilterBar'

interface IJobFilterProps {
  onFilterChange: (data: any) => void
  onResetFilter: () => void
  filterParams: any
  noDateFilter?: boolean
}

const JobFilter: React.FC<IJobFilterProps> = ({ onResetFilter, onFilterChange, filterParams, noDateFilter }) => {
  const {
    filterBar,
    setFilterBar,
    appliedFilter,
    setAppliedFilter
  } = useJobFilter()
  const [forceUpdateFilterBar, setForceUpdateFilterBar] = useState<boolean>(false)

  const [selectedFilterSet, setSelectedFilterSet] = useState<ISavedFilterSet | null>(null)

  const resetFilter = React.useCallback(() => {
    const newFilterBar = filterBar.map(filterItem => {
      if (filterItem.selectedIds.length) {
        return {
          ...filterItem,
          items: filterItem.useFetch ? [] : filterItem.items,
          selectedIds: []
        }
      }
      return filterItem
    })

    if (!isEqual(filterBar, newFilterBar)) {
      setFilterBar(newFilterBar)
    }
    setForceUpdateFilterBar(true)
    onResetFilter()
    setSelectedFilterSet(null)
  }, [filterBar])

  // revoked once applying filter from filter bar
  const onFilter = useCallback((params: any) => {
    const selectedParams: any = {}
    filterBar.forEach((item: any) => {
      const matchedItem = params.find((paramItem: any) => paramItem.id === item.id)
      selectedParams[item.id] = matchedItem
        ? matchedItem.selectedItems.map((selected: any) => selected.id).join(',')
        : ''
    })
    setSelectedFilterSet(null)
    setAppliedFilter(params)
    setForceUpdateFilterBar(false)
    onFilterChange({ ...selectedParams })
  }, [filterBar])

  return (
    <div className="cx-relative cx-p-2">
      <ul className="cx-flex cx-items-center">
        <li onClick={resetFilter}>
          <div className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mx-2 cx-cursor-pointer cx-px-3 cx-text-neutral-750 hover:cx-bg-blue-100 cx-bg-neutral-200">
            All Jobs
          </div>
        </li>
        <li>
          <FilterBar filters={filterBar} onFilter={onFilter} forceUpdate={forceUpdateFilterBar} />
        </li>
      </ul>
    </div>
  )
}

export default memo(JobFilter)
