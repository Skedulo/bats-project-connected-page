import React, { memo, useMemo } from 'react'
import { Icon, StatusIcon, ISelectItem } from '@skedulo/sked-ui'
import classnames from 'classnames'

import { Resource, TeamRequirement, TeamAllocation, HighlightDays } from '../../types'

import RowTimeslots from '../RowTimeslots'
import ResourceCard from '../ResourceCard'

interface ResourceRowProps {
  teamRequirement: TeamRequirement
  dateRange: Date[]
  resource: Resource
  teamAllocation: TeamAllocation
  onSelectResource: (value: ISelectItem) => void
  highlightDays: HighlightDays
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
    const formattedTeamAllocations = teamRequirement.allocations?.filter(item => item.resource?.id === resource.id)
      .map((item) => ({
        ...item,
        teamName: teamRequirement.teamName
      })) || []
    if (resource.id !== teamAllocation.resource?.id) {
      return formattedTeamAllocations
    }
    return [
      ...formattedTeamAllocations,
      {
        ...teamAllocation,
        teamName: teamRequirement.teamName
      }]
  }, [teamRequirement, resource, teamAllocation])

  return (
    <div className="cx-grid cx-grid-cols-2/8 cx-bg-white">
      <div className={classnames('cx-flex cx-items-center cx-justify-between cx-border-b cx-border-r cx-px-2 cx-py-3', { 'cx-border-t': isFirstRow })}>
        <ResourceCard
          className="cx-w-full"
          resource={resource}
          actionButton={resource.id !== teamAllocation.resource?.id ? (
            <Icon
              className="cx-text-neutral-600 cx-cursor-pointer hover:cx-text-primary"
              name="plus"
              onClick={() => onSelectResource({ label: resource.name, value: resource.id })}
            />
          ) : (
            <StatusIcon status="success" />
          )}
        />
      </div>
      <div>
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
