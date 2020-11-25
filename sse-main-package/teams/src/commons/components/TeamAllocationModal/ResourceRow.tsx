import React, { memo, useMemo, useCallback } from 'react'
import { Icon, StatusIcon } from '@skedulo/sked-ui'
import classnames from 'classnames'
import { isBefore, isAfter, areIntervalsOverlapping } from 'date-fns'

import { Resource, TeamRequirement, TeamAllocationState, TeamAllocation, Period, SelectedSlot } from '../../types'

import RowTimeslots from '../RowTimeslots'
import ResourceCard from '../ResourceCard'

interface ResourceRowProps {
  teamRequirement: TeamRequirement
  dateRange: Date[]
  resource: Resource
  teamAllocation: TeamAllocation
  setTeamAllocation: (value: React.SetStateAction<TeamAllocationState>) => void
  highlightDays: Period
  isFirstRow?: boolean
}

const ResourceRow: React.FC<ResourceRowProps> = ({
  resource,
  teamRequirement,
  teamAllocation,
  dateRange,
  setTeamAllocation,
  highlightDays,
  isFirstRow
}) => {
  const teamAllocations = useMemo(() => {
    const formattedTeamAllocations = resource.allocations?.filter(item => item.id !== teamAllocation.id) || []
    if (resource.id === teamAllocation.resource?.id) {
      formattedTeamAllocations.push({
        ...teamAllocation,
        isPlanning: true,
        name: teamRequirement.teamName
      })
    }

    return formattedTeamAllocations
  }, [teamRequirement, resource, teamAllocation])

  const suggestion = useMemo(() => {
    const availabilities = resource.availabilities?.filter(item => areIntervalsOverlapping({
      start: new Date(item.startDate),
      end: new Date(item.endDate)
    }, {
      start: highlightDays.startDate,
      end: highlightDays.endDate
    })).map(item => {
      return {
        resource,
        startDate: isBefore(new Date(item.startDate), highlightDays.startDate) ? highlightDays.startDate : new Date(item.startDate),
        endDate: isAfter(new Date(item.endDate), highlightDays.endDate) ? highlightDays.endDate : new Date(item.endDate)
      }
    }) || []

    return {
      id: '',
      name: '',
      availabilities
    }
  }, [resource, highlightDays])

  const onSelectSlot = useCallback((selectedSlot: SelectedSlot) => {
    setTeamAllocation(prev => ({
      ...prev,
      startDateObj: selectedSlot.startDate,
      endDateObj: selectedSlot.endDate,
      resource
    }))
  }, [])

  return (
    <div className="cx-grid cx-grid-cols-2/8 cx-bg-white">
      <div className={classnames('cx-flex cx-items-center cx-justify-between cx-border-b cx-border-r cx-px-2 cx-py-3', {
        'cx-border-t': isFirstRow
      })}>
        <ResourceCard
          className="cx-w-full resource-name"
          resource={resource}
          actionButton={resource.id !== teamAllocation.resource?.id ? (
            <Icon
              className="cx-text-neutral-600 cx-cursor-pointer hover:cx-text-primary"
              name="plus"
              onClick={() => setTeamAllocation(prev => ({ ...prev, resource }))}
            />
          ) : (
            <StatusIcon status="success" />
          )}
        />
      </div>
      <div className="slot-wrapper">
        <RowTimeslots
          dateRange={dateRange}
          teamAllocations={teamAllocations}
          unavailabilities={resource.unavailabilities || []}
          highlightDays={highlightDays}
          isFirstRow={!!isFirstRow}
          suggestion={suggestion}
          onSelectSlot={onSelectSlot}
        />
      </div>
    </div>
  )
}

export default memo(ResourceRow)
