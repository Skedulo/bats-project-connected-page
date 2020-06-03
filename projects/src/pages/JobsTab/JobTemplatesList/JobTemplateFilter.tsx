import React, { useState, useCallback, memo } from 'react'
import { isEqual } from 'lodash'
import useJobTemplateFilter from './useJobTemplateFilter'
import { FilterBar } from '../../../commons/components/filter-bar/FilterBar'

interface IJobTemplateFilterProps {
  onFilterChange: (data: any) => void
  onResetFilter: () => void
  filterParams: any
}

const JobTemplateFilter: React.FC<IJobTemplateFilterProps> = ({ onResetFilter, onFilterChange, filterParams }) => {
  const {
    filterBar,
    setFilterBar,
    setAppliedFilter
  } = useJobTemplateFilter()
  const [forceUpdateFilterBar, setForceUpdateFilterBar] = useState<boolean>(false)

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
    setAppliedFilter(params)
    setForceUpdateFilterBar(false)
    onFilterChange({ ...selectedParams })
  }, [filterBar])

  return (
    <div className="top-bar cx-border-b-0">
      <div className="top-bar-left">
        <ul className="menu">
          <li onClick={resetFilter}>
            <div className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mx-2 sk-cursor-pointer sk-px-3 sk-text-neutral-750 hover:sk-bg-blue-100 sk-bg-neutral-200">
              All Job Templates
            </div>
          </li>
          <li>
            <FilterBar filters={filterBar} onFilter={onFilter} forceUpdate={forceUpdateFilterBar} />
          </li>
        </ul>
      </div>
    </div>
  )
}

export default memo(JobTemplateFilter)
