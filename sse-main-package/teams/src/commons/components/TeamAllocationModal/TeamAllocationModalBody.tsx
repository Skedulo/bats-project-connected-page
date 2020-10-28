import React, { FC, memo, useMemo, useCallback, useState, useEffect } from 'react'
import { FormLabel, SearchSelect, Datepicker, FormInputElement, ISelectItem, Button, Lozenge } from '@skedulo/sked-ui'
import { useSelector, useDispatch } from 'react-redux'
import { format, startOfDay, endOfDay } from 'date-fns'
import { intersection, omit } from 'lodash'

import { DATE_FORMAT } from '../../constants'
import { updateAllocatedTeamRequirement, updateSelectedSlot, updateReloadTeamsFlag, updateSuggestions } from '../../../Store/action'
import { State, TeamRequirement, Resource, TeamAllocation, SwimlaneSetting, SelectedSlot } from '../../types'
import { allocateTeamMember } from '../../../Services/DataServices'
import { useGlobalLoading } from '../GlobalLoading'

import TimePicker from '../TimePicker'
import SearchBox from '../SearchBox'
import RowTimeslots from '../RowTimeslots'
import WrappedFormInput from '../WrappedFormInput'

import TeamAllocationFilter from './TeamAllocationFilter'
import ResourceRow from './ResourceRow'

interface SelectorProps {
  allocatedTeamRequirement: TeamRequirement | null
  storeResources: Resource[]
  swimlaneSetting: SwimlaneSetting
  dateRange: Date[]
  selectedSlot: SelectedSlot | null
}

interface TeamAllocationState extends TeamAllocation {
  startDateObj: Date
  endDateObj: Date
}

