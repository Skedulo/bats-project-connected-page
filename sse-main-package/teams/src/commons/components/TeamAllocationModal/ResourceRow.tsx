import React, { memo, useMemo } from 'react'
import { Icon, StatusIcon } from '@skedulo/sked-ui'
import classnames from 'classnames'

import { Resource, TeamRequirement, TeamAllocation, Period } from '../../types'

import RowTimeslots from '../RowTimeslots'
import ResourceCard from '../ResourceCard'

interface ResourceRowProps {
  teamRequirement: TeamRequirement
  dateRange: Date[]
  resource: Resource
  teamAllocation: TeamAllocation
  onSelectResource: (value: Resource) => void
  highlightDays: Period
  isFirstRow?: boolean
}

const ResourceRow: React.FC<ResourceRowProps> = ({
  resource,
  teamRequirement,
  teamAllocation,
  dateRange,
  onSelectResource,
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
              onClick={() => onSelectResource(resource)}
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
          highlightDays={highlightDays}
          isFirstRow={!!isFirstRow}
        />
      </div>
    </div>
  )
}

export default memo(ResourceRow)
