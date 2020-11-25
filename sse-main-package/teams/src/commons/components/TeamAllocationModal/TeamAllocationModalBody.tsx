import React, { FC, memo, useMemo, useCallback, useState, useEffect } from 'react'
import { FormLabel, SearchSelect, Datepicker, FormInputElement, Button, Lozenge, ISelectItem } from '@skedulo/sked-ui'
import { useSelector, useDispatch } from 'react-redux'
import { format, startOfDay, endOfDay, eachDayOfInterval, min, max, isSameDay } from 'date-fns'
import omit from 'lodash/omit'
import pickBy from 'lodash/pickBy'
import debounce from 'lodash/debounce'

import { DATE_FORMAT } from '../../constants'
import { updateAllocatedTeamRequirement, updateSelectedSlot, updateReloadTeamsFlag, updateSuggestions } from '../../../Store/action'
import { State, TeamRequirement, Resource, TeamAllocation, SwimlaneSetting, SelectedSlot, Period } from '../../types'
import { allocateTeamMember, getTeamResources } from '../../../Services/DataServices'
import { useGlobalLoading } from '../GlobalLoading'
import { checkOverlapPeriodString } from '../../utils'

import TimePicker from '../TimePicker'
import SearchBox from '../SearchBox'
import RowTimeslots from '../RowTimeslots'
import WrappedFormInput from '../WrappedFormInput'

import TeamAllocationFilter from './TeamAllocationFilter'
import ResourceRow from './ResourceRow'

interface SelectorProps {
  allocatedTeamRequirement: TeamRequirement | null
  swimlaneSetting: SwimlaneSetting
  selectedPeriod: Period
  selectedSlot: SelectedSlot | null
}

export interface TeamAllocationState extends TeamAllocation {
  startDateObj: Date
  endDateObj: Date
}

