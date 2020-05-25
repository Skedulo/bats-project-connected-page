import React, { useEffect, useState, useCallback, memo, useMemo, ChangeEvent } from 'react'
import {
  Button,
  FilterBar,
  Icon,
  PopOut,
  Datepicker,
  IconButton,
  Menu,
  MenuItem,
} from '@skedulo/sked-ui'
import { DATE_FORMAT } from '../../commons/constants'
import { useProjectFilter } from './useProjectFilter'
import { format, add } from 'date-fns'
import { SavedFilterSetInterface } from '../../commons/types'

interface ProjectFilterProps {
  onFilterChange: (data: any) => void
  onResetFilter: () => void
  filterParams: any
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({ onResetFilter, onFilterChange, filterParams }) => {
  const { filterBar, appliedFilter, setAppliedFilter, saveFilterSets, savedFilterSets } = useProjectFilter()
  const [filterSetName, setFilterSetName] = useState<string>('')
  const [filterDates, setFilterDates] = useState<{startDate: Date, endDate: Date}>({
    startDate: new Date(),
    endDate: new Date()
  })
  const [selectedFilter, setSelectedFilter] = useState<SavedFilterSetInterface | null>(null)

  const resetFilter = React.useCallback(() => {
    onResetFilter()
    setSelectedFilter(null)
  }, [])

  const onSelectDate = React.useCallback((fieldName: string) => (value: Date) => {
    if (fieldName === 'startDate') {
      const endDate = filterDates.endDate || add(value, { days: 7 })
      setFilterDates(prev => ({ ...prev, [fieldName]: value, endDate }))
      onFilterChange({
        [fieldName]: format(value, DATE_FORMAT),
        endDate: format(endDate, DATE_FORMAT)
      })
    }
    if (fieldName === 'endDate') {
      setFilterDates(prev => ({ ...prev, [fieldName]: value }))
      onFilterChange({ [fieldName]: format(value, DATE_FORMAT) })
    }
  }, [filterDates.endDate])

  const onFilter = useCallback((params: any) => {
    setAppliedFilter(params)
    const selectedParams: any = {}
    params.forEach((item: any) => {
      selectedParams[item.id] = item.selectedItems.map((selected: any) => selected.id).join(',')
    })
    onFilterChange({ ...selectedParams })
  }, [])

  const onSaveFilterSet = useCallback(() => {
    saveFilterSets(filterSetName, appliedFilter)
  }, [filterSetName, appliedFilter])

  const filterEndDateTrigger = useCallback(() => {
    if (!filterParams.endDate) {
      return <></>
    }
    return (
      <div
        className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mx-2 sk-cursor-pointer sk-px-3 sk-text-neutral-750 hover:sk-bg-blue-100 sk-bg-neutral-200"
      >
        <span>
          End date:
          <span className="cx-font-semibold cx-ml-2">{filterParams.endDate}</span>
        </span>
      </div>
    )
  }, [filterParams.endDate])

  const filterStartDateTrigger = useCallback(() => {
    return (
      <div
        className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mx-2 sk-cursor-pointer sk-px-3 sk-text-neutral-750 hover:sk-bg-blue-100 sk-bg-neutral-200"
      >
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

  const myFilterSetsTrigger = useCallback(() => {
    return (
      <div
        className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mr-2 sk-cursor-pointer sk-px-3 sk-text-neutral-750 hover:sk-bg-blue-100 sk-bg-neutral-200"
      >
        {
          selectedFilter ? selectedFilter?.name : 'My Filters'
        }
        <Icon name="chevronDown" size={18} />
      </div>
    )
  }, [selectedFilter])

  const saveFilterTrigger = useCallback(() => {
    return (
      <IconButton
        tooltipContent="Save filter"
        icon="bookmark"
        buttonType="secondary"
      />
    )
  }, [])

  const onFilterSetNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilterSetName(e.target.value)
  }, [])

  const onSelectSavedFilter = useCallback((item: SavedFilterSetInterface) => {
    if (selectedFilter !== item) {
      setSelectedFilter(item)
      onFilter(item.filterSet)
    }
  }, [])

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <ul className="menu">
          {savedFilterSets.length > 0 && (
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
                    {savedFilterSets.map(item => (
                      <MenuItem key={item.id}>
                        <div onClick={() => onSelectSavedFilter(item)}>{item.name}</div>
                      </MenuItem>
                    ))}
                  </Menu>
                )}
              </PopOut>
            </li>
          )}
          <li>
            <Button buttonType="secondary" onClick={resetFilter}>All Projects</Button>
          </li>
          <li>
            <PopOut
              placement="bottom"
              closeOnOuterClick={true}
              closeOnScroll={true}
              trigger={saveFilterTrigger}
            >
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
