import React, { useState, useCallback, memo, ChangeEvent } from 'react'
import { Button, Icon, PopOut, Datepicker, IconButton, Menu, MenuItem } from '@skedulo/sked-ui'
import { cloneDeep, isEqual } from 'lodash'
// import { Button, FilterBar, Icon, PopOut, Datepicker, IconButton, Menu, MenuItem } from '@skedulo/sked-ui'
import { DATE_FORMAT } from '../../commons/constants'
import { useProjectFilter } from './useProjectFilter'
import { format, add } from 'date-fns'
import { SavedFilterSetInterface } from '../../commons/types'
import { FilterBar } from '../../commons/components/filter-bar/FilterBar'

interface ProjectFilterProps {
  onFilterChange: (data: any) => void
  onResetFilter: () => void
  filterParams: any
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({ onResetFilter, onFilterChange, filterParams }) => {
  const {
    filterBar,
    setFilterBar,
    appliedFilter,
    setAppliedFilter,
    savedFilterSets,
    saveFilterSets,
    deleteFilterSet,
  } = useProjectFilter()
  const [filterSetName, setFilterSetName] = useState<string>('')
  const [filterDates, setFilterDates] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date(),
  })
  const [selectedFilterSet, setSelectedFilterSet] = useState<SavedFilterSetInterface | null>(null)

  const resetFilter = React.useCallback(() => {
    const newFilterBar = filterBar.map(filterItem => {
      console.log('filterItem: ', filterItem);
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
    onResetFilter()
    setSelectedFilterSet(null)
  }, [filterBar])

  // revoked once selecting filter date
  const onSelectDate = React.useCallback(
    (fieldName: string) => (value: Date) => {
      if (fieldName === 'startDate') {
        const endDate = filterDates.endDate || add(value, { days: 7 })
        setFilterDates((prev) => ({ ...prev, [fieldName]: value, endDate }))
        onFilterChange({
          [fieldName]: format(value, DATE_FORMAT),
          endDate: format(endDate, DATE_FORMAT),
        })
      }
      if (fieldName === 'endDate') {
        setFilterDates((prev) => ({ ...prev, [fieldName]: value }))
        onFilterChange({ [fieldName]: format(value, DATE_FORMAT) })
      }
      if (selectedFilterSet) {
        setSelectedFilterSet(null)
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

    setSelectedFilterSet(null)
    setAppliedFilter(params)
    onFilterChange({ ...selectedParams })
  }, [])

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

  // the saved filter text
  const myFilterSetsTrigger = useCallback(() => {
    return (
      <div className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mr-2 sk-cursor-pointer sk-px-3 sk-text-neutral-750 hover:sk-bg-blue-100 sk-bg-neutral-200">
        {selectedFilterSet ? selectedFilterSet?.name : 'All filters'}
        <Icon name="chevronDown" size={18} />
      </div>
    )
  }, [selectedFilterSet])

  // the save icon
  const saveFilterTrigger = useCallback(() => {
    return <IconButton tooltipContent="Save filter" icon="bookmark" buttonType="secondary" />
  }, [])

  // revoked once changing filter set name
  const onFilterSetNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilterSetName(e.target.value)
  }, [])

  // select a saved filter set
  const onSelectSavedFilter = useCallback((selectedItem: SavedFilterSetInterface) => {
    if (selectedFilterSet !== selectedItem) {
      const filterObj = cloneDeep(selectedItem)
      const newFilterBar = filterBar.map(filterItem => {
        const matchedItem = filterObj.filterSet?.find((item: any) => item.id === filterItem.id)
        if (matchedItem) {
          return {
            ...filterItem,
            items: filterItem.useFetch ? matchedItem.selectedItems : filterItem.items,
            selectedIds: matchedItem.selectedItems.map((item: any) => item.id)
          }
        }
        return filterItem
      })
      if (!isEqual(filterBar, newFilterBar)) {
        setFilterBar(newFilterBar)
      }
      delete filterObj.id
      delete filterObj.name
      delete filterObj.filterSet
      onFilterChange({ ...filterObj })
      setSelectedFilterSet(selectedItem)
    }
  }, [selectedFilterSet, filterBar])

  // save the current filter set to local storage
  const onSaveFilterSet = useCallback(() => {
    const newFilterSet = {
      ...filterParams,
      name: filterSetName,
      filterSet: appliedFilter,
      id: new Date().valueOf()
    }
    saveFilterSets(newFilterSet)
    setSelectedFilterSet(newFilterSet)
  }, [filterParams, filterSetName, appliedFilter])

  // delete a filter set from local storage
  const onDeleteSavedFilter = useCallback((id: string) => {
    deleteFilterSet(id)
    onFilter([])
  }, [])

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <ul className="menu">
          <li>
            <PopOut
              placement="bottom"
              closeOnOuterClick={true}
              closeOnScroll={true}
              closeOnFirstClick={true}
              trigger={myFilterSetsTrigger}
            >
              {() => (
                <Menu>
                  <MenuItem onClick={resetFilter}>
                    All Projects
                  </MenuItem>
                  {savedFilterSets.map((item) => (
                    <MenuItem key={item.id} className="cx-p-0">
                      <div className="cx-flex cx-justify-between cx-items-center cx-px-3 cx-py-2">
                        {/* tslint:disable-next-line: jsx-no-lambda */}
                        <span className="cx-w-full" onClick={() => onSelectSavedFilter(item)}>
                          {item.name}
                        </span>
                        <Icon
                          name="trash"
                          size={24}
                          className="cx-text-neutral-500 cx-pl-2"
                          /* tslint:disable-next-line: jsx-no-lambda */
                          onClick={() => onDeleteSavedFilter(item.id)}
                        />
                      </div>
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </PopOut>
          </li>
          <li>
            <PopOut placement="bottom" closeOnOuterClick={true} closeOnScroll={true} trigger={saveFilterTrigger}>
              {togglePopout => (
                <div className="cx-p-4 cx-bg-white">
                  <span className="span-label">Filter Set Name</span>
                  <input type="text" value={filterSetName} onChange={onFilterSetNameChange} />
                  <div className="cx-flex cx-justify-end cx-pt-4 border-top cx-bg-white cx-bottom-0">
                    <Button
                      buttonType="secondary"
                      // tslint:disable-next-line: jsx-no-lambda
                      onClick={() => {
                        togglePopout()
                        setFilterSetName('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      buttonType="primary"
                      className="cx-ml-2"
                      // tslint:disable-next-line: jsx-no-lambda
                      onClick={() => {
                        togglePopout()
                        onSaveFilterSet()
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </PopOut>
          </li>
          <li>
            <div className="cx-flex cx-items-center">
              <PopOut
                placement="bottom"
                closeOnOuterClick={true}
                closeOnScroll={true}
                closeOnFirstClick={true}
                trigger={filterStartDateTrigger}
              >
                {() => (
                  <Datepicker
                    selected={filterDates.startDate}
                    onChange={onSelectDate('startDate')}
                    dateFormat={DATE_FORMAT}
                    inline={true}
                  />
                )}
              </PopOut>
              <PopOut
                placement="bottom"
                closeOnOuterClick={true}
                closeOnScroll={true}
                closeOnFirstClick={true}
                trigger={filterEndDateTrigger}
              >
                {() => (
                  <Datepicker
                    selected={filterDates.endDate}
                    onChange={onSelectDate('endDate')}
                    dateFormat={DATE_FORMAT}
                    inline={true}
                  />
                )}
              </PopOut>
            </div>
          </li>
          <li>
            <FilterBar filters={filterBar} onFilter={onFilter} />
          </li>
        </ul>
      </div>
    </div>
  )
}

export default memo(ProjectFilter)