const TeamAllocationModalBody: FC = () => {
  const dispatch = useDispatch()
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()

  const { allocatedTeamRequirement, swimlaneSetting, selectedPeriod, selectedSlot } = useSelector<State, SelectorProps>(state => ({
    allocatedTeamRequirement: state.allocatedTeamRequirement,
    swimlaneSetting: state.swimlaneSetting,
    selectedPeriod: state.selectedPeriod,
    selectedSlot: state.selectedSlot
  }))

  if (!allocatedTeamRequirement) {
    return null
  }

  const [searchText, setSearchText] = useState<string>('')
  const [allocationPeriod, setAllocationPeriod] = useState(selectedPeriod)

  const dateRange = useMemo(() => {
    let range = eachDayOfInterval({
      start: allocationPeriod.startDate,
      end: allocationPeriod.endDate
    })
    if (swimlaneSetting.workingHours) {
      range = range.filter(date => {
        const excludeDays = Object.keys(pickBy(swimlaneSetting.workingHours.days, value => !value))
        return !excludeDays.includes(format(date, 'EEEE').toLowerCase())
      })
    }
    return range
  }, [allocationPeriod, swimlaneSetting])

  const [teamAllocation, setTeamAllocation] = useState<TeamAllocationState>({
    startTime: swimlaneSetting.workingHours.startTime,
    endTime: swimlaneSetting.workingHours.endTime,
    startDate: '',
    endDate: '',
    startDateObj: selectedSlot?.startDate || allocationPeriod.startDate,
    endDateObj: selectedSlot?.endDate || allocationPeriod.endDate,
    teamLeader: !!selectedSlot?.teamLeader
  })
  const [matchingResources, setMatchingResources] = useState<Resource[]>([])

  const resourceOptions = useMemo(() => matchingResources.map(item => ({ ...item, value: item.id, label: item.name })), [matchingResources])

  const { displayResources, preferredResource } = useMemo(() => {
    return {
      displayResources: matchingResources.filter(item => item.id !== allocatedTeamRequirement.preferredResource?.id && item.name.toLowerCase().includes(searchText.toLowerCase())),
      preferredResource: matchingResources.find(item => item.id === allocatedTeamRequirement.preferredResource?.id && item.name.toLowerCase().includes(searchText.toLowerCase()))
    }
  }, [matchingResources, allocatedTeamRequirement, searchText])

  const highlightDays = useMemo(() => ({
    startDate: startOfDay(teamAllocation.startDateObj),
    endDate: endOfDay(teamAllocation.endDateObj)
  }), [teamAllocation.startDateObj, teamAllocation.endDateObj])

  const onSearchTextChange = debounce(useCallback((value: string) => {
    setSearchText(value)
  }, []), 700)

  const getMatchingResources = useCallback(async (startDate: Date, endDate: Date) => {
    startGlobalLoading()
    const res = await getTeamResources({
      startDate: format(startDate, DATE_FORMAT),
      endDate: format(endDate, DATE_FORMAT),
      regionIds: allocatedTeamRequirement.regionId || '',
      timezoneSid: allocatedTeamRequirement.timezoneSid,
      tagIds: allocatedTeamRequirement.tags?.map(item => item.tag?.id).join(',') || ''
    })
    endGlobalLoading()
    setMatchingResources(res)
  }, [allocatedTeamRequirement])

  const onAllocationPeriodChange = useCallback((data: Period) => {
    setAllocationPeriod(data)
  }, [])

  const onSelectStartDate = useCallback((date: Date) => {
    if (!date) {
      return
    }
    setTeamAllocation(prev => {
      if (!date || isSameDay(prev.startDateObj, date)) {
        return prev
      }
      return { ...prev, startDateObj: date, endDateObj: max([date, prev.endDateObj]) }
    })
  }, [])

  const onSelectEndDate = useCallback((date: Date) => {
    if (!date) {
      return
    }

    setTeamAllocation(prev => {
      if (!date || isSameDay(prev.endDateObj, date)) {
        return prev
      }
      return { ...prev, endDateObj: date, startDateObj: min([date, prev.startDateObj]) }
    })
  }, [])

  const onTeamLeaderChange = useCallback(value => {
    setTeamAllocation(prev => ({ ...prev, teamLeader: value.target.checked }))
  }, [])

  const onResourceSelectChange = useCallback((selectedResource: ISelectItem) => {
    setTeamAllocation(prev => ({ ...prev, resource: selectedResource ? { ...selectedResource, id: selectedResource.value, name: selectedResource.label } : undefined }))
  }, [matchingResources])

  const onCancel = useCallback(() => {
    dispatch(updateAllocatedTeamRequirement(null))
    dispatch(updateSelectedSlot(null))
  }, [])

  const onSubmit = useCallback(async () => {
    startGlobalLoading()
    const success = await allocateTeamMember({
      ...omit(teamAllocation, 'resource', 'startDateObj', 'endDateObj'),
      resourceId: teamAllocation.resource?.id,
      teamRequirementId: allocatedTeamRequirement.id,
      timezoneSid: allocatedTeamRequirement.timezoneSid,
      teamId: allocatedTeamRequirement.teamId
    })
    endGlobalLoading()
    if (success) {
      onCancel()
      dispatch(updateReloadTeamsFlag(true))
      dispatch(updateSuggestions({}))
    }
  }, [teamAllocation, allocatedTeamRequirement])

  useEffect(() => {
    if (!matchingResources.length) {
      return
    }
    setTeamAllocation(prev => {
      if (selectedSlot) {
        return {
          ...prev,
          startDateObj: selectedSlot.startDate,
          endDateObj: selectedSlot.endDate,
          resource: selectedSlot.resource ? matchingResources.find(item => item.id === selectedSlot.resource?.id) : undefined,
          resourceId: selectedSlot.resource?.id,
          id: selectedSlot.id
        }
      }
      return {
        ...prev,
        resource: undefined,
        resourceId: '',
        id: undefined
      }
    })
  }, [selectedSlot, matchingResources])

  useEffect(() => {
    setTeamAllocation(prev => {
      const startDate = format(teamAllocation.startDateObj, DATE_FORMAT)
      const endDate = format(teamAllocation.endDateObj, DATE_FORMAT)
      const isAllocated = teamAllocation.resource?.allocations?.find(item => item.id !== prev.id && checkOverlapPeriodString({
        start: item.startDate, end: item.endDate
      }, {
        start: startDate, end: endDate
      }))

      const isUnavailable = teamAllocation.resource?.unavailabilities?.find(item => checkOverlapPeriodString({
        start: item.startDate, end: item.endDate
      }, {
        start: startDate, end: endDate
      }))

      return {
        ...prev,
        startDate,
        endDate,
        isAvailable: !isAllocated && !isUnavailable
      }
    })
  }, [teamAllocation.startDateObj, teamAllocation.endDateObj, teamAllocation.resource])

  useEffect(() => {
    getMatchingResources(allocationPeriod.startDate, allocationPeriod.endDate)
  }, [allocationPeriod, getMatchingResources])

  return (
    <div className="cx-h-full">
      <div className="cx-flex" style={{ height: 'calc(100% - 70px)' }}>
        <div className="cx-w-300px cx-h-full cx-p-4 cx-border-r allocation-form">
          <WrappedFormInput
            label="Team"
            value={allocatedTeamRequirement.teamName}
            isReadOnly={false}
            name="Team"
            isRequired={false}
            disabled
          />
          <div className="cx-mb-4">
            <FormLabel>Resource</FormLabel>
            <SearchSelect
              items={resourceOptions}
              onSelectedItemChange={onResourceSelectChange}
              selectedItem={teamAllocation.resource ? { value: teamAllocation.resource.id, label: teamAllocation.resource.name } : undefined}
            />
            {allocatedTeamRequirement.tags?.map(tag => (
              <Lozenge key={tag.tag?.id} className="cx-mt-1 cx-mr-1" label={tag.tag?.name || ''} color="sapphire" icon="tick" theme="solid" />
            ))}
          </div>
          <div className="cx-mb-4">
            <FormInputElement type="checkbox" checked={teamAllocation.teamLeader} onChange={onTeamLeaderChange} />
            <FormLabel className="cx-ml-2">Team leader</FormLabel>
          </div>
          <div className="cx-flex cx-mb-4">
            <Datepicker
              selected={teamAllocation.startDateObj}
              onChange={onSelectStartDate}
              dateFormat={DATE_FORMAT}
              minDate={dateRange[0]}
              maxDate={dateRange[dateRange.length - 1]}
            />
            <TimePicker className="cx-ml-4" onSelect={() => {}} step={60} defaultSelected={teamAllocation.startTime} disabled />
          </div>
          <div className="cx-flex cx-mb-4">
            <Datepicker
              selected={teamAllocation.endDateObj}
              onChange={onSelectEndDate}
              dateFormat={DATE_FORMAT}
              minDate={dateRange[0]}
              maxDate={dateRange[dateRange.length - 1]}
            />
            <TimePicker className="cx-ml-4" onSelect={() => {}} step={60} defaultSelected={teamAllocation.endTime} disabled />
          </div>
        </div>

        <div className="cx-flex-1 cx-overflow-x-scroll">
          <TeamAllocationFilter allocationPeriod={allocationPeriod} onPeriodChange={onAllocationPeriodChange} />
          <div className="cx-grid cx-grid-cols-2/8">
            <div className="cx-border-b cx-border-r">
              <SearchBox
                className="cx-border-t-0 cx-border-r-0 cx-border-l-0"
                placeholder="teams"
                onChange={onSearchTextChange}
                autoFocus={false}
              />
            </div>
            <div>
              <RowTimeslots dateRange={dateRange} highlightDays={highlightDays} unavailabilities={[]} />
            </div>
          </div>
          {preferredResource && (
            <>
              <div className="cx-w-full cx-p-2 cx-font-semibold">Preferred Resource</div>
              <ResourceRow
                resource={preferredResource}
                dateRange={dateRange}
                teamRequirement={allocatedTeamRequirement}
                teamAllocation={teamAllocation}
                setTeamAllocation={setTeamAllocation}
                highlightDays={highlightDays}
                isFirstRow
              />
            </>
          )}
          <div className="cx-w-full cx-p-2 cx-font-semibold">All Resources</div>
          {displayResources.map((resource, index) => (
            <ResourceRow
              key={resource.id}
              resource={resource}
              dateRange={dateRange}
              teamRequirement={allocatedTeamRequirement}
              teamAllocation={teamAllocation}
              setTeamAllocation={setTeamAllocation}
              highlightDays={highlightDays}
              isFirstRow={index === 0}
            />
          ))}
          {!displayResources.length && <div className="cx-text-center cx-p-4">No matching resources found.</div>}
        </div>
      </div>

      <div className="cx-flex cx-justify-end cx-p-4 cx-border-t cx-z-1 cx-bg-white cx-bottom-0 cx-fixed cx-w-full">
        <Button buttonType="secondary" onClick={onCancel}>Cancel</Button>
        <Button buttonType="primary" className="cx-ml-2" type="submit" disabled={!teamAllocation.isAvailable} onClick={onSubmit}>
          Save
        </Button>
      </div>
    </div>
  )
}

export default memo(TeamAllocationModalBody)