const TeamAllocationModalBody: FC = () => {
  const dispatch = useDispatch()
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()

  const { allocatedTeamRequirement, storeResources, swimlaneSetting, dateRange, selectedSlot } = useSelector<State, SelectorProps>(state => ({
    allocatedTeamRequirement: state.allocatedTeamRequirement,
    storeResources: state.resources,
    swimlaneSetting: state.swimlaneSetting,
    dateRange: state.dateRange,
    selectedSlot: state.selectedSlot
  }))

  if (!allocatedTeamRequirement) {
    return null
  }

  const [teamAllocation, setTeamAllocation] = useState<TeamAllocationState>({
    startTime: swimlaneSetting.workingHours.startTime,
    endTime: swimlaneSetting.workingHours.endTime,
    startDate: '',
    endDate: '',
    startDateObj: dateRange[0],
    endDateObj: dateRange[dateRange.length - 1],
    teamLeader: false
  })

  const { matchedResources, resourceOptions } = useMemo(() => {
    const requiredTags = allocatedTeamRequirement.tags?.map(item => item.tagId || item.tag?.id).filter(item => !!item) || []
    const matchedResources = storeResources.filter(item => {
      if (allocatedTeamRequirement.preferredResource?.id && item.id === allocatedTeamRequirement.preferredResource.id) {
        return false
      }
      if (!requiredTags.length) {
        return true
      }
      const resourceTags = item.tags?.map(tag => tag.id) || []
      return intersection(requiredTags, resourceTags).length === requiredTags.length
    })

    return {
      matchedResources,
      resourceOptions: matchedResources.map(item => ({ value: item.id, label: item.name }))
    }
  }, [storeResources, allocatedTeamRequirement])

  const highlightDays = useMemo(() => ({
    startDate: startOfDay(teamAllocation.startDateObj),
    endDate: endOfDay(teamAllocation.endDateObj)
  }), [teamAllocation.startDateObj, teamAllocation.endDateObj])

  const onSelectDate = useCallback((fieldName: string) => (date: Date) => {
    setTeamAllocation(prev => ({ ...prev, [fieldName]: date }))
  }, [])

  const onTeamLeaderChange = useCallback(value => {
    setTeamAllocation(prev => ({ ...prev, teamLeader: value.target.checked }))
  }, [])

  const onResourceChange = useCallback((resource: ISelectItem) => {
    setTeamAllocation(prev => ({ ...prev, resource: resource ? { id: resource.value, name: resource.label } : undefined }))
  }, [])

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
    setTeamAllocation(prev => {
      if (selectedSlot) {
        return {
          ...prev,
          startDateObj: selectedSlot.startDate,
          endDateObj: selectedSlot.endDate,
          resource: selectedSlot.resource ? { id: selectedSlot.resource?.id || '', name: selectedSlot.resource?.name || '' } : undefined,
          resourceId: selectedSlot.resource?.id,
          id: selectedSlot.id
        }
      }
      return {
        ...prev,
        startDateObj: dateRange[0],
        endDateObj: dateRange[dateRange.length - 1],
        resource: undefined,
        resourceId: '',
        id: undefined
      }
    })
  }, [selectedSlot, dateRange])

  useEffect(() => {
    setTeamAllocation(prev => ({
      ...prev,
      startDate: format(teamAllocation.startDateObj, DATE_FORMAT)
    }))
  }, [teamAllocation.startDateObj])

  useEffect(() => {
    setTeamAllocation(prev => ({
      ...prev,
      endDate: format(teamAllocation.endDateObj, DATE_FORMAT)
    }))
  }, [teamAllocation.endDateObj])

  return (
    <div className="cx-h-full">
      <div className="cx-flex cx-h-full">
        <div className="cx-w-300px cx-h-full cx-p-4 cx-border-r">
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
              onSelectedItemChange={onResourceChange}
              selectedItem={teamAllocation.resource ? { value: teamAllocation.resource.id, label: teamAllocation.resource.name } : undefined}
            />
            {allocatedTeamRequirement.tags?.map(tag => (
              <Lozenge key={tag.tag?.id} className="cx-mt-1 cx-mr-1" label={tag.tag?.name || ''} color="sapphire" icon="tick" solid />
            ))}
          </div>
          <div className="cx-mb-4">
            <FormInputElement type="checkbox" checked={teamAllocation.teamLeader} onChange={onTeamLeaderChange} />
            <FormLabel className="cx-ml-2">Team leader</FormLabel>
          </div>
          <div className="cx-flex cx-mb-4">
            <Datepicker selected={teamAllocation.startDateObj} onChange={onSelectDate('startDateObj')} dateFormat={DATE_FORMAT} />
            <TimePicker className="cx-ml-4" onSelect={() => {}} step={60} defaultSelected={teamAllocation.startTime} disabled />
          </div>
          <div className="cx-flex cx-mb-4">
            <Datepicker selected={teamAllocation.endDateObj} onChange={onSelectDate('endDateObj')} dateFormat={DATE_FORMAT} />
            <TimePicker className="cx-ml-4" onSelect={() => {}} step={60} defaultSelected={teamAllocation.endTime} disabled />
          </div>
        </div>

        <div className="cx-flex-1 cx-overflow-x-scroll">
          <TeamAllocationFilter onFilterChange={() => {}} />
          <div className="cx-grid cx-grid-cols-2/8">
            <div className="cx-border-b cx-border-r">
              <SearchBox
                className="cx-border-t-0 cx-border-r-0 cx-border-l-0"
                placeholder="teams"
                onChange={() => {}}
                autoFocus={false}
              />
            </div>
            <div>
              <RowTimeslots dateRange={dateRange} highlightDays={highlightDays} />
            </div>
          </div>
          {allocatedTeamRequirement.preferredResource && (
            <>
              <div className="cx-w-full cx-p-2 cx-font-semibold">Preferred Resource</div>
              <ResourceRow
                resource={allocatedTeamRequirement.preferredResource}
                dateRange={dateRange}
                teamRequirement={allocatedTeamRequirement}
                teamAllocation={teamAllocation}
                onSelectResource={onResourceChange}
                highlightDays={highlightDays}
                isFirstRow
              />
            </>
          )}
          <div className="cx-w-full cx-p-2 cx-font-semibold">All Resources</div>
          {matchedResources.map((resource, index) => (
            <ResourceRow
              key={resource.id}
              resource={resource}
              dateRange={dateRange}
              teamRequirement={allocatedTeamRequirement}
              teamAllocation={teamAllocation}
              onSelectResource={onResourceChange}
              highlightDays={highlightDays}
              isFirstRow={index === 0}
            />
          ))}
        </div>
      </div>

      <div className="cx-flex cx-justify-end cx-p-4 cx-border-t  cx-bg-white cx-bottom-0 cx-fixed cx-w-full">
        <Button buttonType="secondary" onClick={onCancel}>Cancel</Button>
        <Button buttonType="primary" className="cx-ml-2" type="submit" disabled={false} onClick={onSubmit}>Save</Button>
      </div>
    </div>
  )
}

export default memo(TeamAllocationModalBody)
