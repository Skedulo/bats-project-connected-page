import React, { useState, useCallback, memo, ChangeEvent } from 'react'
import { Button, Icon, PopOut, Datepicker, IconButton, Menu, MenuItem } from '@skedulo/sked-ui'
import { cloneDeep, isEqual } from 'lodash'
import { DATE_FORMAT } from '../../common/constants/date'
import { useRuleFilter } from './useRuleFilter'
import { format, add, isValid } from 'date-fns'
import { FilterBar } from '../../Components/filter-bar/FilterBar'

const ALL_PROJECTS = 'All Projects'

interface IRuleFilterProps {
  onFilterChange: (data: any) => void
  onResetFilter: () => void
  filterParams: any
}

const RuleFilter: React.FC<IRuleFilterProps> = ({ onResetFilter, onFilterChange, filterParams }) => {
  const {
    filterBar,
    setFilterBar,
    setAppliedFilter,
  } = useRuleFilter()
  const [forceUpdateFilterBar, setForceUpdateFilterBar] = useState<boolean>(false)
  const [filterDates, setFilterDates] = useState({
    startDate: new Date(),
    endDate: new Date(''),
  })

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

  // revoked once selecting filter date
  const onSelectDate = React.useCallback(
    (fieldName: string, callback?: () => void) => (value: Date) => {
      if (fieldName === 'startDate') {
        const endDate = isValid(filterDates.endDate) ? filterDates.endDate : add(value, { days: 7 })
        setFilterDates(prev => ({ ...prev, [fieldName]: value, endDate }))
        onFilterChange({
          [fieldName]: format(value, DATE_FORMAT),
          endDate: format(endDate, DATE_FORMAT),
        })
      }
      if (fieldName === 'endDate') {
        setFilterDates(prev => ({ ...prev, [fieldName]: value }))
        onFilterChange({ [fieldName]: format(value, DATE_FORMAT) })
      }
      if (typeof callback === 'function') {
        callback()
      }
    },
    [filterDates.endDate]
  )

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

  // the end date filter text
  const filterEndDateTrigger = useCallback(() => {
    if (!filterParams.endDate) {
      return <></>
    }
    return (
      <div className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mx-2 sk-cursor-pointer sk-px-3 sk-text-neutral-750 hover:sk-bg-blue-100 sk-bg-neutral-200">
        <span>
          End date:
          <span className="cx-font-semibold cx-ml-2">{filterParams.endDate}</span>
        </span>
      </div>
    )
  }, [filterParams.endDate])

  // the start date filter text
  const filterStartDateTrigger = useCallback(() => {
    return (
      <div className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mx-2 sk-cursor-pointer sk-px-3 sk-text-neutral-750 hover:sk-bg-blue-100 sk-bg-neutral-200">
        {!filterParams.startDate ? (
          <span>
            Date:
            <span className="cx-font-semibold cx-ml-2">All time</span>
          </span>
        ) : (
          <span>
            Start date:
            <span className="cx-font-semibold cx-ml-2">{filterParams.startDate}</span>
          </span>
        )}
      </div>
    )
  }, [filterParams.startDate])

  return (
    <div className="cx-relative cx-p-4 cx-border-b cx-border-neutral-300">
      <ul className="cx-flex cx-items-center">
        <li>
          <div className="cx-flex cx-items-center">
            <PopOut
              placement="bottom"
              closeOnOuterClick={true}
              closeOnScroll={true}
              trigger={filterStartDateTrigger}
            >
              {togglePopout => (
                <Datepicker
                  selected={isValid(filterDates.endDate) ? filterDates.endDate : new Date()}
                  onChange={onSelectDate('startDate', togglePopout)}
                  dateFormat={DATE_FORMAT}
                  inline={true}
                />
              )}
            </PopOut>
            <PopOut
              placement="bottom"
              closeOnOuterClick={true}
              closeOnScroll={true}
              trigger={filterEndDateTrigger}
            >
              {togglePopout => (
                <Datepicker
                  selected={filterDates.endDate}
                  onChange={onSelectDate('endDate', togglePopout)}
                  dateFormat={DATE_FORMAT}
                  inline={true}
                />
              )}
            </PopOut>
          </div>
        </li>
        <li>
          <FilterBar filters={filterBar} onFilter={onFilter} forceUpdate={forceUpdateFilterBar} />
        </li>
      </ul>
    </div>
  )
}

export default memo(RuleFilter)
